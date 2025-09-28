"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { MdQrCodeScanner } from "react-icons/md";


const Qrcode = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [nftMinted, setNftMinted] = useState(false);
  const [productId, setProductId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQRCode = async () => {
    if (!productId.trim()) {
      alert('Please enter a product ID');
      return;
    }

    setIsGenerating(true);
    
    // Simulate QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a unique QR code based on product ID (mock)
    const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productId)}`;
    setQrCode(mockQrCode);
    setIsGenerating(false);
  };

  const mintNFT = async () => {
    if (!qrCode) return;
    
    setIsMinting(true);
    
    // Simulate NFT minting process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsMinting(false);
    setNftMinted(true);
    
    // Reset after success
    setTimeout(() => {
      setNftMinted(false);
      setQrCode(null);
      setProductId('');
    }, 5000);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      console.log('Image uploaded:', file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-white-50 to-amber-50">
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
            <MdQrCodeScanner className="mx-auto text-6xl text-black-500 mb-6" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold ">
            Decentralized QR Code
            <span className="block mt-2 text-orange-600">NFT Minting</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mt-6">
            Transform your products into unique digital assets on the blockchain. 
            Generate verifiable QR codes and mint them as NFTs for complete authenticity tracking.
          </p>
        </motion.div>

        {/*Button Section*/}
       <div className='flex justify-center items-center p-4'>
        <button className='bg-white text-black cursor-pointer border-2 border-gray-600 rounded-2xl px-4 py-4 font-semibold text-lg
         hover:bg-black hover:text-white hover:border-black transform hover:-translate-y-1 transition-all duration-300 min-w-[140px] shadow-md hover:shadow-xl'>
        NFT Mint QR Code</button></div>

       </main>
    </div>
  );
};

export default Qrcode;