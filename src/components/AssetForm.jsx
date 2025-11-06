/**
 * AssetForm.jsx
 *
 * This component displays a form where users can add new equipment/assets.
 * When the form is submitted, it creates a new equipment entry and stores it
 * in the EquipmentContext so it can be displayed in the table.
 *
 * Features:
 * - Input fields for equipment details (name, model, serial, location, notes)
 * - Form validation (name is required)
 * - Automatic form reset after submission
 * - User feedback via alert showing the created equipment ID
 */

import React, { useState, useContext } from "react";
import { EquipmentContext } from "../context/EquipmentContext";

export default function AssetForm() {
  // Access the addEquipment function from context to save new equipment
  const { addEquipment } = useContext(EquipmentContext);

  // Local state: stores the current values of all form fields
  // This state updates as the user types in each input field
  const [form, setForm] = useState({
    name: "", // Equipment name (required)
    model: "", // Equipment model number
    serial: "", // Serial number
    location: "", // Physical location of the equipment
    notes: "", // Additional notes or description
  });

  /**
   * Handle input field changes
   * Updates the form state when user types in any input field
   *
   * @param {Event} e - The change event from the input field
   */
  function onChange(e) {
    // Update only the field that changed, keeping all other fields the same
    // e.target.name = the input's name attribute (e.g., "model")
    // e.target.value = what the user typed
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Handle form submission
   * Creates a new equipment entry and resets the form
   *
   * @param {Event} e - The form submit event
   */
  function onSubmit(e) {
    // Prevent the default form submission (which would reload the page)
    e.preventDefault();

    // Save the equipment data to context (which generates an ID and stores it)
    const created = addEquipment(form);

    // Reset all form fields to empty strings so user can add another item
    setForm({ name: "", model: "", serial: "", location: "", notes: "" });

    // Show a confirmation message with the generated equipment ID
    alert(`Created equipment with id: ${created.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Equipment Name - REQUIRED field */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Name</span>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          required // HTML5 validation: form won't submit if empty
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      {/* Equipment Model - optional */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Model</span>
        <input
          name="model"
          value={form.model}
          onChange={onChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      {/* Serial Number - optional */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Serial</span>
        <input
          name="serial"
          value={form.serial}
          onChange={onChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      {/* Location - optional */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Location</span>
        <input
          name="location"
          value={form.location}
          onChange={onChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      {/* Notes - optional */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Notes</span>
        <input
          name="notes"
          value={form.notes}
          onChange={onChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </label>

      {/* Submit button */}
      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add asset
        </button>
      </div>
    </form>
  );
}
