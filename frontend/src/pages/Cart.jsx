import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Cart = () => {
  const [cart, setCart] = useState({
    items: [],
  });

  const navigate = useNavigate();

  const totalAmount = cart.items.reduce(
    (acc, item) => acc + item.listing.price * item.quantity,
    0,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (listingId) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/cart/${listingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/payment/create-order",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "OrganicFarm",

        description: "Order Payment",

        order_id: data.order.id,

        handler: async (response) => {
          await verifyPayment(response);
        },
      };
      console.log(import.meta.env.VITE_RAZORPAY_KEY_ID);

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.log(error);
    }
  };

  const verifyPayment = async (response) => {
    try {
      console.log("Razorpay Response:", response);

      const token = localStorage.getItem("token");

      const res = await api.post("/payment/verify", response, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
      navigate("/payment-success");
    } catch (error) {
      console.log("VERIFY ERROR:", error);
      console.log(error.response?.data);

      alert("Payment Verification Failed");
    }
  };

  const updateQuantity = async (listingId, quantity) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/cart/update",
        {
          listingId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(
        res.data.cart || {
          items: [],
        },
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h1 className="p-10">Loading...</h1>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-10">My Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow p-6 flex gap-6"
            >
              <img
                src={item.listing.image}
                alt={item.listing.title}
                className="w-40 h-40 rounded-lg object-cover"
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold">{item.listing.title}</h2>

                <p className="text-gray-500 mt-2">₹{item.listing.price}</p>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    disabled={item.quantity === 1}
                    onClick={() =>
                      updateQuantity(item.listing._id, item.quantity - 1)
                    }
                    className="bg-gray-300 px-3 py-1 rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.listing._id, item.quantity + 1)
                    }
                    className="bg-gray-300 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold mt-2">
                  Total: ₹{item.listing.price * item.quantity}
                </p>

                <button
                  onClick={() => removeItem(item.listing._id)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side */}
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>₹{totalAmount}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Delivery</span>
            <span>₹0</span>
          </div>

          <hr />

          <div className="flex justify-between text-xl font-bold mt-6">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-8 bg-green-600 text-white py-3 rounded-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
