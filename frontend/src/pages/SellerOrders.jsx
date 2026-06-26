import { useEffect, useState } from "react";
import api from "../services/api";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/seller-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/orders/${id}/status`,
        {
          orderStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update UI immediately without another API call
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, orderStatus: status } : order,
        ),
      );

      alert("Order Status Updated");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Failed to update status");
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Seller Orders</h1>

      {orders.length === 0 ? (
        <h2 className="text-center text-xl text-gray-500">No Orders Yet</h2>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
              <img
                src={order.listing.image}
                alt={order.listing.title}
                className="w-full h-52 object-cover rounded-lg"
              />

              <h2 className="text-2xl font-bold mt-4">{order.listing.title}</h2>

              <p className="mt-2">
                <span className="font-semibold">Buyer:</span> {order.buyer.name}
              </p>

              <p>
                <span className="font-semibold">Email:</span>{" "}
                {order.buyer.email}
              </p>

              <p className="mt-2">Quantity : {order.quantity}</p>

              <p>Total : ₹{order.totalPrice}</p>

              <p>
                Payment :
                <span className="text-green-600 font-semibold">
                  {" "}
                  {order.paymentStatus}
                </span>
              </p>

              <div className="mt-4">
                <label className="block font-semibold mb-2">Order Status</label>

                <select
                  value={order.orderStatus}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <p className="text-gray-500 mt-3">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
