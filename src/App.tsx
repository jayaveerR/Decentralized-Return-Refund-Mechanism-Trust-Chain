import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Additem from "./pages/Itemadd";
import Myorders from "./pages/Myorders";
import Verify from "./Verifying/Verify";
import Qrcode from "./pages/Qrcode";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/additem" element={<Additem />} />
        <Route path="/myorders" element={<Myorders />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/qrcode" element={<Qrcode />} />
      </Routes>
    </Router>
  );
}

export default App;