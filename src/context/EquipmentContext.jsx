/**
 * EquipmentContext.jsx
 *
 * Global state management for equipment/asset data using React Context API.
 * Provides centralized storage and functions for managing equipment across the entire application.
 * Now integrated with MongoDB backend via REST API.
 *
 * Purpose:
 * - Central repository for all equipment/asset items (fetched from MongoDB)
 * - Activity log tracking for recent actions on assets
 * - CRUD operations via API calls
 * - Real-time synchronization with database
 *
 * API Integration:
 * - Base URL: http://localhost:5000/api
 * - Endpoints: /equipment, /activities, /users, /tags
 * - All operations automatically sync with MongoDB
 *
 * Data Structure:
 * - Equipment items: Array of objects from MongoDB with properties:
 *   - id: Unique identifier (custom asset ID)
 *   - name: Asset name (required)
 *   - model: Model number/name
 *   - serial: Serial number
 *   - location: Physical location
 *   - notes: Additional information
 *   - maintenancePeriod: Maintenance schedule
 *   - status: Current status ("In Use", "Available", "Under Maintenance", "Retired", "Lost")
 *   - category: Asset type/category
 *   - purchaseDate: Date of purchase
 *   - cost: Purchase cost
 *   - createdAt: MongoDB timestamp
 *   - updatedAt: MongoDB timestamp
 *
 * - Activity items: Array of recent action logs from MongoDB:
 *   - assetName: Name of affected asset
 *   - assetId: Reference to equipment ID
 *   - action: Action description
 *   - actionType: Type of action performed
 *   - user: User who performed action
 *   - date: Relative time string (e.g., "2m ago")
 *   - timestamp: Unix timestamp
 *   - icon: Emoji icon for visual identification
 *
 * Usage:
 * 1. Wrap your app with <EquipmentProvider>
 * 2. Access context in any component: const { items, addEquipment } = useContext(EquipmentContext)
 * 3. Use provided functions and state as needed
 *
 * @example
 * // In your root component:
 * <EquipmentProvider>
 *   <App />
 * </EquipmentProvider>
 *
 * @example
 * // In any child component:
 * const { items, addEquipment, updateEquipment, deleteEquipment, getById, activities } = useContext(EquipmentContext);
 */

import React, { createContext, useState, useEffect } from "react";

// API Base URL - configure based on environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create the Context - null default value, will be populated by Provider
export const EquipmentContext = createContext(null);

/**
 * EquipmentProvider Component
 *
 * Context provider that wraps the application and manages equipment state.
 * Fetches data from MongoDB backend and provides CRUD operations.
 *
 * Provided Values:
 * @provides {Array} items - All equipment/asset objects from MongoDB
 * @provides {Array} activities - Recent activity log entries from MongoDB
 * @provides {boolean} loading - Loading state for API calls
 * @provides {string|null} error - Error message if API calls fail
 * @provides {Function} addEquipment - Add new equipment via API
 * @provides {Function} updateEquipment - Update equipment via API
 * @provides {Function} deleteEquipment - Delete equipment via API
 * @provides {Function} getById - Retrieve equipment by unique ID
 * @provides {Function} addActivity - Add entry to activity log via API
 * @provides {Function} refreshData - Manually refresh data from server
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components that need equipment data access
 *
 * @returns {JSX.Element} Provider component wrapping children with equipment context
 */
