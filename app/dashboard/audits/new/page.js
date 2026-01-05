'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, Camera, CheckCircle, AlertCircle, Download, Award, Share2, Printer, X, SwitchCamera, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import QRCode from 'qrcode';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/ui/page-transition';
import { AnimatedScore } from '@/components/ui/animated-score';
import { ScoreBadge } from '@/components/ui/score-badge';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function NewAuditContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState('Kitchen');
  const [facilityName, setFacilityName] = useState('');
  const [areaNotes, setAreaNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Webcam states
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const { toast } = useToast();
  const { getToken } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // Animate progress while loading
  useEffect(() => {
    if (loading) {
      // Skip animation if user prefers reduced motion
      if (prefersReducedMotion) {
        setProgress(90);
        return;
      }
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading, prefersReducedMotion]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to capture images',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result);
          };
          reader.readAsDataURL(file);
          
          // Close camera after capture
          setShowCamera(false);
          stopCamera();
          
          toast({
            title: 'Photo captured!',
            description: 'Your image is ready to analyze'
          });
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const openCamera = () => {
    setShowCamera(true);
    setTimeout(() => startCamera(), 100);
  };

  const closeCamera = () => {
    setShowCamera(false);
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPG, PNG, WEBP)',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 10MB',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image to analyze',
        variant: 'destructive'
      });
      return;
    }

    if (!facilityName.trim()) {
      toast({
        title: 'Facility name required',
        description: 'Please enter the facility name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // Get Firebase ID token
        const firebaseToken = await getToken();
        if (!firebaseToken) {
          toast({
            title: 'Authentication Error',
            description: 'Please log in to create an audit',
            variant: 'destructive'
          });
          return;
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firebaseToken}`
          },
          body: JSON.stringify({
            image: base64Image,
            location,
            facilityName,
            areaNotes
          })
        });

        const data = await response.json();

        if (data.success) {
          setProgress(100);
          
          setResult(data.data.result);
          setAuditId(data.data.auditId);
          
          // Generate certificate data if score is good
          if (data.data.result.overallScore >= 70) {
            const certData = {
              facilityName: facilityName,
              location: location,
              score: data.data.result.overallScore,
              grade: getScoreGrade(data.data.result.overallScore),
              auditId: data.data.auditId,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              certificateNumber: `HYG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            };
            setCertificateData(certData);
            
            // Generate QR Code
            generateQRCode(certData);
          }
          
          toast({
            title: 'Analysis complete!',
            description: data.data.result.overallScore >= 70 
              ? 'Your hygiene audit has been completed. Certificate available!'
              : 'Your hygiene audit has been completed successfully.'
          });
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred during analysis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (certData) => {
    try {
      const verificationData = {
        certificateNumber: certData.certificateNumber,
        facilityName: certData.facilityName,
        location: certData.location,
        score: certData.score,
        grade: certData.grade,
        date: certData.date,
        validUntil: certData.validUntil,
        verifyUrl: `${window.location.origin}/verify/${certData.certificateNumber}`
      };

      const qrDataUrl = await QRCode.toDataURL(
        JSON.stringify(verificationData),
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }
      );

      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview('');
    setResult(null);
    setAuditId(null);
    setCertificateData(null);
    setQrCodeUrl('');
    setLocation('Kitchen');
    setFacilityName('');
    setAreaNotes('');
    setProgress(0);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await fetch('/api/certificate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...certificateData,
          qrCode: qrCodeUrl
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Hygiene-Certificate-${certificateData.certificateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Certificate downloaded!',
          description: 'Your hygiene certificate has been downloaded successfully.'
        });
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download certificate. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hygiene Excellence Certificate',
          text: `${certificateData.facilityName} achieved a hygiene score of ${certificateData.score}/100!`,
          url: `${window.location.origin}/verify/${certificateData.certificateNumber}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/verify/${certificateData.certificateNumber}`);
      toast({
        title: 'Link copied!',
        description: 'Certificate verification link copied to clipboard.'
      });
    }
  };

  const printCertificate = () => {
    window.print();
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <Button
              onClick={closeCamera}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Video Feed */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
                style={{ maxHeight: '70vh' }}
              />
              
              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    onClick={capturePhoto}
                    disabled={!isCameraActive}
                    size="lg"
                    className="rounded-full h-16 w-16 bg-white hover:bg-gray-100"
                  >
                    <Camera className="h-8 w-8 text-gray-900" />
                  </Button>
                </div>
                <p className="text-white text-center mt-4 text-sm">
                  Position the area in the frame and click to capture
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create New Audit</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!result ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload or Capture Image</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of the area you want to audit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera and Upload Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={openCamera}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Open Camera
                  </Button>
                  <Button
                    onClick={() => document.getElementById('file-input').click()}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </Button>
                </div>

                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {preview ? (
                    <div className="space-y-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full h-64 object-contain mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Click to replace or drag and drop</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Upload className="h-12 w-12 text-gray-400" />
                          <Camera className="h-6 w-6 text-gray-400 absolute -bottom-1 -right-1" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-600">JPG, PNG, or WEBP (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Details Section */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Details</CardTitle>
                <CardDescription>
                  Provide additional information about the audit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facility-name">Facility Name *</Label>
                  <Input
                    id="facility-name"
                    placeholder="e.g., Grand Plaza Restaurant"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Type</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kitchen">Kitchen</SelectItem>
                      <SelectItem value="Restroom">Restroom</SelectItem>
                      <SelectItem value="Dining Area">Dining Area</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Area Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any specific notes or context about this area..."
                    value={areaNotes}
                    onChange={(e) => setAreaNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading || !facilityName.trim()}
                  className="w-full transition-all hover:scale-105 active:scale-95"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>

                {/* Loading State */}
                {loading && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Animated Icon */}
                        <div className="flex justify-center">
                          <div className="relative">
                            <Brain className="h-16 w-16 text-blue-600 animate-pulse" />
                            <div className="absolute inset-0 animate-ping">
                              <Brain className="h-16 w-16 text-blue-400 opacity-75" />
                            </div>
                          </div>
                        </div>

                        {/* Main Message */}
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            AI Analysis in Progress
                          </h3>
                          <p className="text-sm text-gray-600">
                            Our AI is examining your image for hygiene standards...
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-center text-gray-500">
                            {Math.round(progress)}% complete
                          </p>
                        </div>

                        {/* Loading Dots */}
                        <div className="flex justify-center space-x-1">
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>

                        {/* Info Text */}
                        <p className="text-xs text-center text-gray-500 pt-2">
                          This may take 5-15 seconds depending on image size
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Results Section (keeping your existing results display)
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Score Display */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <img
                      src={preview}
                      alt="Analyzed image"
                      className="w-64 h-64 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                        <AnimatedScore score={result.overallScore} />
                        <span className="text-3xl">/100</span>
                      </div>
                      <div className="text-2xl font-semibold text-gray-600 mt-2">
                        {getScoreLabel(result.overallScore)}
                      </div>
                      <div className="text-lg text-gray-500 mt-1">
                        Grade: {getScoreGrade(result.overallScore)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center space-y-2">
                        <ScoreBadge score={result.cleanliness} size="md" />
                        <div className="text-sm text-gray-600">Cleanliness</div>
                      </div>
                      <div className="text-center space-y-2">
                        <ScoreBadge score={result.organization} size="md" />
                        <div className="text-sm text-gray-600">Organization</div>
                      </div>
                      <div className="text-center space-y-2">
                        <ScoreBadge score={result.safety} size="md" />
                        <div className="text-sm text-gray-600">Safety</div>
                      </div>
                    </div>

                    {/* Certificate Button */}
                    {certificateData && (
                      <div className="pt-4 border-t">
                        <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
                          <DialogTrigger asChild>
                            <Button className="w-full" size="lg" variant="default">
                              <Award className="h-5 w-5 mr-2" />
                              View Certificate
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <CertificateView 
                              data={certificateData} 
                              qrCodeUrl={qrCodeUrl}
                              onDownload={downloadCertificate}
                              onShare={shareCertificate}
                              onPrint={printCertificate}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{result.assessment}</p>
              </CardContent>
            </Card>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detected Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                              <h4 className="font-semibold">{issue.type}</h4>
                            </div>
                            <p className="text-gray-700 text-sm">{issue.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>
                        {issue.confidence && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Confidence</span>
                              <span>{issue.confidence}%</span>
                            </div>
                            <Progress value={issue.confidence} className="h-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center print:hidden">
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  View All Audits
                </Button>
              </Link>
              <Button onClick={handleReset} size="lg" className="transition-all hover:scale-105 active:scale-95">
                Analyze Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

// Certificate Component (keeping your existing certificate component)
function CertificateView({ data, qrCodeUrl, onDownload, onShare, onPrint }) {
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

export default function NewAuditPage() {
  return (
    <ProtectedRoute>
      <NewAuditContent />
    </ProtectedRoute>
  );
}