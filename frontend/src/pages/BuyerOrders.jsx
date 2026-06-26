import { useEffect, useState } from "react";
import api from "../services/api";

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data.orders);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-3xl font-bold text-green-700">Loading Orders...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-green-700 mb-10">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-semibold text-gray-600">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Buy something to see your orders here.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {orders
              .filter((order) => order.listing)
              .map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <img
                    src={order.listing.image}
                    alt={order.listing.title}
                    className="w-full h-60 object-cover"
                  />

                  <div className="p-6">
                    <h2 className="text-2xl font-bold">
                      {order.listing.title}
                    </h2>

                    <p>
                      <strong>Seller:</strong> {order.seller.name}
                    </p>

                    <p>
                      <strong>Email:</strong> {order.seller.email}
                    </p>

                    <p>
                      <strong>Quantity:</strong> {order.quantity}
                    </p>

                    <p>
                      <strong>Total:</strong> ₹{order.totalPrice}
                    </p>

                    <p>
                      <strong>Payment:</strong> {order.paymentStatus}
                    </p>

                    <p>
                      <strong>Status:</strong> {order.orderStatus}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
