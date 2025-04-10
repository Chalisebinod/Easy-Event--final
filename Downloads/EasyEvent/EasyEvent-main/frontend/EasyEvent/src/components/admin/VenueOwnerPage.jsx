import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation
import DashboardLayout from "./DashboardLayout";

const VenueOwnerPage = () => {
  const [venueOwners, setVenueOwners] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // For the search box
  const [sortBy, setSortBy] = useState("date"); // Default sorting by date
  const [blockStatus, setBlockStatus] = useState("all"); // To filter by blocked status

  useEffect(() => {
    fetchVenueOwners(page, searchTerm, sortBy, blockStatus);
  }, [page, searchTerm, sortBy, blockStatus]);

  const fetchVenueOwners = async (
    currentPage,
    search = "",
    sort = "date",
    block = "all"
  ) => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `http://localhost:8000/api/venue-owners?page=${currentPage}&limit=10&search=${search}&sort=${sort}&blockStatus=${block}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data, pagination } = response.data;
      setVenueOwners(data);
      setPages(pagination.totalPages);
    } catch (error) {
      console.error("Error fetching venue owners:", error);
    } finally {
      setLoading(false);
    }
  };

  const blockVenueOwner = async (venueOwnerId, isBlocked) => {
    const confirmation = window.confirm(
      `Are you sure you want to ${
        isBlocked ? "unblock" : "block"
      } this venue owner?`
    );
    if (!confirmation) return;

    const token = localStorage.getItem("access_token");
    try {
      await axios.put(
        `http://localhost:8000/api/venueOwner/block/${venueOwnerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchVenueOwners(page, searchTerm, sortBy, blockStatus); // Refresh after blocking/unblocking
    } catch (error) {
      console.error("Error updating venue owner status:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleBlockStatusChange = (e) => {
    setBlockStatus(e.target.value);
  };

  return (
    <div className="flex">
      <DashboardLayout />
      <div className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6">Venue Owner Management</h1>

        {/* Search Box */}
        <div className="mb-6 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by name, email, or location"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 border rounded w-1/3"
          />
        </div>

        {/* Sorting Options */}
        <div className="mb-6 flex items-center space-x-4">
          <div>
            <label htmlFor="sortBy" className="mr-2">
              Sort by:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-2 border rounded"
            >
              <option value="date">Account Creation Date</option>
              <option value="status">Status</option>
              <option value="blocked">Blocked Status</option>
            </select>
          </div>

          <div>
            <label htmlFor="blockStatus" className="mr-2">
              Filter by Blocked Status:
            </label>
            <select
              id="blockStatus"
              value={blockStatus}
              onChange={handleBlockStatusChange}
              className="px-4 py-2 border rounded"
            >
              <option value="all">All</option>
              <option value="blocked">Blocked</option>
              <option value="unblocked">Unblocked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading...</p>
        ) : (
          <>
            <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Contact Number</th>
                  
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {venueOwners.map((venueOwner) => (
                  <tr
                    key={venueOwner._id}
                    className="border-b last:border-none"
                  >
                    <td className="px-4 py-2">
                      <Link
                        to={`/venueOwner-profile/${venueOwner._id}`} // Link to the profile page
                        className="text-blue-500 hover:underline"
                      >
                        {venueOwner.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{venueOwner.email}</td>
                    <td className="px-4 py-2">
                      {venueOwner.contact_number || "N/A"}
                    </td>
                    <td className="px-4 py-2">{venueOwner.location}</td>
                    <td className="px-4 py-2">{venueOwner.status}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() =>
                          blockVenueOwner(venueOwner._id, venueOwner.is_blocked)
                        }
                        className={`px-4 py-2 text-white rounded ${
                          venueOwner.is_blocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {venueOwner.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              {Array.from({ length: pages }, (_, index) => (
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

export default VenueOwnerPage;