export function EquipmentProvider({ children }) {
  // State: Array that stores all equipment items from MongoDB
  const [items, setItems] = useState([]);

  // State: Array that stores recent activity/actions from MongoDB
  const [activities, setActivities] = useState([]);

  // State: Loading indicator for API calls
  const [loading, setLoading] = useState(true);

  // State: Error message for failed API calls
  const [error, setError] = useState(null);

  /**
   * Fetch all equipment from MongoDB on component mount
   */
  useEffect(() => {
    fetchEquipment();
    fetchActivities();
  }, []);

  /**
   * Fetch all equipment from API
   */
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/equipment`);

      if (!response.ok) {
        throw new Error(`Failed to fetch equipment: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError(err.message);
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all activities from API
   */
  const fetchActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activities?limit=50`);

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities([]); // Set empty array on error
    }
  };

  /**
   * Add a new activity entry to the activity log via API
   *
   * @param {Object} activity - The activity data object
   * @param {string} activity.assetName - Name of the asset involved
   * @param {string} [activity.assetId] - ID of the asset involved
   * @param {string} activity.action - Description of what happened
   * @param {string} activity.actionType - Type/category of action
   * @param {string} activity.user - User who performed the action
   * @param {string} activity.icon - Emoji icon for visual identification
   *
   * @example
   * addActivity({
   *   assetName: "MacBook Pro",
   *   assetId: "LAPTOP-001",
   *   action: "Checked Out",
   *   actionType: "Checked Out",
   *   user: "John Doe",
   *   icon: "💻"
   * });
   */
  async function addActivity(activity) {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activity),
      });

      if (!response.ok) {
        throw new Error(`Failed to add activity: ${response.statusText}`);
      }

      const newActivity = await response.json();

      // Update local state
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));

      return newActivity;
    } catch (err) {
      console.error("Error adding activity:", err);
      throw err;
    }
  }

  /**
   * Add a new equipment item to the inventory via API
   *
   * Sends equipment data to MongoDB backend, which generates timestamps
   * and validates data. Also logs the activity automatically on server.
   *
   * @param {Object} data - The equipment data object
   * @param {string} data.id - Asset ID/Tag ID (required, must be unique)
   * @param {string} data.name - Asset name (required)
   * @param {string} [data.model] - Model number/name
   * @param {string} [data.serial] - Serial number
   * @param {string} [data.location] - Physical location
   * @param {string} [data.notes] - Additional information
   * @param {string} [data.maintenancePeriod] - Maintenance schedule
   * @param {string} [data.status="In Use"] - Current status
   * @param {string} [data.category] - Asset type/category
   * @param {string} [data.purchaseDate] - Date of purchase
   * @param {number} [data.cost] - Purchase cost
   *
   * @returns {Promise<Object>} The created equipment item from MongoDB
   *
   * @example
   * const laptop = await addEquipment({
   *   id: "LAPTOP-001",
   *   name: "Dell XPS 15",
   *   model: "XPS-15-9520",
   *   serial: "ABC123",
   *   location: "Office A",
   *   status: "In Use"
   * });
   */
  async function addEquipment(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to add equipment: ${response.statusText}`
        );
      }

      const newItem = await response.json();

      // Update local state
      setItems((prev) => [newItem, ...prev]);

      // Refresh activities to show the new "Added" activity
      await fetchActivities();

      return newItem;
    } catch (err) {
      console.error("Error adding equipment:", err);
      throw err;
    }
  }

  /**
   * Update an existing equipment item via API
   *
   * Finds the equipment by ID and updates it with new data in MongoDB.
   * Logs the update activity automatically on server.
   *
   * @param {string} id - The unique ID of the equipment to update
   * @param {Object} updatedData - The updated equipment data
   * @returns {Promise<Object|null>} The updated equipment object if found, null if not found
   *
   * @example
   * const updated = await updateEquipment("LAPTOP-001", {
   *   name: "Dell XPS 15 - Updated",
   *   location: "Office B",
   *   status: "Under Maintenance"
   * });
   */
  async function updateEquipment(id, updatedData) {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to update equipment: ${response.statusText}`
        );
      }

      const updatedItem = await response.json();

      // Update local state
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );

      // Refresh activities to show the new "Updated" activity
      await fetchActivities();

      return updatedItem;
    } catch (err) {
      console.error("Error updating equipment:", err);
      throw err;
    }
  }

  /**
   * Delete an equipment item via API
   *
   * Removes the equipment from MongoDB and logs the deletion activity.
   *
   * @param {string} id - The unique ID of the equipment to delete
   * @returns {Promise<Object>} The deleted equipment object
   *
   * @example
   * await deleteEquipment("LAPTOP-001");
   */
  async function deleteEquipment(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to delete equipment: ${response.statusText}`
        );
      }

      const deletedItem = await response.json();

      // Update local state
      setItems((prev) => prev.filter((item) => item.id !== id));

      // Refresh activities to show the new "Deleted" activity
      await fetchActivities();

      return deletedItem;
    } catch (err) {
      console.error("Error deleting equipment:", err);
      throw err;
    }
  }

  /**
   * Find an equipment item by its unique ID
   *
   * Searches through the equipment array and returns the matching item.
   * Useful for looking up details when you have an ID (e.g., from QR code scan).
   *
   * @param {string} id - The unique ID of the equipment to find
   * @returns {Object|undefined} The equipment object if found, undefined if not found
   *
   * @example
   * const item = getById("LAPTOP-001");
   * if (item) {
   *   console.log(item.name); // "Dell XPS 15"
   * } else {
   *   console.log("Equipment not found");
   * }
   */
  function getById(id) {
    // Search through the items array and return the first item with matching ID
    return items.find((i) => i.id === id);
  }

  /**
   * Manually refresh data from server
   *
   * Useful for forcing a data refresh after external changes.
   */
  async function refreshData() {
    await Promise.all([fetchEquipment(), fetchActivities()]);
  }

  // Provide the equipment data and functions to all child components
  return (
    <EquipmentContext.Provider
      value={{
        items,
        activities,
        loading,
        error,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        getById,
        addActivity,
        refreshData,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}

export default EquipmentProvider;
