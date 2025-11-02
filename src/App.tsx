import { Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/Layouts/Header';
import Footer from './components/Layouts/Footer';
import HomePage from "./components/Pages/HomePage";
import ProtectedRoute from "./ProtectedRoutes";
import ShopsPage from "./components/Pages/Shops/Shops";
import CategoriesPage from "./components/Pages/Categories/CategoriesPage";
import CategoryDetailsPage from "./components/Pages/Categories/CategoryDetailsPage";
import ShopDetailsPage from "./components/Pages/Shops/ShopDetailsPage";

function App() {

  return (
      <div className="flex flex-col min-h-screen">
      <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shops" element={<ShopsPage />} />
          <Route path="/shops/:slug" element={<ShopDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
          <Route path="/about" element={<h1>About</h1>} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute  requiredRole="admin">
                {/* <DashboardPage /> */}
                <h1>Dashboard</h1>
              </ProtectedRoute>
            }
          />
          <Route
            path="/myShop"
            element={
              <ProtectedRoute  requiredRole="shop_owner">
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
