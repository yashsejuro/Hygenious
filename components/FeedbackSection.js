import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';


import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function FeedbackSection({ scanId }) {
    const [accuracy, setAccuracy] = useState(85);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, getToken } = useAuth();

    const handleSubmit = async () => {
        if (!scanId) {
            toast({
                title: 'Error',
                description: 'Scan ID is missing. Cannot submit feedback.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await getToken();
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    scanId,
                    accuracy,
                    feedback,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Thank you!',
                    description: 'Your feedback has been recorded.',
                });
                setFeedback(''); // Clear feedback
            } else {
                throw new Error(data.error || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast({
                title: 'Submission Failed',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAccuracyLabel = (value) => {
        if (value >= 90) return { text: 'Highly Accurate', color: 'text-green-600', icon: CheckCircle2 };
        if (value >= 70) return { text: 'Mostly Accurate', color: 'text-yellow-600', icon: AlertCircle };
        if (value >= 50) return { text: 'Somewhat Accurate', color: 'text-orange-600', icon: AlertCircle };
        return { text: 'Not Accurate', color: 'text-red-600', icon: XCircle };
    };

    const label = getAccuracyLabel(accuracy);
    const LabelIcon = label.icon;

    return (
        <Card className="border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">How accurate was this analysis?</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Header Status */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-600 text-sm">
                            Your feedback helps improve our AI accuracy over time
                        </p>
                        <div className={`flex items-center gap-2 ${label.color} font-semibold`}>
                            <LabelIcon className="w-5 h-5" />
                            <span>{label.text}</span>
                        </div>
                    </div>
                </div>

                {/* Slider */}
                <div className="mb-8 px-2">
                    <div className="relative">
                        {/* Gradient Track */}
                        <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 shadow-sm"></div>

                        {/* Slider Input */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={accuracy}
                            onChange={(e) => setAccuracy(parseInt(e.target.value))}
                            className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer z-10"
                        />

                        {/* Thumb */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border-4 border-slate-700 cursor-pointer transition-all duration-200 hover:scale-110 pointer-events-none"
                            style={{ left: `calc(${accuracy}% - 16px)` }}
                        >
                            {/* Inner dot */}
                            <div className="absolute inset-0 rounded-full bg-slate-100 opacity-20"></div>
                        </div>
                    </div>

                    {/* Scale Labels */}
                    <div className="flex justify-between mt-4 text-xs text-slate-500 font-medium">
                        <span>0% Not Accurate</span>
                        <span className="text-xl font-bold text-slate-900">{accuracy}%</span>
                        <span>100% Perfect</span>
                    </div>
                </div>

                {/* Quick Feedback Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setAccuracy(100)}
                        className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                        <ThumbsUp className="w-5 h-5" />
                        Spot On
                    </button>
                    <button
                        onClick={() => setAccuracy(30)}
                        className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium py-3 rounded-xl transition-all duration-200"
                    >
                        <ThumbsDown className="w-5 h-5" />
                        Way Off
                    </button>
                </div>

                {/* Additional Comments */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Additional Comments (Optional)
                    </label>
                    <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What did we miss? What was wrong?"
                        className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 min-h-[100px]"
                    />
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-6 rounded-xl shadow-md"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>

                <p className="text-center text-xs text-slate-500 mt-4">
                    🔒 Your feedback is anonymous and helps train our AI
                </p>
            </CardContent>
        </Card>
    );
}
