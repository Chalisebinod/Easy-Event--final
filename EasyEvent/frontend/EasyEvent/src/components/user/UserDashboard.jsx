import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import BottomNavbar from "./BottomNavbar";
import Slider from "react-slick";
// Import slick-carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// Import heroicons
import { MagnifyingGlassIcon, StarIcon } from "@heroicons/react/24/solid";
import { MapPinIcon, CalendarIcon, FunnelIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

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
    const ratingA = parseFloat(a.rating || 0);
    const ratingB = parseFloat(b.rating || 0);

    if (sortOption === "High to Low") {
      return ratingB - ratingA; // Higher ratings first
    } else if (sortOption === "Low to High") {
      return ratingA - ratingB; // Lower ratings first
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
    arrows: false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </div>
            </div>
            
            {/* Sorting Options with Improved Design */}
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[180px]">
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="w-full appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sort by Rating</option>
                  <option value="High to Low">High to Low</option>
                  <option value="Low to High">Low to High</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <StarIcon className="w-5 h-5" />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="relative min-w-[180px]">
                <select className="w-full appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>Sort by Location</option>
                  <option>Kathmandu</option>
                  <option>Pokhara</option>
                  <option>Jhapa</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Available Venues</h2>
          <p className="text-gray-500 text-sm">
            {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'} found
          </p>
        </div>

        {/* Venues Grid or No Venues Message */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <Link to={`/party-palace/${venue.id}`} key={venue.id} className="block">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  {/* Image Slider */}
                  <div className="relative h-52">
                    <Slider {...sliderSettings}>
                      {venue.venueImages && venue.venueImages.length > 0 ? (
                        venue.venueImages.map((image, index) => (
                          <div key={index}>
                            <img
                              src={`http://localhost:8000/${image.replace(/\\/g, "/")}`}
                              alt={`Venue ${venue.name} - Image ${index + 1}`}
                              className="w-full h-52 object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div>
                          <img
                            src="https://via.placeholder.com/300"
                            alt="No images available"
                            className="w-full h-52 object-cover"
                          />
                        </div>
                      )}
                    </Slider>
                    
                    {/* Rating Badge */}
                    {!isNaN(parseFloat(venue.rating)) && (
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-indigo-600 font-medium rounded-md px-2 py-1 text-sm flex items-center shadow-sm">
                        <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
                        {parseFloat(venue.rating).toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Venue Details */}
                  <div className="pt-8 pl-4 flex-1 flex flex-col">
                    <h3 className="text-lg  font-bold text-gray-800 mb-1">
                      {venue.name}
                    </h3>
                    
                    <div className="flex items-center text-red-500 mb-2 text-sm">
                      <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                      <p className="truncate">
                        {venue.location.address}, {venue.location.city}
                      </p>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">
                      {venue.description}
                    </p>
                    
                    {/* Star Rating */}
                    {!isNaN(parseFloat(venue.rating)) && (
                      <div className="flex items-center mt-auto mb-2">
                        {Array(5).fill().map((_, index) => (
                          <StarIcon
                            key={index}
                            className={`w-4 h-4 ${
                              index < Math.floor(parseFloat(venue.rating))
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-lg shadow-md">
            <div className="bg-gray-100 p-5 rounded-full mb-5">
              <CalendarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Venues Available
            </h2>
            <p className="text-gray-500 mb-5 max-w-md mx-auto">
              We couldn't find any venues matching your search. Please try different search terms or explore other options.
            </p>
            <Link
              to="/"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition duration-200"
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