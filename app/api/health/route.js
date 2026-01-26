
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

/**
 * Health Check Endpoint
 * 
 * Verifies that critical services are operational:
 * - Database connectivity
 * - Database response time
 * 
 * Returns 503 (Service Unavailable) if any critical service is down.
 */
export async function GET() {
    const startTime = Date.now();
    const healthStatus = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            database: {
                status: 'unknown',
                responseTime: null,
                error: null
            }
        }
    };

    // Check database connectivity
    try {
        const { db } = await connectToDatabase();
        
        // Actually ping the database to verify connection
        await db.admin().ping();
        
        const dbResponseTime = Date.now() - startTime;
        healthStatus.checks.database = {
            status: 'connected',
            responseTime: `${dbResponseTime}ms`
        };
    } catch (error) {
        healthStatus.success = false;
        healthStatus.status = 'unhealthy';
        healthStatus.checks.database = {
            status: 'disconnected',
            error: error.message
        };
        
        // Return 503 Service Unavailable if database is down
        return NextResponse.json(healthStatus, { status: 503 });
    }

    // Add overall response time
    healthStatus.responseTime = `${Date.now() - startTime}ms`;

    return NextResponse.json(healthStatus, { status: 200 });
}
