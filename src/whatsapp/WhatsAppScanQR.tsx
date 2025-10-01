import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Shield, Zap } from 'lucide-react';

// Import components
import { Toast } from './components/Toast';
import { SuccessModal } from './components/SuccessModal';
import { AnimatedHeroSection } from './components/AnimatedHeroSection';
import ScanningCamera from '../Verifypage/components/ScanningCamera';
import Navbar from '../components/Navbar';

// Define the toast type
type ToastType = 'success' | 'error' | 'warning' | 'info';

const WhatsAppScanQR: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState({ 
    isVisible: false, 
    message: '', 
    type: 'info' as ToastType 
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleOpenCamera = async () => {
    try {
      setCameraError(null);
      showToast('Opening camera...', 'info');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      
      setIsScanning(true);
      showToast('Camera ready! Point at QR code', 'success');
      
    } catch (error: any) {
      console.error('Camera error:', error);
      const errorMessage = error?.message?.includes('permission') 
        ? 'Camera permission denied. Please allow camera access.'
        : 'Cannot access camera. Please check your device settings.';
      
      setCameraError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const handleCloseCamera = () => {
    setIsScanning(false);
    setCameraError(null);
    showToast('Camera closed', 'info');
  };

  const handleQRCodeDetected = (data: string) => {
    console.log('QR Code detected:', data);
    setScannedData(data);
    setIsScanning(false);
    setShowSuccessModal(true);
    showToast('QR Code scanned successfully!', 'success');
  };

  return (
    <>
      <Navbar activeTab='' />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-15"
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              rotate: [0, -5, 0],
              x: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-15"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, 40, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 4 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10"
          />
        </div>

        {/* Header */}
        <header className="relative z-10 pt-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight"
            >
              WhatsApp
              <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"> QR</span>
              <span className="text-blue-600"> Scanner</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              Instantly scan QR codes and connect seamlessly through WhatsApp with enhanced security
            </motion.p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedHeroSection 
              onScanClick={handleOpenCamera}
              isScanning={isScanning}
            />

            {/* Enhanced Features Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid md:grid-cols-3 gap-8 mt-16"
            >
              {[
                { 
                  icon: Camera, 
                  title: 'Real-time Scanning', 
                  desc: 'Advanced QR detection with live camera feed',
                  color: 'from-orange-500 to-orange-400'
                },
                { 
                  icon: Shield, 
                  title: 'Secure Transaction', 
                  desc: 'Encrypted hash verification for safe transfers',
                  color: 'from-green-500 to-green-400'
                },
                { 
                  icon: Zap, 
                  title: 'Instant Connect', 
                  desc: 'Direct WhatsApp integration in one click',
                  color: 'from-blue-500 to-blue-400'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 group"
                >
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Camera Component */}
        <ScanningCamera
          isScanning={isScanning}
          onClose={handleCloseCamera}
          onQRCodeDetected={handleQRCodeDetected}
          cameraError={cameraError}
        />

        {/* Toast */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={closeToast}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          qrData={scannedData}
        />
      </div>
    </>
  );
};

export default WhatsAppScanQR;