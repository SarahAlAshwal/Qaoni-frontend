import { Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/Layouts/Header';
import Footer from './components/Layouts/Footer';
import HomePage from "./components/Pages/HomePage";
import ProtectedRoute from "./assets/ProtectedRoutes";
import { useAppSelector } from "./store/hooks";

function App() {
  const isAuthenticated = useAppSelector((state) => state.userInfo.isAuthenticated);
  return (
      <div className="flex flex-col min-h-screen">
      <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shops" element={<h1>Shops</h1>} />
          <Route path="/categories" element={<h2>Categories</h2>} />
          <Route path="/about" element={<h1>About</h1>} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {/* <DashboardPage /> */}
                <h1>Dashboard</h1>
              </ProtectedRoute>
            }
          />
        </Routes>
      <Footer />
    </div>
  )
}


export default App
