import { Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import HomePage from "./components/Pages/HomePage";
import ProtectedRoute from "./ProtectedRoutes";
import ShopsPage from "./components/Pages/Shops/Shops";
import CategoriesPage from "./components/Pages/Categories/CategoriesPage";
import CategoryDetailsPage from "./components/Pages/Categories/CategoryDetailsPage";
import ShopDetailsPage from "./components/Pages/Shops/ShopDetailsPage";
import ShopEditorPage from "./components/Pages/Shops/ShopsEditor";
import AgreementGate from "./components/Pages/Shops/AgreementGate";
import AdminPage from "./components/Pages/Admin/AdminPage";
import AboutPage from "./components/Pages/AboutPage";
import ContactPage from "./components/Pages/ContactPage";

function App() {

  return (
      <div className="flex flex-col min-h-screen">
      <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/businesses" element={<ShopsPage />} />
          <Route path="/businesses/:slug" element={<ShopDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
          <Route
            path="/my-space"
            element={
              <ProtectedRoute requiredRole="shop_owner">
                <AgreementGate>
                  <ShopEditorPage />
                </AgreementGate>
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute  requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      <Footer />
    </div>
  )
}


export default App
