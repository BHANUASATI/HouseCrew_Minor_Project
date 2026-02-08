import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaStar, FaUser, FaCalendarAlt, FaFilter, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useState } from "react";

export default function Reviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      customerName: "Rahul Sharma",
      customerAvatar: "/api/placeholder/150/150/avatar1",
      service: "Home Cleaning",
      rating: 5,
      comment: "Excellent service! Very professional and thorough. The team was punctual and did an amazing job.",
      date: "2024-02-08",
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      customerName: "Priya Patel",
      customerAvatar: "/api/placeholder/150/150/avatar2",
      service: "Plumbing Repair",
      rating: 4,
      comment: "Good work, but could be more responsive to calls. The repair quality was excellent though.",
      date: "2024-02-07",
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      customerName: "Amit Kumar",
      customerAvatar: "/api/placeholder/150/150/avatar3",
      service: "Electrical Work",
      rating: 5,
      comment: "Outstanding service! Very knowledgeable and efficient. Fixed the issue quickly and professionally.",
      date: "2024-02-06",
      helpful: 15,
      verified: true
    },
    {
      id: 4,
      customerName: "Sneha Reddy",
      customerAvatar: "/api/placeholder/150/150/avatar4",
      service: "Gardening",
      rating: 4,
      comment: "Great gardening service! My garden looks amazing now. Very creative and hardworking team.",
      date: "2024-02-05",
      helpful: 6,
      verified: false
    },
    {
      id: 5,
      customerName: "Vikram Singh",
      customerAvatar: "/api/placeholder/150/150/avatar5",
      service: "Home Cleaning",
      rating: 3,
      comment: "Service was okay, but took longer than expected. Quality was decent for the price.",
      date: "2024-02-04",
      helpful: 3,
      verified: true
    }
  ]);

  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter(review => review.verified).length;

  const filteredReviews = reviews.filter(review => {
    return filterRating === "all" || review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.date) - new Date(a.date);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "helpful") return b.helpful - a.helpful;
    return 0;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-sm ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const handleHelpful = (reviewId, type) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + (type === 'up' ? 1 : -1) }
        : review
    ));
  };

  return (
    <ServiceProviderLayout>
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-purple-600 to-pink-500
        bg-clip-text text-transparent"
      >
        Reviews
      </motion.h2>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white text-center"
          >
            <div className="flex justify-center mb-2">
              <FaStar className="text-3xl" />
              <span className="text-2xl font-bold ml-2">{averageRating}</span>
            </div>
            <p className="text-purple-100">Average Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white text-center"
          >
            <div className="flex justify-center mb-2">
              <span className="text-3xl font-bold">{totalReviews}</span>
            </div>
            <p className="text-blue-100">Total Reviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 p-4 sm:p-6 rounded-xl text-white text-center"
          >
            <div className="flex justify-center mb-2">
              <span className="text-3xl font-bold">{verifiedReviews}</span>
            </div>
            <p className="text-green-100">Verified Reviews</p>
          </motion.div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-purple-600" />
            <span className="font-semibold text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRating("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRating === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRating("5")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRating === "5"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              5 Stars
            </button>
            <button
              onClick={() => setFilterRating("4")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRating === "4"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              4 Stars
            </button>
            <button
              onClick={() => setFilterRating("3")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterRating === "3"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              3 Stars
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* REVIEWS LIST */}
        <div className="space-y-6">
          {sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* REVIEW HEADER */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{review.customerName}</h3>
                    {review.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">({review.date})</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.service}</p>
                </div>
              </div>

              {/* REVIEW COMMENT */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* REVIEW ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, 'up')}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <FaThumbsUp className="text-sm" />
                    <span className="text-sm">{review.helpful}</span>
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, 'down')}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <FaThumbsDown className="text-sm" />
                    <span className="text-sm">Helpful</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Respond
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {sortedReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No reviews found</h3>
            <p className="text-gray-500">Be the first to leave a review!</p>
          </div>
        )}
      </motion.div>
    </ServiceProviderLayout>
  );
}
