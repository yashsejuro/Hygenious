
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-600 mb-6">
                    We encountered an unexpected error. Our team has been notified.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                    >
                        Go Home
                    </Button>
                    <Button onClick={() => reset()}>
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
