import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [blockStatus, setBlockStatus] = useState("all");
  const [sort, setSort] = useState("date");

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, blockStatus, sort]);

  const fetchUsers = async (currentPage) => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.get(
        `http://localhost:8000/api/users?page=${currentPage}&limit=10&search=${search}&blockStatus=${blockStatus}&sort=${sort}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Assuming your backend returns { success, data, pagination }
      const { data, pagination } = response.data;
      setUsers(data);
      setPages(pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId, isBlocked) => {
    const confirmMessage = isBlocked
      ? "Are you sure you want to unblock this user?"
      : "Are you sure you want to block this user?";
    if (!window.confirm(confirmMessage)) return;

    const token = localStorage.getItem("access_token");

    try {
      await axios.put(
        `http://localhost:8000/api/users/block/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the list after the update
      fetchUsers(page);
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleBlockStatusChange = (event) => {
    setBlockStatus(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  return (
    <div className="flex">
      {/* Sidebar or admin dashboard layout */}
      <DashboardLayout />
      <div className="flex-grow p-6 bg-gray-100">
        <h1 className="text-3xl font-semibold mb-6">User Management</h1>

        {/* Filters: Search, Block Status, and Sort */}
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email"
            className="px-4 py-2 border rounded-md"
          />
          <select
            value={blockStatus}
            onChange={handleBlockStatusChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="blocked">Blocked</option>
            <option value="unblocked">Unblocked</option>
          </select>
          <select
            value={sort}
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
            <table className="table-auto w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-none">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      {user.contact_number || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => blockUser(user._id, user.is_blocked)}
                        className={`px-4 py-2 text-white rounded ${
                          user.is_blocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {user.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

export default UserPage;
