import { motion } from "framer-motion";
import { MdQrCodeScanner } from "react-icons/md";

interface ScanButtonProps {
  isScanning: boolean;
  onScanClick: () => void;
}

const ScanButton = ({ isScanning, onScanClick }: ScanButtonProps) => {
  return (
    <div className="flex justify-center items-center p-4 mb-12">
      <motion.button
        onClick={onScanClick}
        disabled={isScanning}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white text-black cursor-pointer border-2 border-blue-600 rounded-2xl px-8 py-4 font-semibold text-lg hover:bg-blue-600 hover:text-white hover:border-blue-700 transform transition-all duration-300 min-w-[200px] shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <MdQrCodeScanner size={24} />
        {isScanning ? "Scanning..." : "Scan QR Code"}
      </motion.button>
    </div>
  );
};

export default ScanButton;