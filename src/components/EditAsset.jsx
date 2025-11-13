/**
 * EditAsset.jsx
 *
 * Asset editing component for modifying existing equipment/asset information.
 * Provides a comprehensive form pre-populated with current asset data for updates.
 *
 * Features:
 * - Pre-populated form with existing asset data
 * - All fields editable (name, ID, category, location, dates, maintenance)
 * - File attachment management (upload, view, delete)
 * - File upload with drag-and-drop support
 * - Form validation before saving
 * - Cancel functionality with confirmation
 * - Breadcrumb navigation
 * - Responsive layout with left form / right file uploader
 * - Dark mode support
 *
 * Form Fields (Editable):
 * - Asset Name - Primary identifier
 * - Tag ID - Unique asset tag/number
 * - Category - Dropdown selection (Computers, Laptops, Monitors, Furniture)
 * - Location - Dropdown selection (office locations, remote)
 * - Acquisition Date - Date picker for purchase date
 * - Periodic Maintenance Schedule - Dropdown (None, Monthly, Quarterly, Annually)
 *
 * File Management:
 * - Upload new files (PDF, PNG, JPG, DOCX)
 * - View attached files list
 * - Delete existing files
 * - Drag-and-drop file upload
 *
 * Props:
 * @param {string} assetId - Unique ID of the asset to edit
 * @param {Function} onSave - Callback invoked when user saves changes
 *                             Receives updated asset object as parameter
 * @param {Function} onCancel - Callback invoked when user cancels editing
 *                               Allows parent to handle navigation back
 *
 * State Management:
 * @state {Object} formData - Current form field values
 * @state {Array} attachedFiles - List of file objects attached to asset
 * @state {boolean} hasChanges - Tracks if user made any modifications
 * @state {File[]} newFiles - Newly uploaded files pending save
 *
 * Context Usage:
 * @context {Array} items - All assets for finding the asset to edit
 * @context {Function} updateEquipment - Function to update asset in context (to be implemented)
 *
 * Validation:
 * - All fields optional except Asset Name and Tag ID
 * - Duplicate Tag ID check (excluding current asset)
 * - Warns user before discarding unsaved changes on cancel
 *
 * Save Flow:
 * 1. User modifies form fields and/or files
 * 2. hasChanges flag set to true
 * 3. User clicks "Save Changes"
 * 4. Form validates required fields
 * 5. Asset updated in EquipmentContext
 * 6. onSave callback invoked
 * 7. Navigate back to previous view
 *
 * Cancel Flow:
 * 1. User clicks "Cancel"
 * 2. If hasChanges, show confirmation dialog
 * 3. If confirmed or no changes, invoke onCancel callback
 *
 * @example
 * <EditAsset
 *   assetId="1699276800000-a3b5c7d"
 *   onSave={(updatedAsset) => console.log('Saved:', updatedAsset)}
 *   onCancel={() => setView('management')}
 * />
 */

