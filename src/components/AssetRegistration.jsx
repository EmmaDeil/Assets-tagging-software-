/**
 * AssetRegistration.jsx
 *
 * Comprehensive asset registration form for adding new equipment to the inventory.
 * Provides a complete interface for capturing all asset details with validation and QR code generation.
 *
 * Features:
 * - Multi-field registration form with validation
 * - Real-time QR code preview for registered assets
 * - File upload support for asset documentation/images
 * - Camera integration for capturing asset photos
 * - Success modal with QR code display and print functionality
 * - Form validation before submission
 * - Automatic equipment addition to global context
 * - Clean, responsive form layout
 *
 * Form Fields:
 * - Asset Name (required) - Primary identifier
 * - Asset ID (required) - Unique asset tag/number
 * - Category - Type/classification of asset
 * - Location - Physical location
 * - Acquisition Date - Purchase/acquisition date (defaults to today)
 * - Description - Detailed notes and information
 * - Model - Model number/name
 * - Serial Number - Manufacturer serial number
 * - Status - Current status (In Use, Available, Under Maintenance, Retired, Lost)
 * - Maintenance Period - Scheduled maintenance frequency
 *
 * Props:
 * @param {Function} onSuccess - Callback invoked after successful registration
 *                                 Called after user closes success modal
 * @param {Function} onCancel - Callback invoked when user cancels registration
 *                               Allows parent to handle navigation back
 *
 * State Management:
 * @state {Object} formData - Form field values
 * @state {boolean} showSuccessModal - Success modal visibility
 * @state {Object} registeredAsset - Asset data for success display
 * @state {Array} uploadedFiles - Uploaded file objects
 * @state {boolean} showCameraModal - Camera modal visibility
 * @state {MediaStream} cameraStream - Active camera stream for capture
 *
 * Validation:
 * - Required fields: name, id, category, location
 * - Shows error alert if required fields are missing
 * - Prevents submission until all required fields are filled
 *
 * Success Flow:
 * 1. User fills form and clicks Register
 * 2. Form validates required fields
 * 3. Asset added to EquipmentContext
 * 4. Success modal appears with QR code
 * 5. User can print QR code or close modal
 * 6. onSuccess callback invoked, typically navigates back to management view
 *
 * @example
 * <AssetRegistration
 *   onSuccess={() => setView('management')}
 *   onCancel={() => setView('management')}
 * />
 */

