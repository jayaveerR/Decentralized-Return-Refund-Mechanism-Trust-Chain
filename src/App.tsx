import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Additem from "./pages/Itemadd";
import Myorders from "./pages/Myorders";
import Verify from "./Verifypage/Verify";
import Qrcode from "./pages/Qrcode";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/additem" element={<Additem />} />
        <Route path="/myorders" element={<Myorders />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/qrcode" element={<Qrcode />} />
      </Routes>
    </Router>
  );
}

export default App;