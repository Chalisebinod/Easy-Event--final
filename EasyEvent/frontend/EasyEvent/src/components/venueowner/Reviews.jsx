import React from "react";
import VenueSidebar from "./VenueSidebar";

const reviews = [
  {
    name: "Ps",
    rating: 4.5,
    comment:
      "Babbal xa, long lasting, yo price ma, more worthy, fragrance pani dammi nam paryo...",
    timeAgo: "4 weeks ago",
  },
  {
    name: "Nita L",
    rating: 5,
    comment: "Awesome",
    timeAgo: "4 weeks ago",
  },
  // Add more reviews as needed...
];

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center text-yellow-500">
      {[...Array(fullStars)].map((_, index) => (
        <span key={index}>&#9733;</span>
      ))}
      {halfStar && <span>&#189;</span>}
    </div>
  );
};

const ReviewsContent = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-800">Customer Reviews</h2>
      <div className="flex justify-center items-center mt-4">
        <span className="text-4xl font-bold text-indigo-600">4.8</span>
        <div className="ml-4">
          <StarRating rating={4.8} />
          <p className="text-sm text-gray-600">(2 Ratings)</p>
        </div>
      </div>
    </div>
    {/* Scrollable container for reviews */}
    <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="border p-4 rounded-lg hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {review.name}
            </h3>
            <span className="text-sm text-gray-500">{review.timeAgo}</span>
          </div>
          <div className="mb-2">
            <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  </div>
);

const Reviews = () => {
  return (
    <VenueSidebar>
      <ReviewsContent />
    </VenueSidebar>
  );
};

export default Reviews;
