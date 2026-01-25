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
import FeedbackSection from '@/components/FeedbackSection';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/animated-background';
import CertificateView from '@/components/CertificateView';

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

  // Animate progress with phases
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          // Phase 1: Uploading (Fast to 30%)
          if (loadingStatus === 'Uploading...') {
            if (prev >= 30) return 30;
            return prev + 5;
          }
          // Phase 2: Analyzing (Medium to 85%)
          if (loadingStatus === 'Analyzing...') {
            if (prev >= 85) return 85;
            return prev + 0.5; // Slow crawl while AI thinks
          }
          // Phase 3: Finalizing (Fast to 95%)
          if (loadingStatus === 'Finalizing...') {
            if (prev >= 95) return 95;
            return prev + 2;
          }
          return prev;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading, loadingStatus]);

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
    setLoadingStatus('Uploading...');

    try {
      // Simulate slightly longer upload feel or wait for real encoding
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Artificial short delay to let "Uploading" animation play slightly
      await new Promise(r => setTimeout(r, 600));

      setLoadingStatus('Analyzing...');

      // Get Firebase ID token
      const firebaseToken = await getToken();
      if (!firebaseToken) throw new Error('Please log in to create an audit');

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
        setLoadingStatus('Finalizing...');
        setProgress(100);

        // Wait a moment for the user to see "100%" and "Finalizing"
        await new Promise(r => setTimeout(r, 800));

        setResult(data.data.result);
        setAuditId(data.data.auditId);

        if (data.data.result.overallScore >= 70) {
          const certData = {
            facilityName: facilityName,
            location: location,
            score: data.data.result.overallScore,
            grade: getScoreGrade(data.data.result.overallScore),
            auditId: data.data.auditId,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            certificateNumber: `HYG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          };
          setCertificateData(certData);
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
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred during analysis',
        variant: 'destructive'
      });
    } finally {
      // Small delay ensuring the transition out is smooth
      setTimeout(() => setLoading(false), 200);
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
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
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
    // TODO: Implement certificate generation API
    toast({
      title: 'Coming soon',
      description: 'Certificate generation is not implemented yet.',
      variant: 'destructive'
    });
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
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              key="loader-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-md"
            >
              <GlassCard hover={false} className="p-8 text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <motion.div
                    className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 border-4 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Analyzing hygiene standards and identifying issues...
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>{loadingStatus}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <Button variant="ghost" size="sm">
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
                  className="w-full"
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
                {/* Loading State Removed - using overlay */}
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
                        {result.overallScore}/100
                      </div>
                      <div className="text-2xl font-semibold text-gray-600 mt-2">
                        {getScoreLabel(result.overallScore)}
                      </div>
                      <div className="text-lg text-gray-500 mt-1">
                        Grade: {getScoreGrade(result.overallScore)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{result.cleanliness}</div>
                        <div className="text-sm text-gray-600">Cleanliness</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{result.organization}</div>
                        <div className="text-sm text-gray-600">Organization</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{result.safety}</div>
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

            {/* Feedback Section */}
            <FeedbackSection scanId={auditId} />

            {/* Actions */}
            <div className="flex gap-4 justify-center print:hidden">
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  View All Audits
                </Button>
              </Link>
              <Button onClick={handleReset} size="lg">
                Analyze Another
              </Button>
            </div>
          </div>
        )}
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