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
import MyListings from "./pages/MyListings";
import AddListing from "./pages/AddListing";
import EditListing from "./pages/EditListing";
import SellerOrders from "./pages/SellerOrders";
import BuyerOrders from "./pages/BuyerOrders";

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

        <Route
          path="/my-listings"
          element={
            <ProtectedRoute role="seller">
              <MyListings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-listing"
          element={
            <ProtectedRoute role="seller">
              <AddListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-listing/:id"
          element={
            <ProtectedRoute role="seller">
              <EditListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-orders"
          element={
            <ProtectedRoute role={"seller"}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
  path="/buyer-orders"
  element={
    <ProtectedRoute>
      <BuyerOrders />
    </ProtectedRoute>
  }
/>

      </Routes>
    </>
  );
}

export default App;
