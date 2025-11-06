/**
 * EquipmentContext.jsx
 *
 * This file provides a React Context that manages the state for all equipment/assets in the app.
 * It allows components anywhere in the app to access and modify the equipment list without
 * passing props through multiple levels (prop drilling).
 *
 * How it works:
 * - The EquipmentProvider wraps your app and stores the equipment data in state
 * - Any component can use `useContext(EquipmentContext)` to access the data and functions
 * - Equipment is stored as an array of objects, each with fields like name, model, serial, etc.
 */

import React, { createContext, useState } from "react";

// Create the Context - this will be used by components to access equipment data
export const EquipmentContext = createContext(null);

/**
 * EquipmentProvider Component
 *
 * This is a wrapper component that provides equipment data to all child components.
 * Wrap your app with this provider so all components can access equipment data.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components that need access to equipment data
 */
export function EquipmentProvider({ children }) {
  // State: Array that stores all equipment items
  // Each item is an object with properties: id, name, model, serial, location, notes
  const [items, setItems] = useState([]);

  /**
   * Add a new equipment item to the list
   *
   * @param {Object} data - The equipment data (name, model, serial, location, notes)
   * @returns {Object} The created equipment item with its generated ID
   */
  function addEquipment(data) {
    // Generate a unique ID if one wasn't provided
    // Format: timestamp-randomstring (e.g., "1699276800000-a3b5c7d")
    const id =
      data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Create the complete item object by spreading the input data and adding the ID
    const item = { ...data, id };

    // Add the new item to the beginning of the array (newest first)
    setItems((prev) => [item, ...prev]);

    // Return the created item so the caller can use it (e.g., show the ID to the user)
    return item;
  }

  /**
   * Find an equipment item by its ID
   *
   * @param {string} id - The unique ID of the equipment to find
   * @returns {Object|undefined} The equipment object if found, undefined if not found
   */
  function getById(id) {
    // Search through the items array and return the first item with matching ID
    return items.find((i) => i.id === id);
  }

  // Provide the equipment data and functions to all child components
  // Any component can access: items (array), addEquipment (function), getById (function)
  return (
    <EquipmentContext.Provider value={{ items, addEquipment, getById }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export default EquipmentProvider;
