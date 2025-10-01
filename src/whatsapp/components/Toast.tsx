import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
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