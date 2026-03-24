import CustomerLayout from "../CustomerLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaCreditCard,
  FaUniversity,
  FaCheckCircle,
  FaLock,
  FaArrowRight,
  FaClock,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaRegCreditCard,
  FaMobileAlt,
  FaLandmark,
  FaShieldAlt,
  FaHistory,
  FaReceipt,
  FaGooglePay,
  FaAmazon,
  FaApplePay,
  FaPaypal,
  FaBitcoin,
  FaMoneyBillWave,
  FaQrcode,
  FaPercent,
  FaGift,
  FaTag,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/apiService";

export default function Payments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [serviceRequests, setServiceRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState(500);

  // Enhanced service pricing with discounts
  const servicePricing = {
    "Tap Leakage": { base: 500, discount: 450 },
    "Pipe Installation": { base: 1200, discount: 1080 },
    "Blocked Drain": { base: 800, discount: 720 },
    "Water Heater Repair": { base: 1500, discount: 1350 },
    "Switch Repair": { base: 400, discount: 360 },
    "Wiring Fix": { base: 1000, discount: 900 },
    "Power Outage": { base: 2000, discount: 1800 },
    "Circuit Breaker": { base: 600, discount: 540 },
    "Home Cleaning": { base: 800, discount: 720 },
    "Bathroom Cleaning": { base: 600, discount: 540 },
    "Deep Cleaning": { base: 1500, discount: 1350 },
    "Carpet Cleaning": { base: 1000, discount: 900 },
    "Ceiling Fan Repair": { base: 500, discount: 450 },
    "AC Repair": { base: 1800, discount: 1620 },
    "Washing Machine": { base: 1200, discount: 1080 },
    "Refrigerator": { base: 1500, discount: 1350 },
    "Painting Work": { base: 2000, discount: 1800 },
    "Wall Painting": { base: 1800, discount: 1620 },
    "Wood Polishing": { base: 1200, discount: 1080 },
  };

  // Available coupons
  const availableCoupons = {
    "FIRST10": { discount: 10, description: "10% off on first service", minAmount: 500 },
    "SAVE20": { discount: 20, description: "20% off on orders above ₹1000", minAmount: 1000 },
    "WELCOME50": { discount: 50, description: "Flat ₹50 off", minAmount: 200 },
    "SPECIAL100": { discount: 100, description: "Flat ₹100 off on orders above ₹1500", minAmount: 1500 },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!user?.id) return;

      setLoading(true);
      
      // Fetch service requests, payments, and wallet in parallel
      const [requestsData, paymentsData, walletData] = await Promise.all([
        ApiService.getCustomerServiceRequests(user.id),
        ApiService.getCustomerPayments(user.id),
        ApiService.getCustomerWallet(user.id)
      ]);

      setServiceRequests(requestsData);
      setPayments(paymentsData);
      setWallet(walletData.wallet);
      
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPendingRequests = () => {
    const paidRequestIds = payments
      .filter(p => p.status === 'completed')
      .map(p => p.service_request_id);
    
    return serviceRequests.filter(req => 
      req.status === 'pending' && !paidRequestIds.includes(req.id)
    );
  };

  const getServicePrice = (serviceName) => {
    const pricing = servicePricing[serviceName] || { base: 500, discount: 450 };
    return pricing.base;
  };

  const getDiscountedPrice = (serviceName) => {
    const pricing = servicePricing[serviceName] || { base: 500, discount: 450 };
    let finalPrice = pricing.base;
    
    // Apply additional coupon discount
    if (appliedCoupon && discountAmount > 0) {
      finalPrice = Math.max(0, finalPrice - discountAmount);
    }
    
    return finalPrice;
  };

  const applyCoupon = (couponCode) => {
    if (!selectedRequest) return;
    
    const coupon = availableCoupons[couponCode.toUpperCase()];
    const basePrice = getServicePrice(selectedRequest.service_name);
    
    if (!coupon) {
      setPaymentError("Invalid coupon code");
      return;
    }
    
    if (basePrice < coupon.minAmount) {
      setPaymentError(`Minimum order amount is ₹${coupon.minAmount}`);
      return;
    }
    
    let discount = 0;
    if (coupon.discount.toString().includes('%')) {
      discount = (basePrice * coupon.discount) / 100;
    } else {
      discount = coupon.discount;
    }
    
    setDiscountAmount(discount);
    setAppliedCoupon(couponCode.toUpperCase());
    setPaymentError("");
    setShowCouponInput(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setDiscountAmount(0);
    setPaymentError("");
  };

  const handlePayment = async (request) => {
    setSelectedRequest(request);
    setShowPaymentModal(true);
    setPaymentError("");
  };

  const processPayment = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingPayment(true);
      setPaymentError("");

      const amount = getDiscountedPrice(selectedRequest.service_name);
      
      // Handle wallet payment differently
      if (paymentMethod === 'wallet') {
        const result = await ApiService.payWithWallet(user.id, selectedRequest.id, amount);
        console.log('Wallet payment successful:', result);
        
        setPaymentSuccess(true);
        setProcessingPayment(false);
        
        // Refresh data
        await fetchData();
        
        // Close modal after success
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          setSelectedRequest(null);
          setAppliedCoupon("");
          setDiscountAmount(0);
        }, 2000);
        return;
      }
      
      // Regular payment flow for other methods
      const orderData = await ApiService.createPaymentOrder({
        service_request_id: selectedRequest.id,
        amount: amount,
        customer_id: user.id
      });

      console.log('Payment order created:', orderData);

      // Simulate payment processing (in real app, integrate with Razorpay/Stripe)
      setTimeout(async () => {
        try {
          // Verify payment
          const verification = await ApiService.verifyPayment(orderData.order_id, {
            payment_id: `pay_demo_${Date.now()}`
          });

          console.log('Payment verified:', verification);
          
          setPaymentSuccess(true);
          setProcessingPayment(false);
          
          // Refresh data
          await fetchData();
          
          // Close modal after success
          setTimeout(() => {
            setShowPaymentModal(false);
            setPaymentSuccess(false);
            setSelectedRequest(null);
            setAppliedCoupon("");
            setDiscountAmount(0);
          }, 2000);

        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentError("Payment verification failed");
          setProcessingPayment(false);
        }
      }, 2000);

    } catch (error) {
      console.error('Payment processing error:', error);
      if (error.message.includes('Insufficient wallet balance')) {
        setPaymentError("Insufficient wallet balance. Please add funds to your wallet.");
      } else {
        setPaymentError("Failed to process payment");
      }
      setProcessingPayment(false);
    }
  };

  const addFundsToWallet = async () => {
    try {
      setProcessingPayment(true);
      setPaymentError("");

      const result = await ApiService.addWalletFunds(user.id, addFundsAmount, paymentMethod);
      console.log('Funds added to wallet:', result);
      
      setPaymentSuccess(true);
      setProcessingPayment(false);
      
      // Refresh wallet data
      await fetchData();
      
      // Close modal after success
      setTimeout(() => {
        setShowAddFundsModal(false);
        setPaymentSuccess(false);
        setAddFundsAmount(500);
      }, 2000);

    } catch (error) {
      console.error('Add funds error:', error);
      setPaymentError("Failed to add funds to wallet");
      setProcessingPayment(false);
    }
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: <FaRegCreditCard />,
      upi: <FaMobileAlt />,
      netbanking: <FaLandmark />,
      gpay: <FaGooglePay />,
      phonepe: <FaMobileAlt />,
      paytm: <FaMobileAlt />,
      amazon: <FaAmazon />,
      apple: <FaApplePay />,
      paypal: <FaPaypal />,
      crypto: <FaBitcoin />,
      cod: <FaMoneyBillWave />,
      wallet: <FaWallet />
    };
    return icons[method] || <FaRegCreditCard />;
  };

  const getPaymentMethodName = (method) => {
    const names = {
      card: "Credit/Debit Card",
      upi: "UPI Payment",
      netbanking: "Net Banking",
      gpay: "Google Pay",
      phonepe: "PhonePe",
      paytm: "Paytm",
      amazon: "Amazon Pay",
      apple: "Apple Pay",
      paypal: "PayPal",
      crypto: "Cryptocurrency",
      cod: "Cash on Delivery",
      wallet: "Wallet Balance"
    };
    return names[method] || "Card";
  };

  const getPaymentMethodDescription = (method) => {
    const descriptions = {
      card: "Pay with Visa, Mastercard, Rupay",
      upi: "Pay with UPI Apps (GPay, PhonePe, Paytm)",
      netbanking: "Pay with your bank account",
      gpay: "Pay with Google Pay UPI",
      phonepe: "Pay with PhonePe UPI",
      paytm: "Pay with Paytm Wallet or UPI",
      amazon: "Pay with Amazon Pay Balance",
      apple: "Pay with Apple Pay",
      paypal: "Pay with PayPal account",
      crypto: "Pay with Bitcoin, Ethereum",
      cod: "Pay when service is completed",
      wallet: "Pay with HouseCrew Wallet"
    };
    return descriptions[method] || "Secure payment method";
  };

  // Enhanced payment methods with categories
  const paymentMethods = [
    // Popular Methods
    { id: "upi", name: "UPI Payment", icon: <FaMobileAlt />, description: "Pay with UPI Apps", category: "popular" },
    { id: "card", name: "Credit/Debit Card", icon: <FaRegCreditCard />, description: "Visa, Mastercard, Rupay", category: "popular" },
    { id: "netbanking", name: "Net Banking", icon: <FaLandmark />, description: "All major banks", category: "popular" },
    
    // UPI Apps
    { id: "gpay", name: "Google Pay", icon: <FaGooglePay />, description: "Fast & secure", category: "upi" },
    { id: "phonepe", name: "PhonePe", icon: <FaMobileAlt />, description: "Quick UPI payments", category: "upi" },
    { id: "paytm", name: "Paytm", icon: <FaMobileAlt />, description: "Wallet & UPI", category: "upi" },
    
    // Digital Wallets
    { id: "amazon", name: "Amazon Pay", icon: <FaAmazon />, description: "Use Amazon balance", category: "wallet" },
    { id: "apple", name: "Apple Pay", icon: <FaApplePay />, description: "One-touch payment", category: "wallet" },
    { id: "paypal", name: "PayPal", icon: <FaPaypal />, description: "International payments", category: "wallet" },
    
    // Other Methods
    { id: "cod", name: "Cash on Delivery", icon: <FaMoneyBillWave />, description: "Pay after service", category: "other" },
    { id: "crypto", name: "Cryptocurrency", icon: <FaBitcoin />, description: "Bitcoin, Ethereum", category: "other" },
    { id: "wallet", name: "HouseCrew Wallet", icon: <FaWallet />, description: "Use wallet balance", category: "other" },
  ];

  const pendingRequests = getPendingRequests();
  const totalPending = pendingRequests.reduce((sum, req) => sum + getServicePrice(req.service_name), 0);
  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-64">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2
          bg-gradient-to-r from-indigo-600 to-sky-500
          bg-clip-text text-transparent">
          Payment Center
        </h2>
        <p className="text-slate-600">Manage your service payments securely</p>
      </motion.div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <SummaryCard
          title="Wallet Balance"
          value={`₹${wallet?.balance || 0}`}
          icon={<FaWallet />}
          accent="from-purple-500 to-indigo-500"
        />
        <SummaryCard
          title="Pending Amount"
          value={`₹${totalPending}`}
          icon={<FaWallet />}
          accent="from-rose-500 to-pink-500"
          count={pendingRequests.length}
        />
        <SummaryCard
          title="Paid This Month"
          value={`₹${totalPaid.toFixed(0)}`}
          icon={<FaCheckCircle />}
          accent="from-emerald-500 to-cyan-500"
          count={payments.filter(p => p.status === 'completed').length}
        />
        <SummaryCard
          title="Total Transactions"
          value={payments.length}
          icon={<FaCreditCard />}
          accent="from-indigo-500 to-sky-500"
        />
        <SummaryCard
          title="Success Rate"
          value="100%"
          icon={<FaShieldAlt />}
          accent="from-purple-500 to-indigo-500"
        />
      </div>

      {/* Add Funds Button */}
      <div className="mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddFundsModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2"
        >
          <FaWallet />
          Add Funds to Wallet
        </motion.button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "pending", label: "Pending Payments", icon: <FaClock /> },
          { id: "history", label: "Payment History", icon: <FaHistory /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === "pending" ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
                <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">All Payments Completed</h3>
                <p className="text-slate-600">You have no pending payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FaReceipt />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-lg">{request.service_name}</h4>
                            <p className="text-slate-600">{request.service_category}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span>Request ID: #{request.id}</span>
                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800">
                            ₹{getServicePrice(request.service_name)}
                          </p>
                          <p className="text-sm text-slate-500">Service Charge</p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePayment(request)}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-xl font-semibold flex items-center gap-2"
                        >
                          Pay Now
                          <FaArrowRight />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
                <FaHistory className="text-4xl text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Payment History</h3>
                <p className="text-slate-600">Your payment history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {payment.status === 'completed' ? <FaCheckCircle /> : <FaClock />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{payment.service_name}</h4>
                          <p className="text-slate-600">{payment.service_category}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span>Order ID: {payment.order_id}</span>
                            <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">
                          ₹{parseFloat(payment.amount).toFixed(0)}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPaymentModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !processingPayment && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Complete Payment</h3>
                {!processingPayment && (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Service Details */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Service</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.service_name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Base Price</span>
                  <span className="font-semibold text-slate-800">₹{getServicePrice(selectedRequest.service_name)}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600">Discount ({appliedCoupon})</span>
                    <span className="font-semibold text-green-600">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-lg font-semibold text-slate-800">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{getDiscountedPrice(selectedRequest.service_name)}
                  </span>
                </div>
              </div>

              {/* Wallet Balance Display */}
              {wallet && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-purple-600" />
                      <span className="text-purple-800 font-medium">Wallet Balance</span>
                    </div>
                    <span className="text-purple-800 font-bold">₹{wallet.balance}</span>
                  </div>
                  {parseFloat(wallet.balance) < getDiscountedPrice(selectedRequest.service_name) && (
                    <div className="mt-2 text-sm text-purple-600">
                      Insufficient balance. 
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setShowAddFundsModal(true);
                        }}
                        className="text-purple-800 font-medium underline ml-1"
                      >
                        Add funds to continue
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-700">Have a coupon?</p>
                  {!showCouponInput && (
                    <button
                      onClick={() => setShowCouponInput(true)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Add Coupon
                    </button>
                  )}
                </div>
                
                {showCouponInput && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={appliedCoupon}
                      onChange={(e) => setAppliedCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => applyCoupon(appliedCoupon)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setShowCouponInput(false);
                        setAppliedCoupon("");
                        setDiscountAmount(0);
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Available Coupons */}
                {!showCouponInput && !appliedCoupon && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(availableCoupons).map(([code, coupon]) => (
                      <div
                        key={code}
                        onClick={() => applyCoupon(code)}
                        className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-100"
                      >
                        <div className="flex items-center gap-2">
                          <FaTag className="text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{code}</p>
                            <p className="text-xs text-slate-600">{coupon.description}</p>
                          </div>
                        </div>
                        <FaPercent className="text-indigo-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <p className="font-semibold text-slate-700 mb-3">Select Payment Method</p>
                
                {/* Wallet Method (First) */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Quick Payment</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div
                      onClick={() => setPaymentMethod("wallet")}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        paymentMethod === "wallet"
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      } ${wallet && parseFloat(wallet.balance) < getDiscountedPrice(selectedRequest.service_name) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-xl text-purple-600">
                        <FaWallet />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">HouseCrew Wallet</p>
                        <p className="text-xs text-slate-500">
                          {wallet ? `Available balance: ₹${wallet.balance}` : 'Loading...'}
                        </p>
                      </div>
                      {wallet && parseFloat(wallet.balance) >= getDiscountedPrice(selectedRequest.service_name) && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Sufficient
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Popular Methods */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Popular Methods</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentMethods.filter(m => m.category === 'popular').map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl text-indigo-600">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{method.name}</p>
                          <p className="text-xs text-slate-500">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UPI Apps */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">UPI Apps</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentMethods.filter(m => m.category === 'upi').map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl text-indigo-600">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{method.name}</p>
                          <p className="text-xs text-slate-500">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Wallets */}
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-2">Digital Wallets</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentMethods.filter(m => m.category === 'wallet').map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl text-indigo-600">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{method.name}</p>
                          <p className="text-xs text-slate-500">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Methods */}
                <div>
                  <p className="text-sm text-slate-500 mb-2">Other Methods</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentMethods.filter(m => m.category === 'other').map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xl text-indigo-600">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 text-sm">{method.name}</p>
                          <p className="text-xs text-slate-500">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
                <FaLock className="text-indigo-600" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Success */}
              {paymentSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle />
                    <span>Payment successful! Redirecting...</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <motion.button
                whileHover={{ scale: processingPayment ? 1 : 1.02 }}
                whileTap={{ scale: processingPayment ? 1 : 0.98 }}
                onClick={processPayment}
                disabled={processingPayment || (paymentMethod === 'wallet' && wallet && parseFloat(wallet.balance) < getDiscountedPrice(selectedRequest.service_name))}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{getDiscountedPrice(selectedRequest.service_name)} with {getPaymentMethodName(paymentMethod)}
                    <FaArrowRight />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD FUNDS MODAL */}
      <AnimatePresence>
        {showAddFundsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !processingPayment && setShowAddFundsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Add Funds to Wallet</h3>
                {!processingPayment && (
                  <button
                    onClick={() => setShowAddFundsModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Current Balance */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 font-medium">Current Balance</span>
                  <span className="text-purple-800 font-bold">₹{wallet?.balance || 0}</span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-6">
                <p className="font-semibold text-slate-700 mb-3">Select Amount</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[500, 1000, 2000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAddFundsAmount(amount)}
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        addFundsAmount === amount
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <p className="font-semibold text-slate-700 mb-3">Payment Method</p>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.filter(m => m.category === 'popular').map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xl text-purple-600">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{method.name}</p>
                        <p className="text-xs text-slate-500">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Success */}
              {paymentSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle />
                    <span>Funds added successfully!</span>
                  </div>
                </div>
              )}

              {/* Add Funds Button */}
              <motion.button
                whileHover={{ scale: processingPayment ? 1 : 1.02 }}
                whileTap={{ scale: processingPayment ? 1 : 0.98 }}
                onClick={addFundsToWallet}
                disabled={processingPayment || !addFundsAmount || addFundsAmount <= 0}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Add ₹{addFundsAmount} to Wallet
                    <FaArrowRight />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
}

/* 🔹 SUMMARY CARD */
function SummaryCard({ title, value, icon, accent, count }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${accent} opacity-20 blur-lg sm:blur-xl`}
      />
      <div className="relative bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center
            bg-gradient-to-r ${accent} text-white text-lg sm:text-xl`}
          >
            {icon}
          </div>
          {count !== undefined && (
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500">{title}</p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
          {value}
        </h3>
      </div>
    </motion.div>
  );
}