import React, { useState, useContext, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import QRCode from "react-qr-code";
import API_BASE_URL from "../config/api";

const AssetRegistration = ({ onSuccess, onCancel }) => {
  // Access global equipment context to add new assets
  const { addEquipment } = useContext(EquipmentContext);

  // Company name - can be configured or fetched from settings
  const [companyName] = useState("ASE"); // Default company name

  // Tags state - fetched from Tag Management
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Users state - fetched for Assigned To dropdown
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error, info

  // Form state: Stores all input field values
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    category: "",
    location: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    description: "",
    model: "",
    serialNumber: "",
    status: "Available",
    maintenancePeriod: "",
    assignedTo: "",
    department: "",
  });

  // Success modal state: Controls post-registration success dialog
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredAsset, setRegisteredAsset] = useState(null);

  // File upload state: Manages asset documentation/images
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  /**
   * Show toast notification
   */
  const showToastNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /**
   * Generate Tag ID based on category, location, and company name
   * Format: COMPANY-CATEGORY-LOCATION-RANDOMNUMBER
   * Example: ASE-ELEC-HQ-001234
   */
  const generateTagId = (category, location, company) => {
    if (!category || !location) return "";

    // Extract abbreviations
    const companyAbbr = company.substring(0, 3).toUpperCase();
    const categoryAbbr = category
      .substring(0, 4)
      .toUpperCase()
      .replace(/\s/g, "");
    const locationAbbr = location
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();

    // Generate random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);

    return `${companyAbbr}-${categoryAbbr}-${locationAbbr}-${randomNum}`;
  };

  /**
   * Fetch tags from Tag Management on component mount
   */
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
   * Fetch users from User Management on component mount
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Get tags by category
   */
  const getTagsByCategory = (category) => {
    return tags.filter((tag) => tag.category === category);
  };

  /**
   * Auto-generate Tag ID when category or location changes
   */
  useEffect(() => {
    if (formData.category && formData.location) {
      const newId = generateTagId(
        formData.category,
        formData.location,
        companyName
      );
      setFormData((prev) => ({
        ...prev,
        id: newId,
      }));
    }
  }, [formData.category, formData.location, companyName]);

  /**
   * Handle input field changes
   *
   * Updates formData state when user types in any input field.
   * Maintains all other field values while updating the changed field.
   *
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   *
   * Validates required fields, adds asset to context, and shows success modal.
   * Prevents default form submission and event bubbling.
   *
   * Validation Rules:
   * - name, id, category, location are required
   * - Shows alert if validation fails
   *
   * Success Actions:
   * - Adds equipment to EquipmentContext
   * - Stores registered asset data for modal display
   * - Shows success modal with QR code
   *
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Form submitted with data:", formData);

    // Validate required fields
    if (
      !formData.name ||
      !formData.id ||
      !formData.category ||
      !formData.location
    ) {
      showToastNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      // Create asset object matching Equipment model schema
      const newAsset = {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        location: formData.location,
        model: formData.model || "",
        serial: formData.serialNumber || "",
        notes: formData.description || "",
        status: formData.status,
        maintenancePeriod: formData.maintenancePeriod || "",
        purchaseDate: formData.acquisitionDate,
        acquisitionDate: formData.acquisitionDate,
        cost: 0,
        assignedTo: formData.assignedTo || "",
        department: formData.department || "",
      };

      console.log("Created asset object:", newAsset);

      // Add equipment to context (sends to MongoDB) - WAIT for it to complete
      await addEquipment(newAsset);

      console.log("Asset successfully added to database");

      // Store registered asset and show success modal
      setRegisteredAsset(newAsset);
      setShowSuccessModal(true);

      console.log("Success modal should be visible");
    } catch (error) {
      console.error("Error submitting form:", error);
      showToastNotification(
        `Failed to save asset: ${error.message || "Please try again"}`,
        "error"
      );
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setRegisteredAsset(null);

    // Reset form
    setFormData({
      name: "",
      id: "",
      category: "",
      location: "",
      acquisitionDate: new Date().toISOString().split("T")[0],
      description: "",
      model: "",
      serialNumber: "",
      status: "Available",
      maintenancePeriod: "",
      assignedTo: "",
      department: "",
    });

    // Notify parent component
    if (onSuccess) {
      onSuccess();
    }
  };

  // Handle print QR code
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const qrElement = document.getElementById("success-qr-code");

    if (qrElement) {
      const svgData = qrElement.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code - ${registeredAsset?.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
              }
              .asset-info {
                margin-top: 20px;
              }
              .asset-info p {
                margin: 5px 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              ${svgData}
              <div class="asset-info">
                <p><strong>Asset Name:</strong> ${registeredAsset?.name}</p>
                <p><strong>Tag ID:</strong> ${registeredAsset?.id}</p>
                <p><strong>Category:</strong> ${registeredAsset?.category}</p>
                <p><strong>Location:</strong> ${registeredAsset?.location}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Handle download QR code
  const handleDownload = () => {
    const svg = document
      .getElementById("success-qr-code")
      ?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 300, 300);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${registeredAsset?.id || "asset"}-qrcode.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            url: e.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const fakeEvent = {
      target: {
        files: files,
      },
    };
    handleFileSelect(fakeEvent);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Open camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      setShowCameraModal(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      showToastNotification(
        "Unable to access camera. Please check permissions.",
        "error"
      );
    }
  };

  // Close camera
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    const video = document.getElementById("camera-video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedFiles((prev) => [
            ...prev,
            {
              name: `Camera_${Date.now()}.jpg`,
              type: "image/jpeg",
              size: blob.size,
              url: e.target.result,
            },
          ]);
        };
        reader.readAsDataURL(blob);
        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // Set video stream when camera modal opens
  React.useEffect(() => {
    if (showCameraModal && cameraStream) {
      const video = document.getElementById("camera-video");
      if (video) {
        video.srcObject = cameraStream;
      }
    }
  }, [showCameraModal, cameraStream]);

  // Cleanup camera stream on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <>
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 py-4">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between gap-4 items-center px-1">
          <div>
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Register New Asset
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              Fill in the details below to register a new asset in the system
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                inventory_2
              </span>
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Asset Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Required fields are marked with *
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-8">
            {/* Asset Name */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5 flex items-center gap-1">
                  Asset Name
                  <span className="text-red-500">*</span>
                </p>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500  p-3 text-base font-normal leading-normal transition-all"
                  placeholder="e.g., MacBook Pro 16-inch"
                />
              </label>
            </div>

            {/* Tag ID */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5 flex items-center gap-1">
                  Tag ID
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    (Auto-generated)
                  </span>
                </p>
                <div className="flex w-full flex-1 items-stretch rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all">
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    required
                    readOnly
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-gray-800 dark:text-gray-100 focus:outline-0 bg-gray-50 dark:bg-gray-700/50 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal border-0 cursor-not-allowed"
                    placeholder="Select category and location first"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.category && formData.location) {
                        const newId = generateTagId(
                          formData.category,
                          formData.location,
                          companyName
                        );
                        setFormData((prev) => ({ ...prev, id: newId }));
                      }
                    }}
                    disabled={!formData.category || !formData.location}
                    className="text-gray-500 dark:text-gray-400 flex bg-gray-50 dark:bg-gray-700 items-center justify-center px-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Regenerate Tag ID"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      refresh
                    </span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: {companyName}-[Category]-[Location]-[Number]
                </p>
              </label>
            </div>

            {/* Category */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5 flex items-center gap-1">
                  Category
                  <span className="text-red-500">*</span>
                </p>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags
                      ? "Loading categories..."
                      : "Select a category"}
                  </option>
                  {getTagsByCategory("Asset Type").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Location */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5 flex items-center gap-1">
                  Location
                  <span className="text-red-500">*</span>
                </p>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags ? "Loading locations..." : "Select a location"}
                  </option>
                  {getTagsByCategory("Location").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Acquisition Date */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5 flex items-center gap-1">
                  Acquisition Date
                  <span className="text-red-500">*</span>
                </p>
                <input
                  type="date"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={handleChange}
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                />
              </label>
            </div>

            {/* Model Number */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Model Number
                </p>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  placeholder="e.g., A2780"
                />
              </label>
            </div>

            {/* Serial Number */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Serial Number
                </p>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  placeholder="e.g., C02J1234K123"
                />
              </label>
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Status
                </p>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags ? "Loading statuses..." : "Select status"}
                  </option>
                  {getTagsByCategory("Status").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Maintenance Period */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Maintenance Period
                </p>
                <select
                  name="maintenancePeriod"
                  value={formData.maintenancePeriod}
                  onChange={handleChange}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                >
                  <option value="">Select maintenance schedule</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Every 3 Months">Every 3 Months</option>
                  <option value="Every 6 Months">Every 6 Months</option>
                  <option value="Annually">Annually</option>
                  <option value="Every 2 Years">Every 2 Years</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </label>
            </div>

            {/* Assigned To */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Assigned To
                </p>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  disabled={loadingUsers}
                >
                  <option value="">
                    {loadingUsers ? "Loading users..." : "Select user"}
                  </option>
                  {users.map((user) => (
                    <option key={user._id} value={user.name}>
                      {user.name} {user.email ? `(${user.email})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Department */}
            <div className="md:col-span-1">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Department
                </p>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 h-12 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 text-base font-normal leading-normal transition-all"
                  disabled={loadingTags}
                >
                  <option value="">
                    {loadingTags
                      ? "Loading departments..."
                      : "Select department"}
                  </option>
                  {getTagsByCategory("Department").map((tag) => (
                    <option key={tag._id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="flex flex-col w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold leading-normal pb-2.5">
                  Description (Optional)
                </p>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-xl text-gray-800 dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-500 min-h-28 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-relaxed transition-all"
                  placeholder="Add any relevant notes or details about this asset..."
                />
              </label>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="flex items-center gap-3 pt-10 pb-6 border-t mt-10 border-gray-200 dark:border-gray-700">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                cloud_upload
              </span>
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-xl font-bold">
                Attachments &amp; Images
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Upload photos, documents, or take pictures with your camera
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">
                    upload_file
                  </span>
                  Choose Files
                </label>

                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">
                    photo_camera
                  </span>
                  Take Photo
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  or drag and drop files here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF or PDF • Maximum 10MB per file
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uploaded Files ({uploadedFiles.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <span className="material-symbols-outlined text-4xl text-gray-400">
                          description
                        </span>
                      </div>
                    )}
                    <div className="p-2 bg-white dark:bg-gray-800">
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-blue-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-6 hover:bg-blue-700"
            >
              Save Asset
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">
                  check_circle
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
                Asset Registered Successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The QR code has been generated for your new asset.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 sm:p-8 border-y border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center gap-4">
                <div id="success-qr-code" className="bg-white p-4 rounded-lg">
                  {registeredAsset?.id ? (
                    <QRCode value={registeredAsset.id} size={200} />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 text-gray-400">
                      No QR Code
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                    Asset Name
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {registeredAsset?.name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mt-2">
                    Tag ID
                  </p>
                  <p className="font-mono text-gray-600 dark:text-gray-300">
                    {registeredAsset?.id || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-6 sm:p-8">
              <button
                onClick={handlePrint}
                className="w-full flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600/20 dark:hover:bg-blue-600/30"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Print
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600/20 dark:hover:bg-blue-600/30"
              >
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                Download
              </button>
            </div>

            <div className="px-6 sm:px-8 pb-6">
              <button
                onClick={handleCloseModal}
                className="w-full flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Take Photo
              </h3>
              <button
                onClick={closeCamera}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-center gap-3">
              <button
                onClick={closeCamera}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              toastType === "success"
                ? "bg-green-500 text-white"
                : toastType === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined">
              {toastType === "success"
                ? "check_circle"
                : toastType === "error"
                ? "error"
                : "info"}
            </span>
            <p className="font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetRegistration;
