import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ExternalLink, QrCode } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, qrData }) => {
  const openWhatsApp = () => {
    let phoneNumber = '';
    
    // Extract phone number from various formats
    if (/^\d+$/.test(qrData)) {
      phoneNumber = qrData;
    } 
    else if (qrData.includes('wa.me')) {
      const match = qrData.match(/wa\.me\/(\d+)/);
      phoneNumber = match ? match[1] : qrData.replace(/\D/g, '');
    }
    else if (qrData.includes('whatsapp.com')) {
      const match = qrData.match(/whatsapp\.com\/.*?(\d+)/);
      phoneNumber = match ? match[1] : qrData.replace(/\D/g, '');
    }
    else {
      phoneNumber = qrData.replace(/\D/g, '');
    }
    
    // Remove any leading zeros and ensure proper format
    phoneNumber = phoneNumber.replace(/^0+/, '');
    
    // Create WhatsApp deep link - this will try to open the native app directly
    const whatsappDeepLink = `whatsapp://send?phone=${phoneNumber}`;
    
    // Try to open WhatsApp app directly
    window.location.href = whatsappDeepLink;
    
    // Fallback: If native app doesn't open, redirect to web after a delay
    setTimeout(() => {
      // Check if we're still on the same page (meaning native app didn't open)
      if (!document.hidden) {
        const webUrl = `https://wa.me/${phoneNumber}`;
        window.open(webUrl, '_blank');
      }
    }, 500);
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
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

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
                Opening WhatsApp directly...
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

              {/* Additional info for users */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-gray-500 mt-4"
              >
                This will try to open WhatsApp app directly on your device
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};