import { NextResponse } from 'next/server';

/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting requests per IP address.
 * Uses in-memory storage (suitable for single-instance deployments).
 * For multi-instance deployments, use Redis-based rate limiting.
 * 
 * Rate Limits:
 * - General API: 60 requests per minute per IP
 * - Analyze endpoint: 10 requests per minute per IP (AI analysis is expensive)
 * - Auth endpoints: 20 requests per minute per IP
 */

// In-memory rate limit store
// For production with multiple instances, use Redis instead
const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.lastCleanup > 300000) { // 5 minutes
            // Remove entries older than 1 minute
            data.requests = data.requests.filter(time => now - time < 60000);
            if (data.requests.length === 0) {
                rateLimitStore.delete(key);
            } else {
                data.lastCleanup = now;
            }
        }
    }
}, 300000);

function getRateLimitConfig(pathname) {
    // Different limits for different endpoints
    if (pathname.includes('/api/analyze')) {
        return { maxRequests: 10, windowMs: 60000 }; // 10 per minute for AI analysis
    }
    if (pathname.includes('/api/auth/')) {
        return { maxRequests: 20, windowMs: 60000 }; // 20 per minute for auth
    }
    // Default limit for other endpoints
    return { maxRequests: 60, windowMs: 60000 }; // 60 per minute for general API
}

export function middleware(request) {
    // Skip rate limiting for static files and Next.js internals
    const pathname = request.nextUrl.pathname;
    
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/health') || // Health check should not be rate limited
        pathname.startsWith('/static/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Only apply rate limiting to API routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Get client IP address
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Get rate limit configuration for this endpoint
    const config = getRateLimitConfig(pathname);
    const key = `${ip}-${pathname}`;
    const now = Date.now();

    // Get or create rate limit data for this IP+endpoint
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData) {
        rateLimitData = {
            requests: [],
            lastCleanup: now
        };
        rateLimitStore.set(key, rateLimitData);
    }

    // Filter out requests outside the time window
    rateLimitData.requests = rateLimitData.requests.filter(
        time => now - time < config.windowMs
    );

    // Check if limit exceeded
    if (rateLimitData.requests.length >= config.maxRequests) {
        const retryAfter = Math.ceil(
            (rateLimitData.requests[0] + config.windowMs - now) / 1000
        );

        return NextResponse.json(
            {
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfter: retryAfter
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(now + config.windowMs).toISOString()
                }
            }
        );
    }

    // Add current request timestamp
    rateLimitData.requests.push(now);

    // Add rate limit headers to response
    const remaining = config.maxRequests - rateLimitData.requests.length;
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(now + config.windowMs).toISOString());

    return response;
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/api/:path*',
    ],
};
