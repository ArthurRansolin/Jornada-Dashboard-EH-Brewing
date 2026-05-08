import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import CylinderView from "./pages/CylinderView";

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Header />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cilindros" element={<CylinderView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;