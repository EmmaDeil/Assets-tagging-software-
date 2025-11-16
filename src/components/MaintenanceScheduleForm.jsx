/**
 * MaintenanceScheduleForm.jsx
 *
 * Form component for scheduling new maintenance for assets.
 * This can be integrated into AssetDetails or used standalone.
 */

import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

export default function MaintenanceScheduleForm({
  assetId,
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    assetId: assetId || "",
    assetName: "",
    serviceType: "Inspection",
    technician: "",
    scheduledDate: "",
    priority: "Medium",
    description: "",
  });
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!assetId) {
      loadAssets();
    } else {
      loadAssetDetails(assetId);
    }
  }, [assetId]);

  const loadAssets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment`);
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  const loadAssetDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${id}`);
      const asset = await response.json();
      setFormData((prev) => ({
        ...prev,
        assetId: asset.id || asset._id,
        assetName: asset.name,
      }));
    } catch (error) {
      console.error("Error loading asset:", error);
    }
  };

  const handleAssetChange = (e) => {
    const selectedAsset = assets.find(
      (a) => a.id === e.target.value || a._id === e.target.value
    );
    if (selectedAsset) {
      setFormData({
        ...formData,
        assetId: selectedAsset.id || selectedAsset._id,
        assetName: selectedAsset.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule maintenance");
      }

      const result = await response.json();
      console.log("Maintenance scheduled:", result);

      if (onSuccess) onSuccess(result);
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Schedule Maintenance
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Selection (if not pre-selected) */}
        {!assetId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asset *
            </label>
            <select
              value={formData.assetId}
              onChange={handleAssetChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset.id || asset._id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Type *
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) =>
              setFormData({ ...formData, serviceType: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="Inspection">Inspection</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Repair">Repair</option>
            <option value="Replacement">Replacement</option>
            <option value="Calibration">Calibration</option>
            <option value="Upgrade">Upgrade</option>
            <option value="Preventive Maintenance">
              Preventive Maintenance
            </option>
          </select>
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scheduled Date *
          </label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) =>
              setFormData({ ...formData, scheduledDate: e.target.value })
            }
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Technician */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technician *
          </label>
          <input
            type="text"
            value={formData.technician}
            onChange={(e) =>
              setFormData({ ...formData, technician: e.target.value })
            }
            required
            placeholder="Enter technician name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            placeholder="Add any additional details..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Scheduling...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">event</span>
                Schedule Maintenance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
