import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ItemAddWithPetraClean from "./Itemadding/ItemAddWithPetraClean";
import Myorders from "./Myorders/Myorders";
import Verify from "./Verifypage/Verify";
import Qrcode from "./Qrcode/Qrcode";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/additem" element={<ItemAddWithPetraClean />} />
        <Route path="/myorders" element={<Myorders />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/qrcode" element={<Qrcode />} />
      </Routes>
    </Router>
  );
}

export default App;