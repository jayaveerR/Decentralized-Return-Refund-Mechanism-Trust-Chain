import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle, ExternalLink, Smartphone, QrCode, Shield, Zap, Send } from 'lucide-react';
import ScanningCamera from '../components/ScanningCamera';
import Navbar from '../components/Navbar';

// Toast Component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return { 
          bg: 'bg-green-500', 
          icon: <CheckCircle className="w-5 h-5" />,
          border: 'border-green-400'
        };
      case 'error':
        return { 
          bg: 'bg-red-500', 
          icon: <AlertCircle className="w-5 h-5" />,
          border: 'border-red-400'
        };
      case 'warning':
        return { 
          bg: 'bg-orange-500', 
          icon: <AlertCircle className="w-5 h-5" />,
          border: 'border-orange-400'
        };
      case 'info':
        return { 
          bg: 'bg-blue-500', 
          icon: <Smartphone className="w-5 h-5" />,
          border: 'border-blue-400'
        };
      default:
        return { 
          bg: 'bg-gray-500', 
          icon: null,
          border: 'border-gray-400'
        };
    }
  };

  const config = getToastConfig();

  return (
   
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`
            fixed top-4 right-4 z-50
            ${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl 
            flex items-center space-x-3 backdrop-blur-sm bg-opacity-95 
            min-w-80 border ${config.border}
          `}
        >
          {config.icon}
          <span className="font-medium flex-1">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Success Modal Component
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, qrData }) => {
  const openWhatsApp = () => {
    let whatsappUrl = qrData;
    
    if (/^\d+$/.test(qrData)) {
      whatsappUrl = `https://wa.me/${qrData}`;
    } 
    else if (qrData.includes('wa.me') || qrData.includes('whatsapp.com')) {
      whatsappUrl = qrData;
    }
    else if (qrData.startsWith('http')) {
      whatsappUrl = qrData;
    }
    else {
      whatsappUrl = `https://wa.me/${qrData.replace(/\D/g, '')}`;
    }
    
    window.open(whatsappUrl, '_blank');
  };

  const extractDisplayData = (data: string) => {
    if (data.includes('wa.me')) {
      const match = data.match(/wa\.me\/(\d+)/);
      return match ? `+${match[1]}` : data;
    }
    return data.length > 30 ? `${data.substring(0, 30)}...` : data;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                QR Code Scanned Successfully!
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                Ready to connect on WhatsApp
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <QrCode className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Scanned Data:</span>
                </div>
                <p className="text-sm text-gray-600 break-all font-mono">
                  {extractDisplayData(qrData)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex space-x-3"
              >
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium hover:border-gray-400 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={openWhatsApp}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open WhatsApp</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Enhanced Hero Section with Better Animations
const AnimatedHeroSection = () => {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['SCAN', 'VERIFY', 'CONNECT'];
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 1500);

    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);

    return () => {
      clearInterval(wordInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <>
   
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-12 shadow-2xl border border-white/40"
    >
      <div className="text-center mb-8">
        {/* Enhanced Header with Typing Animation */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center space-x-4 mb-4"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-orange-500 rounded-full"
            />
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
              <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                {words[currentWord]}
              </span>
              <span className="text-gray-900 ml-3">QR CODE</span>
            </motion.h2>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="w-4 h-4 bg-blue-500 rounded-full"
            />
          </motion.div>

          {/* Subtitle with Enhanced Styling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center space-x-3"
          >
            <Send className="w-5 h-5 text-orange-500" />
            <p className="text-xl font-semibold text-gray-700">
              Transaction Hash Sending Owner
            </p>
            <Shield className="w-5 h-5 text-green-500" />
          </motion.div>
        </div>

        {/* Enhanced QR Scanner Preview */}
        <div className="relative inline-block mb-6">
          <motion.div
            animate={{ 
              scale: pulse ? 1.02 : 1,
              boxShadow: pulse 
                ? '0 0 60px rgba(249, 115, 22, 0.3)' 
                : '0 0 30px rgba(59, 130, 246, 0.2)'
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-72 h-72 border-4 border-orange-400 rounded-3xl bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center relative overflow-hidden"
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  className="absolute w-full h-px bg-gray-400"
                  style={{ top: `${(i + 1) * 12.5}%` }}
                />
              ))}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, delay: i * 0.2 + 1, repeat: Infinity }}
                  className="absolute h-full w-px bg-gray-400"
                  style={{ left: `${(i + 1) * 12.5}%` }}
                />
              ))}
            </div>

            {/* Central QR Animation */}
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 border-4 border-dashed border-orange-300 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [0.8, 1, 0.8],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-200 to-blue-200 rounded-lg relative overflow-hidden"
                >
                  {/* QR Pattern Simulation */}
                  <div className="absolute inset-2 grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          backgroundColor: i % 2 === 0 ? '#fdba74' : '#93c5fd',
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          delay: i * 0.1,
                          repeat: Infinity 
                        }}
                        className="rounded-sm"
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-bold text-gray-800"
              >
                {pulse ? 'READY TO SCAN' : 'POINT CAMERA'}
              </motion.p>
            </div>

            {/* Enhanced Scanning Line */}
            <motion.div
              animate={{ y: [0, 288, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
            />
            
            {/* Corner Animations */}
            {[
              { top: -2, left: -2, border: 'border-t-4 border-l-4' },
              { top: -2, right: -2, border: 'border-t-4 border-r-4' },
              { bottom: -2, left: -2, border: 'border-b-4 border-l-4' },
              { bottom: -2, right: -2, border: 'border-b-4 border-r-4' }
            ].map((corner, index) => (
              <motion.div
                key={index}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  delay: index * 0.5,
                  repeat: Infinity 
                }}
                className={`absolute w-8 h-8 border-orange-500 ${corner.border}`}
                style={{ 
                  top: corner.top, 
                  left: corner.left, 
                  right: corner.right, 
                  bottom: corner.bottom 
                }}
              />
            ))}
          </motion.div>

          {/* Floating Icons */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg"
          >
            <Zap className="w-6 h-6" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
          >
            <Shield className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center space-x-3 mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
          <span className="text-lg font-semibold text-gray-700">
            Secure • Fast • Reliable
          </span>
          <motion.div
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="w-3 h-3 bg-orange-500 rounded-full"
          />
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

// Main Component
const WhatsAppScanQR: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' as const });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
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
       <Navbar activeTab='sendtranaction hash' />

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
          <AnimatedHeroSection />

          {/* Scan Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCamera}
              disabled={isScanning}
              className={`
                relative inline-flex items-center justify-center px-16 py-5 text-xl font-black text-white rounded-2xl
                transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-300 cursor-pointer
                border-2 border-transparent
                ${isScanning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-2xl'
                }
              `}
            >
              {isScanning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                  />
                  <span className="text-lg">INITIALIZING CAMERA...</span>
                </>
              ) : (
                <>
                  <Camera className="w-7 h-7 mr-4" />
                  <span className="text-lg">START QR SCANNING</span>
                </>
              )}
              
              {/* Enhanced Button Shine Effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              />
            </motion.button>
          </motion.div>

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
    
  );
};

export default WhatsAppScanQR;