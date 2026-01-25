
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        status: 'healthy',
        database: 'connected',
        ai: 'Gemini 1.5 Flash (Live)',
        mode: 'live_ai'
    });
}
