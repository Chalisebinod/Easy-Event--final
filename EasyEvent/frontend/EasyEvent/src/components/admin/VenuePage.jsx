import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";
import { toast } from "react-toastify";

// API configuration
const API_URL = "http://localhost:8000/api/admin/venues";
const API_URL_Block = "http://localhost:8000/api/venue";

const ITEMS_PER_PAGE = 10;

const VenuePage = () => {
  const [venues, setVenues] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date");

  // Function to fetch venues from API
  const fetchVenues = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const { data: responseData } = await axios.get(API_URL, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm,
          sort: sortOption,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data: venuesData, pagination } = responseData;
      setVenues(venuesData);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues whenever page, searchTerm, or sortOption changes
  useEffect(() => {
    fetchVenues();
  }, [page, searchTerm, sortOption]);

  // Handle venue block/unblock action
  const handleBlockVenue = async (venueId, isBlocked) => {
    const confirmMessage = isBlocked
      ? "Are you sure you want to unblock this venue?"
      : "Are you sure you want to block this venue?";
    if (!window.confirm(confirmMessage)) return;

    const token = localStorage.getItem("access_token");

    try {
      await axios.put(
        `${API_URL_Block}/block/${venueId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Show the appropriate toast message based on current status
      if (isBlocked) {
        toast.success("Venue unblocked successfully");
      } else {
        toast.success("Venue blocked successfully");
      }
      // Re-fetch venues after toggling status
      fetchVenues();
    } catch (error) {
      console.error("Error toggling venue status:", error);
      toast.error("Error updating venue status");
    }
  };

  // Handlers for filter changes
  const handlePageChange = (newPage) => setPage(newPage);
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex">
      <DashboardLayout />
      <div className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6">Venue Management</h1>

        {/* Filters: Search and Sort */}
        <div className="mb-4 flex flex-wrap gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, address, or description"
            className="px-4 py-2 border rounded-md"
          />
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <>
            <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id} className="border-b">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venue.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venue.location
                        ? `${venue.location.address}, ${
                            venue.location.city || ""
                          }`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venue.contact_details?.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venue.is_blocked ? "Blocked" : "Active"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() =>
                          handleBlockVenue(venue._id, venue.is_blocked)
                        }
                        className={`px-4 py-2 rounded-md text-white ${
                          venue.is_blocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {venue.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  disabled={page === index + 1}
                  className={`px-4 py-2 mx-1 border rounded ${
                    page === index + 1
                      ? "bg-gray-300 border-gray-400 text-gray-800"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VenuePage;
