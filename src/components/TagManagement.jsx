import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000/api";

const TagManagement = () => {
  // Tag data - initially empty, will be populated from database
  const [tags, setTags] = useState([]);
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "#3B82F6",
    description: "",
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All Tag Types");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch tags from backend on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch all tags from API
  const fetchTags = async () => {
    try {
      _setLoading(true);
      _setError(null);

      const response = await fetch(`${API_BASE_URL}/tags`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
      }

      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error("Error fetching tags:", err);
      _setError(err.message);
      setTags([]);
    } finally {
      _setLoading(false);
    }
  };

  // Get tag type color
  const getTagTypeColor = (category) => {
    const colors = {
      Location:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
      Department:
        "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
      "Asset Type":
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200",
      Status:
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200"
    );
  };

  // Filter tags
  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "All Tag Types" || tag.category === filterType;
    const matchesStatus =
      filterStatus === "All Statuses" || tag.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTags = filteredTags.slice(startIndex, endIndex);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({ name: "", category: "", color: "#3B82F6", description: "" });
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (tag) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      category: tag.category,
      color: tag.color || "#3B82F6",
      description: tag.description,
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (tag) => {
    setSelectedTag(tag);
    setShowDeleteModal(true);
  };

  // Create new tag
  const handleCreateTag = async (e) => {
    e.preventDefault();

    try {
      const newTag = {
        name: formData.name,
        category: formData.category,
        color: formData.color,
        description: formData.description,
      };

      const response = await fetch(`${API_BASE_URL}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTag),
      });

      if (!response.ok) {
        throw new Error(`Failed to create tag: ${response.statusText}`);
      }

      const createdTag = await response.json();
      setTags([createdTag, ...tags]);
      setShowCreateModal(false);
      setFormData({
        name: "",
        category: "",
        color: "#3B82F6",
        description: "",
      });
    } catch (err) {
      console.error("Error creating tag:", err);
      alert(`Failed to create tag: ${err.message}`);
    }
  };

  // Update tag
  const handleUpdateTag = async (e) => {
    e.preventDefault();

    try {
      const updatedTagData = {
        name: formData.name,
        category: formData.category,
        color: formData.color,
        description: formData.description,
      };

      const response = await fetch(`${API_BASE_URL}/tags/${selectedTag._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTagData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update tag: ${response.statusText}`);
      }

      const updatedTag = await response.json();
      setTags(
        tags.map((tag) => (tag._id === selectedTag._id ? updatedTag : tag))
      );
      setShowEditModal(false);
      setSelectedTag(null);
      setFormData({
        name: "",
        category: "",
        color: "#3B82F6",
        description: "",
      });
    } catch (err) {
      console.error("Error updating tag:", err);
      alert(`Failed to update tag: ${err.message}`);
    }
  };

  // Delete tag
  const handleDeleteTag = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/${selectedTag._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete tag: ${response.statusText}`);
      }

      setTags(tags.filter((tag) => tag._id !== selectedTag._id));
      setShowDeleteModal(false);
      setSelectedTag(null);
    } catch (err) {
      console.error("Error deleting tag:", err);
      alert(`Failed to delete tag: ${err.message}`);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            {/* Tag Management */}
          </h1>
          <button
            onClick={openCreateModal}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span className="truncate">Create New Tag</span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative grow max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-gray-400">
                  search
                </span>
              </div>
              <input
                className="block w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                placeholder="Search tags by name..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3 text-gray-900 dark:text-gray-100"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>All Tag Types</option>
                <option>Location</option>
                <option>Department</option>
                <option>Asset Type</option>
                <option>Status</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2 px-3 text-gray-900 dark:text-gray-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tag Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tag Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Asset Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTags.length > 0 ? (
                  currentTags.map((tag) => (
                    <tr
                      key={tag._id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tag.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTagTypeColor(
                            tag.category
                          )}`}
                        >
                          {tag.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tag.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tag.createdAt
                          ? new Date(tag.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {tag.assetCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(tag)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(tag)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No tags found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTags.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredTags.length)} of{" "}
                {filteredTags.length} results
              </p>
              <nav className="flex items-center justify-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex size-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`text-sm font-${
                        currentPage === pageNum ? "bold" : "normal"
                      } leading-normal flex size-8 items-center justify-center rounded-md ${
                        currentPage === pageNum
                          ? "text-white bg-blue-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-sm font-normal leading-normal flex size-8 items-center justify-center">
                      ...
                    </span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="text-sm font-normal leading-normal flex size-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex size-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Tag
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., New Location"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tag Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a type</option>
                  <option value="Location">Location</option>
                  <option value="Department">Department</option>
                  <option value="Asset Type">Asset Type</option>
                  <option value="Status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a description for this tag..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {showEditModal && selectedTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Tag
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTag} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tag Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Location">Location</option>
                  <option value="Department">Department</option>
                  <option value="Asset Type">Asset Type</option>
                  <option value="Status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
                  warning
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white text-center">
                Delete Tag?
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                Are you sure you want to delete the tag "
                <strong>{selectedTag.name}</strong>"? This action cannot be
                undone.
              </p>
              {selectedTag.assetCount > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This tag is currently associated
                    with {selectedTag.assetCount} asset(s).
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTag}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TagManagement;
