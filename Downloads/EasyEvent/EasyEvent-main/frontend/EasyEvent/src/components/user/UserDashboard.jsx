import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import BottomNavbar from "./BottomNavbar";
import Slider from "react-slick";
// Import slick-carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const UserDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [venues, setVenues] = useState([]);
  const [sortOption, setSortOption] = useState(""); // State to track the selected sort option

  const access_token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/venues", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        // Use an empty array as fallback if no venues are returned.
        setVenues(response.data.venues || []);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, [access_token]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Sort venues based on the selected sort option
  const sortedVenues = [...venues].sort((a, b) => {
    if (sortOption === "High to Low") {
      return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    } else if (sortOption === "Low to High") {
      return parseFloat(a.rating || 0) - parseFloat(b.rating || 0);
    }
    return 0; // No sorting if no valid option is selected
  });

  const filteredVenues = sortedVenues.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Slider settings for react-slick with autoplay every 3 seconds
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-white">
    
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 w-full gap-4">
          {/* Sort dropdowns */}
          <div className="flex flex-1 sm:flex-none gap-4">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all"
            >
              <option value="">Sort by Rating</option>
              <option value="High to Low">High to Low</option>
              <option value="Low to High">Low to High</option>
            </select>
            <select className="px-6 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all">
              <option>Sort by Location</option>
              <option>Kathmandu</option>
              <option>Pokhara</option>
              <option>Jhapa</option>
            </select>
          </div>

          {/* Modern Search Input */}
          <div className="relative w-full sm:w-auto flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search by venue name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 transition-all peer"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-orange-500 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Venues Grid or No Venues Message */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredVenues.map((venue) => (
              <Link to={`/party-palace/${venue.id}`} key={venue.id}>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden transition transform hover:scale-105 cursor-pointer">
                  {/* React Slick Slider for Venue Images */}
                  <Slider {...sliderSettings} className="w-full h-48">
                    {venue.venueImages && venue.venueImages.length > 0 ? (
                      venue.venueImages.map((image, index) => (
                        <div key={index}>
                          <img
                            src={`http://localhost:8000/${image.replace(/\\/g, "/")}`}
                            alt={`Venue ${venue.name} - Image ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div>
                        <img
                          src="https://via.placeholder.com/300"
                          alt="No images available"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </Slider>

                  {/* Venue Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {venue.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {venue.location.address}, {venue.location.city},{" "}
                      {venue.location.state} {venue.location.zip_code}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      {venue.description}
                    </p>
                    <div>
                      {isNaN(parseFloat(venue.rating)) ? (
                        <p className="text-gray-500 text-sm">{venue.rating}</p>
                      ) : (
                        <div className="flex items-center">
                          {Array(Math.floor(parseFloat(venue.rating)))
                            .fill()
                            .map((_, index) => (
                              <span
                                key={index}
                                className="text-orange-500 text-xl"
                              >
                                ★
                              </span>
                            ))}
                          {parseFloat(venue.rating) % 1 !== 0 && (
                            <span className="text-orange-500 text-xl">☆</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <img
              src="https://via.placeholder.com/300x200?text=No+Venues+Available"
              alt="No venues available"
              className="w-60 h-40 mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Venues Available
            </h2>
            <p className="text-gray-600 mb-4">
              It seems we don't have any venues at the moment. Please check back
              later or explore other options.
            </p>
            <Link
              to="/"
              className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg shadow-md hover:bg-orange-700 transition duration-300"
            >
              Explore Other Options
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <BottomNavbar />
    </div>
  );
};

export default UserDashboard;