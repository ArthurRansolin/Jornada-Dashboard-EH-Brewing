import "./styles.css";

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import TankView from "./pages/TankView";
import TankDetails from "./pages/TankDetails";

import AppProviders
from "./contexts/AppProviders";

function App() {

  return (

    <AppProviders>

      <BrowserRouter>

        <div className="container">

          <Header />

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/admin"
              element={<Admin />}
            />

            <Route
              path="/tanks"
              element={<TankView />}
            />

            <Route
              path="/tanks/:id"
              element={<TankDetails />}
            />

          </Routes>

        </div>

      </BrowserRouter>

    </AppProviders>

  );
}

export default App;