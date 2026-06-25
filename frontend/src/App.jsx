import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Listings from "./pages/Listings";
import ListingDetails from "./pages/ListingDetails";
import Cart from "./pages/Cart";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute role={"buyer"}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/listings" element={<Listings />} />

        <Route path="/listings/:id" element={<ListingDetails />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute role={"buyer"}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute role={"seller"}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
