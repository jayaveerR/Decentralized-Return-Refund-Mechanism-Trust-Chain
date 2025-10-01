import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../components/Navbar';
import { MdQrCodeScanner, MdContentCopy, MdDownload, MdVerified } from "react-icons/md";

const Qrcode = () => {
  const [transactionHash, setTransactionHash] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = () => {
    if (!transactionHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    setIsGenerating(true);
    
    // Construct Aptos Explorer link
    const aptosExplorerLink = `https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`;
    setExplorerLink(aptosExplorerLink);
    
    // Generate QR code data URL
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedQR(aptosExplorerLink);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadQRCode = () => {
    if (!generatedQR) return;
    
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `aptos-tx-${transactionHash.slice(0, 8)}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const resetQRCode = () => {
    setGeneratedQR(null);
    setTransactionHash('');
    setExplorerLink('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-yellow-50">
      <Navbar activeTab='qrcode' />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-16"
        >
          <div>
            <MdQrCodeScanner className="mx-auto text-6xl text-gray-800 mb-6" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">
            Generate QR Code
            <span className="block mt-2 text-orange-600">Transaction Hash</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mt-6">
            Generate QR codes for Aptos transactions that can be scanned to view details on Aptos Explorer
          </p>
        </motion.div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-200 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter transaction hash (0x...)"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-mono"
              />
            </div>

            <button
              onClick={generateQRCode}
              disabled={isGenerating || !transactionHash.trim()}
              className="w-full px-6 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <MdQrCodeScanner size={20} />
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Display Section */}
        <AnimatePresence>
          {generatedQR && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-200"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Transaction QR Code
                </h2>
                <p className="text-gray-600 mb-8">
                  Scan this QR code to view transaction details on Aptos Explorer
                </p>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 mb-6">
                      <QRCodeCanvas
                        id="qr-code"
                        value={generatedQR}
                        size={256}
                        level="H"
                        includeMargin
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                      <button
                        onClick={downloadQRCode}
                        className="w-full px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-orange-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                      >
                        <MdDownload size={20} />
                        Download QR Code
                      </button>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-6">
                    {/* Explorer Link */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">Aptos Explorer Link</h3>
                        <button
                          onClick={() => copyToClipboard(explorerLink)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MdContentCopy size={20} />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm break-all">
                        {explorerLink}
                      </p>
                    </div>

                    {/* Transaction Hash */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-blue-800">Transaction Hash</h3>
                        <button
                          onClick={() => copyToClipboard(transactionHash)}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <MdContentCopy size={20} />
                        </button>
                      </div>
                      <p className="text-blue-700 font-mono text-sm break-all">
                        {transactionHash}
                      </p>
                    </div>

                    {/* Open in Explorer Button */}
                    <button
                      onClick={() => window.open(explorerLink, '_blank')}
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <MdVerified size={20} />
                      View on Aptos Explorer
                    </button>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetQRCode}
                  className="mt-8 px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Generate New QR Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Qrcode;