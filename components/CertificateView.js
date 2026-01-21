import React from 'react';
import { Award, Download, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CertificateView({ data, qrCodeUrl, onDownload, onShare, onPrint }) {
    const colors = {
        primary: data.score >= 90 ? '#10b981' : data.score >= 85 ? '#3b82f6' : data.score >= 70 ? '#8b5cf6' : '#f59e0b',
        secondary: data.score >= 90 ? '#d1fae5' : data.score >= 85 ? '#dbeafe' : data.score >= 70 ? '#ede9fe' : '#fef3c7',
        accent: data.score >= 90 ? '#047857' : data.score >= 85 ? '#1d4ed8' : data.score >= 70 ? '#6d28d9' : '#d97706'
    };

    return (
        <div className="space-y-6">
            <DialogHeader>
                <DialogTitle>Hygiene Excellence Certificate</DialogTitle>
            </DialogHeader>

            <div
                className="bg-white p-12 rounded-lg border-8 relative overflow-hidden print:border-4"
                style={{ borderColor: colors.primary }}
            >
                <div className="absolute inset-0 opacity-5" style={{ backgroundColor: colors.secondary }}>
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
              repeating-linear-gradient(45deg, ${colors.primary} 0, ${colors.primary} 1px, transparent 0, transparent 50%),
              repeating-linear-gradient(-45deg, ${colors.primary} 0, ${colors.primary} 1px, transparent 0, transparent 50%)
            `,
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>

                <div className="relative z-10">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <Award className="h-20 w-20" style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Certificate of Excellence</h1>
                        <p className="text-lg text-gray-600">Hygiene Standards Achievement</p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 my-6">
                        <div className="h-px w-24" style={{ backgroundColor: colors.primary }}></div>
                        <Award className="h-4 w-4" style={{ color: colors.primary }} />
                        <div className="h-px w-24" style={{ backgroundColor: colors.primary }}></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        <div className="flex flex-col items-center space-y-3">
                            {qrCodeUrl && (
                                <>
                                    <div className="bg-white p-3 rounded-lg border-4" style={{ borderColor: colors.primary }}>
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 text-center">
                                        Scan to verify
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-lg text-gray-600">This certifies that</p>
                            <h2 className="text-3xl font-bold text-gray-900 border-b-2 pb-2 inline-block" style={{ borderColor: colors.primary }}>
                                {data.facilityName}
                            </h2>
                            <p className="text-lg text-gray-600">has successfully achieved</p>

                            <div className="py-4">
                                <div
                                    className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-8"
                                    style={{ borderColor: colors.primary, backgroundColor: colors.secondary }}
                                >
                                    <div className="text-4xl font-bold" style={{ color: colors.accent }}>
                                        {data.score}
                                    </div>
                                    <div className="text-xs text-gray-600">out of 100</div>
                                    <div className="text-xl font-bold mt-1" style={{ color: colors.accent }}>
                                        {data.grade}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-600 font-semibold">Location Type</p>
                                <p className="text-gray-900">{data.location}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-600 font-semibold">Audit Date</p>
                                <p className="text-gray-900">{data.date}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-600 font-semibold">Valid Until</p>
                                <p className="text-gray-900">{data.validUntil}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 text-center" style={{ borderColor: colors.secondary }}>
                        <p className="text-sm text-gray-600">Certificate Number</p>
                        <p className="text-lg font-mono font-semibold" style={{ color: colors.accent }}>
                            {data.certificateNumber}
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-12 text-sm">
                        <div className="border-t-2 border-gray-300 pt-2 text-center">
                            <p className="font-semibold">Authorized Signature</p>
                            <p className="text-gray-600">Hygenious AI Platform</p>
                        </div>
                        <div className="border-t-2 border-gray-300 pt-2 text-center">
                            <p className="font-semibold">Date of Issue</p>
                            <p className="text-gray-600">{data.date}</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
                        <p>This certificate is digitally verified and can be authenticated at</p>
                        <p className="font-mono text-gray-700">hygenious.app/verify/{data.certificateNumber}</p>
                        <p className="text-gray-400 mt-2">Powered by Hygenious AI • Certificate authenticity guaranteed</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center print:hidden">
                <Button onClick={onDownload} variant="default" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                </Button>
                <Button onClick={onPrint} variant="outline" size="lg">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                </Button>
                <Button onClick={onShare} variant="outline" size="lg">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </div>

            <div className="text-center space-y-2 print:hidden">
                <p className="text-sm text-gray-600">
                    <strong>QR Code contains:</strong> Certificate number, facility details, scores, and verification URL
                </p>
                <p className="text-xs text-gray-500">
                    Anyone can scan this QR code to instantly verify the authenticity of this certificate
                </p>
            </div>
        </div>
    );
}
