import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Copy, QrCode } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, qrData }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      
      // Create and show a temporary success indicator
      const copyBtn = document.querySelector('.copy-button');
      if (copyBtn) {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="flex items-center justify-center space-x-2"><CheckCircle className="w-4 h-4" /><span>Copied!</span></span>';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = qrData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const extractDisplayData = (data: string) => {
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
                Scanned data has been captured and ready to copy
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
                  Close
                </button>
                <button
                  onClick={copyToClipboard}
                  className="copy-button flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </button>
              </motion.div>

              {/* Additional info for users */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-gray-500 mt-4"
              >
                Click "Copy URL" to copy the scanned data to clipboard
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};