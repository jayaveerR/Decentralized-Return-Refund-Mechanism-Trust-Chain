
// components/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

declare global {
  interface Window {
    aptos?: any;
  }
}

const Login = () => {
  const [isHeadingVisible, setIsHeadingVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ToastContainer is now used for configuration in the component tree (react-toastify v9+)

    const timer = setTimeout(() => {
      setIsHeadingVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const connectPetraWallet = async () => {
    if (!window.aptos) {
      toast.error(
        <div>
          <span className="font-semibold">Petra Wallet Not Found</span>
          <br />
          <span>Please install Petra wallet to continue</span>
        </div>,
        {
          onClick: () => window.open("https://petra.app/", "_blank"),
          className: "cursor-pointer",
        }
      );
      return;
    }

    try {
      setIsConnecting(true);
      toast.info("Connecting to Petra Wallet...", {
        autoClose: 3000,
      });

      await window.aptos.connect();
      const account = await window.aptos.account();
      
      // Store wallet info in localStorage or context
      localStorage.setItem("walletAddress", account.address);
      localStorage.setItem("walletConnected", "true");
      
      toast.success(
        <div>
          <span className="font-semibold">Wallet Connected Successfully!</span>
          <br />
          <span className="text-sm">Address: {account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
        </div>,
        {
          autoClose: 2000,
        }
      );
      
      // Navigate to home page after a short delay to show success message
      setTimeout(() => {
        navigate("/home");
      }, 1500);
      
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      
      const errorMessage = error?.message || "Connection failed. Please try again.";
      
      toast.error(
        <div>
          <span className="font-semibold">Connection Failed</span>
          <br />
          <span>{errorMessage}</span>
        </div>,
        {
          autoClose: 5000,
        }
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
    {/* ToastContainer for react-toastify notifications */}
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
    />
    <div className="min-h-screen bg-white text-black flex flex-col">
      <nav className="flex justify-between items-center p-6 absolute top-0 w-full">
        <div className="flex items-center">
          <svg
            className="w-10 h-10 mr-2"
            viewBox="0 0 100 100"
            fill="none"
          >
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              rx="5"
              stroke="black"
              strokeWidth="5"
            />
              <path
                d="M30 50L45 65L70 35"
                stroke="black"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold">BlockVerify</span>
          </div>
          <button
            onClick={connectPetraWallet}
            disabled={isConnecting}
            className="px-4 py-2 bg-white-500 text-black rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer relative z-10 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-300 rounded-full filter blur-xl opacity-30"></div>
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-200 rounded-full filter blur-xl opacity-20"></div>

          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 transition-all duration-1000 ${
              isHeadingVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-10 opacity-0"
            }`}
          >
            Decentralized Return & Refund
            <br />
            <span className="text-orange-500">Mechanism Trust-Chain</span>
          </h1>

          <p className="text-sm md:text-base text-center mb-10 max-w-2xl">
            Trust-Chain returns: Fraud-Proof Buyer-Seller Protection
          </p>

          <div className="flex flex-col sm:flex-row gap-4 z-10">
            <button className="px-8 py-3 bg-transparent border border-black text-black rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
              Learn More
            </button>
          </div>

          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-100 rounded-full filter blur-2xl opacity-40"></div>
          <div className="absolute -bottom-40 left-10 w-40 h-40 bg-orange-200 rounded-full filter blur-2xl opacity-30"></div>
        </main>
      </div>
    </>
  );
};

export default Login;