import { useEffect, useState } from "react";

import api from "../services/api";

const BuyerDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/dashboard/buyer", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!stats) {
    return <h1 className="p-10">Loading...</h1>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-10">Buyer Dashboard</h1>

      {/* Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Orders</h2>

          <p className="text-4xl font-bold mt-3">{stats.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Spent</h2>

          <p className="text-4xl font-bold text-green-600 mt-3">
            ₹{stats.totalSpent}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Pending</h2>

          <p className="text-4xl font-bold text-yellow-500 mt-3">
            {stats.pendingOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Completed</h2>

          <p className="text-4xl font-bold text-blue-600 mt-3">
            {stats.completedOrders}
          </p>
        </div>
      </div>

      {/* Recent Orders */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>

        {stats.recentOrders.length === 0 ? (
          <p>No Orders Yet</p>
        ) : (
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <h3 className="font-semibold">{order.listing?.title}</h3>

                  <p className="text-gray-500">Qty: {order.quantity}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">₹{order.totalPrice}</p>

                  <p className="text-sm text-gray-500">{order.orderStatus}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
