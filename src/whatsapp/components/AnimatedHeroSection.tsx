import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Send } from 'lucide-react';

interface AnimatedHeroSectionProps {
  onScanClick: () => void;
  isScanning: boolean;
}

export const AnimatedHeroSection: React.FC<AnimatedHeroSectionProps> = ({ 
  onScanClick, 
  isScanning 
}) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [pulse, setPulse] = useState(false);
  const words = ['SCAN', 'VERIFY', 'CONNECT'];

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

        {/* Scan Button */}
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onScanClick}
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
              <Zap className="w-7 h-7 mr-4" />
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
      </div>
    </motion.div>
  );
};