import React, { useState, useContext, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import API_BASE_URL from "../config/api";

const EditAsset = ({ assetId, onSave, onCancel }) => {
  // Access global equipment context
  const { items, updateEquipment } = useContext(EquipmentContext);

  // Find the asset to edit
  const asset = items.find((item) => item.id === assetId);

  // Tags state - fetched from Tag Management
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // State: Form data pre-populated with existing asset data
  const [formData, setFormData] = useState({
    name: asset?.name || "",
    id: asset?.id || "",
    category: asset?.category || "",
    location: asset?.location || "",
    acquisitionDate: asset?.acquisitionDate || asset?.purchaseDate || "",
    maintenanceSchedule:
      asset?.maintenancePeriod || asset?.maintenanceSchedule || "",
    status: asset?.status || "In Use",
    assignedTo: asset?.assignedTo || "",
    department: asset?.department || "",
  });

  // State: Users list for assignment dropdown
  const [users, setUsers] = useState([]);

  // State: Attached files management
  const [attachedFiles, setAttachedFiles] = useState([
    { name: "warranty_info.pdf", type: "description", id: "file-1" },
    { name: "asset_photo.jpg", type: "image", id: "file-2" },
  ]);

  // State: Track if user made changes
  const [hasChanges, setHasChanges] = useState(false);

  // State: Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success or error

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success or error)
   */
  const showToastNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Update form data when asset is loaded or changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || "",
        id: asset.id || "",
        category: asset.category || "",
        location: asset.location || "",
        acquisitionDate: asset.acquisitionDate || asset.purchaseDate || "",
        maintenanceSchedule:
          asset.maintenancePeriod || asset.maintenanceSchedule || "",
        status: asset.status || "In Use",
        assignedTo: asset.assignedTo || "",
        department: asset.department || "",
        model: asset.model || "",
        serial: asset.serial || "",
        cost: asset.cost || "",
        notes: asset.notes || "",
      });
      // Also load existing files if they exist
      if (asset.attachedFiles && Array.isArray(asset.attachedFiles)) {
        setAttachedFiles(asset.attachedFiles);
      }
    }
  }, []);

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch tags from Tag Management on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const response = await fetch(`${API_BASE_URL}/tags`);
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  /**
   * Get tags by category
   */
  const getTagsByCategory = (category) => {
    return tags.filter((tag) => tag.category === category);
  };

  // Handle asset not found
  if (!asset) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Asset not found</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  /**
   * Handle input field changes
   *
   * Updates formData state and sets hasChanges flag.
   *
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  /**
   * Handle file upload
   *
   * Processes selected files and adds them to attachedFiles list.
   * Supports multiple file types: PDF, PNG, JPG, DOCX.
   *
   * @param {Event} e - File input change event
   */
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFileObjects = files.map((file) => ({
      name: file.name,
      type: file.type.includes("image") ? "image" : "description",
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: file,
    }));

    setAttachedFiles((prev) => [...prev, ...newFileObjects]);
    setHasChanges(true);
  };
  /**
   * Handle file deletion
   *
   * Removes file from attachedFiles list.
   *
   * @param {string} fileId - Unique ID of file to delete
   */
  const handleDeleteFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
    setHasChanges(true);
  };

  /**
   * Handle form save
   *
   * Validates form, updates asset in context, logs activity, and invokes onSave callback.
   *
   * @param {Event} e - Form submit event
   */
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.id) {
      alert("Asset Name and Tag ID are required.");
      return;
    }

    // Check for duplicate Tag ID (excluding current asset)
    const duplicateId = items.find(
      (item) => item.id === formData.id && item.id !== assetId
    );
    if (duplicateId) {
      alert("Tag ID already exists. Please use a unique Tag ID.");
      return;
    }

    try {
      // Create updated asset object with all fields
      const updatedAsset = {
        ...asset,
        name: formData.name,
        id: formData.id,
        category: formData.category,
        location: formData.location,
        acquisitionDate: formData.acquisitionDate,
        purchaseDate: formData.acquisitionDate, // Keep both for compatibility
        maintenancePeriod: formData.maintenanceSchedule,
        maintenanceSchedule: formData.maintenanceSchedule,
        status: formData.status,
        assignedTo: formData.assignedTo,
        department: formData.department,
        model: formData.model,
        serial: formData.serial,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        notes: formData.notes,
        attachedFiles: attachedFiles,
        lastModified: new Date().toISOString(),
      };

      // Update in context (makes API call to backend)
      await updateEquipment(assetId, updatedAsset);

      // Success notification
      console.log("Asset updated successfully:", updatedAsset);
      showToastNotification("Asset updated successfully!", "success");

      // Reset hasChanges flag
      setHasChanges(false);

      if (onSave) {
        onSave(updatedAsset);
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      showToastNotification(
        "Failed to update asset. Please try again.",
        "error"
      );
    }
  };
  /**
   * Handle cancel action
   *
   * Warns user if unsaved changes exist, then invokes onCancel callback.
   */
  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
        >
          Home
        </button>
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          /
        </span>
        <button
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
        >
          Assets
        </button>
        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          /
        </span>
        <span className="text-gray-900 dark:text-white text-sm font-medium">
          Edit Asset
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
          Edit Asset: {asset.name}
        </h1>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSave}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Name */}
              <label className="flex flex-col col-span-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Asset Name *
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  placeholder="Enter asset name"
                />
              </label>

              {/* Tag ID */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Tag ID *
                </span>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  placeholder="e.g., LAPTOP-001"
                  disabled
                  title="Tag ID cannot be changed"
                />
              </label>

              {/* Category */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Category
                </span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags ? "Loading categories..." : "Select category"}
                  </option>
                  {getTagsByCategory("Asset Type").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Location */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Location
                </span>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags ? "Loading locations..." : "Select location"}
                  </option>
                  {getTagsByCategory("Location").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Acquisition Date */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Acquisition Date
                </span>
                <input
                  type="date"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                />
              </label>

              {/* Periodic Maintenance Schedule */}
              <label className="flex flex-col col-span-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Periodic Maintenance Schedule
                </span>
                <select
                  name="maintenanceSchedule"
                  value={formData.maintenanceSchedule}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                >
                  <option value="">None</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                  <option value="Bi-annually">Bi-annually</option>
                </select>
              </label>

              {/* Status */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Status
                </span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                >
                  <option value="In Use">In Use</option>
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Retired">Retired</option>
                  <option value="Lost">Lost</option>
                </select>
              </label>

              {/* Assigned To */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Assigned To
                </span>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user.name}>
                      {user.name} - {user.department || "No Department"}
                    </option>
                  ))}
                </select>
              </label>

              {/* Model Number */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Model Number
                </span>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  placeholder="e.g., XPS-15-9520"
                />
              </label>

              {/* Serial Number */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Serial Number
                </span>
                <input
                  type="text"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  placeholder="e.g., ABC123XYZ"
                />
              </label>

              {/* Cost */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Cost ($)
                </span>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-12 px-3 text-base"
                  placeholder="e.g., 1299.99"
                />
              </label>

              {/* Notes */}
              <label className="flex flex-col col-span-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">
                  Notes
                </span>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-base"
                  placeholder="Additional information about this asset..."
                />
              </label>
            </div>

            {/* Right Column: File Uploader */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Attached Files
              </h3>

              {/* File Upload Area */}
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full p-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-3">
                    cloud_upload
                  </span>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, PNG, JPG or DOCX
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Attached Files List */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                          {file.type === "image" ? "image" : "description"}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 h-12 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
            toastType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span className="material-symbols-outlined">
            {toastType === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 hover:opacity-75"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditAsset;
