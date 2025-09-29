
import { motion } from "framer-motion";
import { MdQrCodeScanner } from "react-icons/md";

const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="text-center mb-16"
    >
      <div>
        <MdQrCodeScanner className="mx-auto text-6xl text-blue-600 mb-6" />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
        Smart Product Verify
        <span className="block mt-2 text-blue-600">
          Return & Refund System
        </span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mt-6">
        Scan transaction QR codes to verify product authenticity, manage
        returns, and process refunds on the Aptos blockchain.
      </p>
    </motion.div>
  );
};

export default HeroSection;
