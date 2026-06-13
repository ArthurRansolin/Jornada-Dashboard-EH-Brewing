import "./styles.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useLocation } from "react-router-dom";

import Header from "./components/Header";

import Admin from "./pages/Admin";
import TankView from "./pages/TankView";
import TankDetails from "./pages/TankDetails";
import TestBench from "./pages/TestBench";
import BatchDetails from "./pages/BatchDetails";
import BatchList from "./pages/BatchList";
import DashboardPage from "./pages/DashboardPage";
import PublicFermentationPage from "./pages/PublicFermentationPage";

import AppProviders from "./contexts/AppProviders";

function AppShell() {
  const location = useLocation();
  const isPublicPage = location.pathname.startsWith("/fermentacoes/");
  return (
    <>
      {!isPublicPage && <Header />}

      <div className={isPublicPage ? "public-container" : "container"}>

          <Routes>

            <Route
              path="/"
              element={
                <Navigate to="/dashboard" />
              }
            />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
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

            <Route
              path="/test-bench"
              element={<TestBench />}
            />

            <Route
              path="/batches"
              element={<BatchList />}
            />

            <Route
              path="/batches/:id"
              element={<BatchDetails />}
            />

            <Route
              path="/fermentacoes/:id"
              element={<PublicFermentationPage />}
            />

          </Routes>

        </div>
    </>
  );
}

function App() {

  return (

    <AppProviders>

      <BrowserRouter>

        <AppShell />

      </BrowserRouter>

    </AppProviders>

  );
}

export default App;
