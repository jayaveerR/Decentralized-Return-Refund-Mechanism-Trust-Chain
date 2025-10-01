
import { useNavigate } from 'react-router-dom';
import img from '../assets/decentralized.png';
import Navbar from '../components/Navbar';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar activeTab="home" />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Decentralized Return & Refund
                <span className="block text-orange-600">Trust Chain</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Blockchain-powered solution for fraud-proof returns and refunds in e-commerce. 
                Secure, transparent, and efficient product verification across all platforms.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                onClick={() => navigate('/additem')}
              >
                Add Items
              </button>
              <button 
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/verify')}
              >
                Verify Product
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col items-center">
            <img 
              src={img} 
              alt="Hero" 
              className="w-full max-w-lg rounded-xl shadow-lg" 
            />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              ),
              title: "Fraud-Proof Protection",
              description: "Eliminate fake returns and refund scams with blockchain verification"
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14v6m-3-3h6M6 10h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4a2 2 0 11-4 0 2 2 0 014 0zM4 6a2 2 0 100 4h16a2 2 0 100-4H4z"
                />
              ),
              title: "Cross-Platform",
              description: "Works across all e-commerce platforms with seamless integration"
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              ),
              title: "QR Verification",
              description: "Unique QR codes for each product ensure complete traceability"
            }
          ].map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-orange-100">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 py-12 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">BV</span>
          </div>
          <p className="text-gray-600">© 2024 BlockVerify. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Building trust in e-commerce, one block at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;