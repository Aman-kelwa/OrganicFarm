import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-3xl p-10 text-center">
        <div className="text-6xl">🎉</div>

        <h1 className="text-4xl font-bold text-green-600 mt-5">
          Payment Successful
        </h1>

        <p className="text-gray-500 mt-4">
          Your order has been placed successfully.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/buyer-dashboard"
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            My Orders
          </Link>

          <Link
            to="/listings"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
