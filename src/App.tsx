import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Additem from "./pages/Itemadd";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/additem" element={<Additem />} />
      </Routes>
    </Router>
  );
}

export default App;