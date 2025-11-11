import React, { useState, useContext, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable plugin

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  // Get real asset data from context
  const { items } = useContext(EquipmentContext);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Get unique categories from actual data
  const uniqueCategories = [
    ...new Set(items.map((item) => item.category).filter(Boolean)),
  ];

  // Filter states
  const [reportType, setReportType] = useState("Asset Status");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [assetCategory, setAssetCategory] = useState("All Categories");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assetIdFilter, setAssetIdFilter] = useState("");

  // Filtered data based on user selections
  const [filteredData, setFilteredData] = useState([]);

  // Apply filters to asset data
  useEffect(() => {
    let filtered = items.length > 0 ? [...items] : [];

    // Filter by Asset ID (highest priority - exact match)
    if (assetIdFilter.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.id?.toLowerCase().includes(assetIdFilter.toLowerCase())
      );
    }

    // Filter by category
    if (assetCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === assetCategory);
    }

    // Filter by date range
    const filterDate = (item) => {
      const dateString =
        item.acquisitionDate || item.purchaseDate || item.createdAt;
      if (!dateString) return true;

      const itemDate = new Date(dateString);

      if (dateRange === "Custom Range" && customDateFrom && customDateTo) {
        const fromDate = new Date(customDateFrom);
        const toDate = new Date(customDateTo);
        toDate.setHours(23, 59, 59, 999);
        return itemDate >= fromDate && itemDate <= toDate;
      }

      const compareDate = new Date();
      switch (dateRange) {
        case "Last 30 Days":
          compareDate.setDate(compareDate.getDate() - 30);
          return itemDate >= compareDate;
        case "Last 90 Days":
          compareDate.setDate(compareDate.getDate() - 90);
          return itemDate >= compareDate;
        case "This Year":
          return itemDate.getFullYear() === new Date().getFullYear();
        case "All Time":
        default:
          return true;
      }
    };

    filtered = filtered.filter((item) => filterDate(item));

    setFilteredData(filtered);
  }, [
    items,
    assetCategory,
    dateRange,
    customDateFrom,
    customDateTo,
    assetIdFilter,
  ]);

  // Use filtered data from context
  const reportData = filteredData;

  // Prepare chart data
  const getChartData = () => {
    // Status distribution for timeline
    const statusCounts = {
      "In Use": 0,
      "Under Maintenance": 0,
      Retired: 0,
      Available: 0,
      Lost: 0,
    };

    reportData.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, item.status)) {
        statusCounts[item.status]++;
      }
    });

    // Category distribution
    const categoryCounts = {};
    reportData.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    return { statusCounts, categoryCounts };
  };

  const { statusCounts, categoryCounts } = getChartData();

  // Line chart data (Status Over Time)
  const lineChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "In Use",
        data: [
          statusCounts["In Use"] * 0.7,
          statusCounts["In Use"] * 0.8,
          statusCounts["In Use"] * 0.9,
          statusCounts["In Use"],
        ],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Under Maintenance",
        data: [
          statusCounts["Under Maintenance"] * 1.2,
          statusCounts["Under Maintenance"] * 1.1,
          statusCounts["Under Maintenance"],
          statusCounts["Under Maintenance"],
        ],
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Available",
        data: [
          statusCounts["Available"] * 0.8,
          statusCounts["Available"] * 0.9,
          statusCounts["Available"] * 1.1,
          statusCounts["Available"],
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#374151",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "#374151"
            : "#e5e7eb",
        },
      },
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark")
            ? "#9ca3af"
            : "#6b7280",
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "#374151"
            : "#e5e7eb",
        },
      },
    },
  };

  // Doughnut chart data (Category Distribution)
  const doughnutChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: document.documentElement.classList.contains("dark")
            ? "#e5e7eb"
            : "#374151",
          padding: 15,
        },
      },
    },
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      "In Use":
        "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
      "Under Maintenance":
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
      Retired: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
      Available:
        "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
      Lost: "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
    );
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value === "Custom Range") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      setCustomDateFrom("");
      setCustomDateTo("");
    }
  };

  // Handle export PDF
  const handleExportPDF = () => {
    try {
      console.log("Starting PDF export...");
      console.log("Report data count:", reportData.length);

      if (reportData.length === 0) {
        showToast(
          "No data to export. Please ensure you have assets in the system.",
          "error"
        );
        return;
      }

      const doc = new jsPDF();
      let yPosition = 22;

      // Company Logo/Header Section
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 35, "F");

      // Company name and title
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("AssetManager", 14, 15);

      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text("Asset Management Report", 14, 26);

      // Reset colors
      doc.setTextColor(0, 0, 0);
      yPosition = 45;

      // Report Information Box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, yPosition, 182, 35, 2, 2, "F");

      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.setFont("helvetica", "bold");
      doc.text("Report Details", 18, yPosition + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80);

      const reportInfo = [
        `Report Type: ${reportType}`,
        `Date Range: ${dateRange}`,
        `Category: ${assetCategory}`,
        `Asset ID Filter: ${assetIdFilter || "None"}`,
        `Generated: ${new Date().toLocaleString()}`,
        `Generated By: David Deil (Administrator)`,
      ];

      reportInfo.forEach((info, index) => {
        doc.text(info, 18, yPosition + 12 + index * 4);
      });

      yPosition += 42;

      // Summary Statistics Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Summary Statistics", 14, yPosition);

      yPosition += 8;

      const totalAssets = reportData.length;
      const inUse = reportData.filter(
        (item) => item.status === "In Use"
      ).length;
      const maintenance = reportData.filter(
        (item) => item.status === "Under Maintenance"
      ).length;
      const retired = reportData.filter(
        (item) => item.status === "Retired"
      ).length;
      const available = reportData.filter(
        (item) => item.status === "Available"
      ).length;
      const lost = reportData.filter((item) => item.status === "Lost").length;

      // Statistics boxes
      const stats = [
        { label: "Total Assets", value: totalAssets, color: [59, 130, 246] },
        { label: "In Use", value: inUse, color: [34, 197, 94] },
        { label: "Available", value: available, color: [59, 130, 246] },
        { label: "Maintenance", value: maintenance, color: [234, 179, 8] },
        { label: "Retired", value: retired, color: [239, 68, 68] },
        { label: "Lost", value: lost, color: [156, 163, 175] },
      ];

      const boxWidth = 30;
      const boxHeight = 20;
      const startX = 14;

      stats.forEach((stat, index) => {
        const x = startX + index * (boxWidth + 2);

        // Draw box
        doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1);
        doc.roundedRect(x, yPosition, boxWidth, boxHeight, 2, 2, "F");

        // Draw border
        doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yPosition, boxWidth, boxHeight, 2, 2, "S");

        // Value
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value.toString(), x + boxWidth / 2, yPosition + 10, {
          align: "center",
        });

        // Label
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text(stat.label, x + boxWidth / 2, yPosition + 16, {
          align: "center",
        });
      });

      yPosition += 30;

      // Assets Table Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Asset Details", 14, yPosition);

      yPosition += 5;

      // Add table with filtered data
      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            "Asset ID",
            "Name",
            "Category",
            "Location",
            "Status",
            "Model",
            "Serial #",
            "Assigned To",
          ],
        ],
        body: reportData.map((item) => [
          item.id || "-",
          item.name || "-",
          item.category || "-",
          item.location || "-",
          item.status || "-",
          item.model || "-",
          item.serial || item.serialNumber || "-",
          item.assignedTo || "-",
        ]),
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          textColor: 50,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 25, fontSize: 6 }, // Asset ID
          1: { cellWidth: 28, fontStyle: "bold" }, // Name
          2: { cellWidth: 22 }, // Category
          3: { cellWidth: 22 }, // Location
          4: { cellWidth: 20, halign: "center" }, // Status
          5: { cellWidth: 18 }, // Model
          6: { cellWidth: 20, fontSize: 6 }, // Serial
          7: { cellWidth: 25 }, // Assigned To
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer on every page
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();

          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
          doc.text(
            "Generated by AssetManager",
            pageSize.width - 60,
            pageHeight - 10
          );
        },
      });

      // Add category breakdown if multiple categories
      if (assetCategory === "All Categories" && reportData.length > 0) {
        const finalY = doc.lastAutoTable.finalY || yPosition + 50;

        if (finalY < 250) {
          // Category distribution
          const categoryBreakdown = {};
          reportData.forEach((item) => {
            const cat = item.category || "Uncategorized";
            categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
          });

          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0);
          doc.text("Category Distribution", 14, finalY + 10);

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          let categoryY = finalY + 18;

          Object.entries(categoryBreakdown)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
              const percentage = ((count / totalAssets) * 100).toFixed(1);
              doc.text(`${category}: ${count} (${percentage}%)`, 18, categoryY);
              categoryY += 5;
            });
        }
      }

      // Save the PDF with descriptive filename
      const timestamp = new Date().toISOString().split("T")[0];
      const categoryPart =
        assetCategory !== "All Categories"
          ? `-${assetCategory.replace(/\s+/g, "-")}`
          : "";
      const assetIdPart = assetIdFilter ? `-${assetIdFilter}` : "";
      const filename = `asset-report${categoryPart}${assetIdPart}-${timestamp}.pdf`;

      console.log("Saving PDF with filename:", filename);
      doc.save(filename);
      console.log("PDF export completed successfully!");
      showToast("PDF exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showToast(`Failed to export PDF: ${error.message}`, "error");
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    console.log("Exporting to CSV...");
    // Create CSV content with filtered data
    const headers = [
      "Asset ID",
      "Asset Name",
      "Category",
      "Location",
      "Status",
      "Model",
      "Serial Number",
      "Assigned To",
      "Department",
      "Acquisition Date",
      "Maintenance Period",
    ];

    const csvContent = [
      headers.join(","),
      ...reportData.map((item) => {
        // Format date field with fallbacks
        const acquisitionDate =
          item.acquisitionDate ||
          item.purchaseDate ||
          (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "");

        // Escape and handle undefined values - return empty string instead of "-"
        const escapeCSV = (value) => {
          if (value === null || value === undefined || value === "") {
            return '""';
          }
          const strValue = String(value);
          // Escape double quotes and wrap in quotes if contains comma
          if (
            strValue.includes(",") ||
            strValue.includes('"') ||
            strValue.includes("\n")
          ) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return `"${strValue}"`;
        };

        return [
          escapeCSV(item.id),
          escapeCSV(item.name),
          escapeCSV(item.category),
          escapeCSV(item.location),
          escapeCSV(item.status),
          escapeCSV(item.model),
          escapeCSV(item.serial || item.serialNumber),
          escapeCSV(item.assignedTo),
          escapeCSV(item.department),
          escapeCSV(acquisitionDate),
          escapeCSV(item.maintenancePeriod || item.maintenanceSchedule),
        ].join(",");
      }),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `asset-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully!", "success");
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-8">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.03em]">
          Reports &amp; Analytics
        </h1>
        <div className="flex flex-wrap gap-3 justify-start items-center">
          {/* Asset ID Search Input */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 hover:border-blue-500 dark:hover:border-blue-500 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Asset ID..."
              value={assetIdFilter}
              onChange={(e) => setAssetIdFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium min-w-[200px]"
            />
            {assetIdFilter && (
              <button
                onClick={() => setAssetIdFilter("")}
                className="flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base">
                  close
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-gray-700 p-8 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
              tune
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Filter Options
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your report data in real-time
            </p>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            showDatePicker ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } gap-6`}
        >
          <div>
            <label
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="reportType"
            >
              <span className="material-symbols-outlined text-base">
                description
              </span>
              Report Type
            </label>
            <select
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Asset Status</option>
              <option>Utilization</option>
              <option>Maintenance History</option>
              <option>Full Inventory</option>
            </select>
          </div>

          <div>
            <label
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="dateRange"
            >
              <span className="material-symbols-outlined text-base">
                calendar_month
              </span>
              Date Range
            </label>
            <select
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
              id="dateRange"
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
              <option>All Time</option>
              <option>Custom Range</option>
            </select>
          </div>

          <div>
            <label
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="assetCategory"
            >
              <span className="material-symbols-outlined text-base">
                category
              </span>
              Asset Category
            </label>
            <select
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
              id="assetCategory"
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
            >
              <option>All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range Picker */}
          {showDatePicker && (
            <>
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="dateFrom"
                >
                  <span className="material-symbols-outlined text-base">
                    event
                  </span>
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                />
              </div>
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor="dateTo"
                >
                  <span className="material-symbols-outlined text-base">
                    event
                  </span>
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Active Filters Indicator */}
        {(assetCategory !== "All Categories" ||
          dateRange !== "All Time" ||
          assetIdFilter.trim() !== "") && (
          <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
              filter_alt
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Active Filters:
                {assetIdFilter.trim() !== "" && ` Asset ID: "${assetIdFilter}"`}
                {assetCategory !== "All Categories" &&
                  assetIdFilter.trim() === "" &&
                  ` ${assetCategory}`}
                {assetCategory !== "All Categories" &&
                  assetIdFilter.trim() !== "" &&
                  ` • ${assetCategory}`}
                {dateRange !== "All Time" && ` • ${dateRange}`}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Showing {reportData.length} of {items.length} assets
              </p>
            </div>
            <button
              onClick={() => {
                setAssetCategory("All Categories");
                setDateRange("All Time");
                setShowDatePicker(false);
                setCustomDateFrom("");
                setCustomDateTo("");
                setAssetIdFilter("");
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Status Over Time Chart */}
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-normal">
              Asset Status Over Time
            </h2>
            <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span
                className="material-symbols-outlined text-gray-600 dark:text-gray-400"
                style={{ fontSize: "20px" }}
              >
                more_horiz
              </span>
            </button>
          </div>
          <div className="relative h-72">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Assets by Category Chart */}
        <div className="lg:col-span-1 flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start">
            <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-normal">
              Assets by Category
            </h2>
            <button className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span
                className="material-symbols-outlined text-gray-600 dark:text-gray-400"
                style={{ fontSize: "20px" }}
              >
                more_horiz
              </span>
            </button>
          </div>
          <div className="relative h-72">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Report Details Table */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-normal">
            Generated Report Details
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-red-600 text-sm font-bold leading-normal tracking-[0.015em] gap-2.5 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 group"
              title="Export professional PDF report with enhanced formatting"
            >
              <span
                className="material-symbols-outlined group-hover:animate-pulse"
                style={{ fontSize: "22px" }}
              >
                picture_as_pdf
              </span>
              <span className="truncate">Export PDF</span>
              {/* <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                NEW
              </span> */}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 text-sm font-bold leading-normal tracking-[0.015em] gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md hover:scale-105 active:scale-100 transition-all duration-200"
              title="Export data as CSV file"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "22px" }}
              >
                download
              </span>
              <span className="truncate">Export CSV</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3 pr-4 font-medium">Asset ID</th>
                <th className="py-3 px-4 font-medium">Asset Name</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Last Update</th>
                <th className="py-3 pl-4 font-medium">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    index < reportData.length - 1
                      ? "border-b border-gray-200 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <td className="py-4 pr-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                    {item.id || ""}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    {item.name || ""}
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                    {item.category || ""}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                        item.status
                      )}`}
                    >
                      {item.status || ""}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                    {item.lastUpdate ||
                      (item.acquisitionDate
                        ? new Date(item.acquisitionDate).toLocaleDateString()
                        : item.purchaseDate
                        ? new Date(item.purchaseDate).toLocaleDateString()
                        : item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "")}
                  </td>
                  <td className="py-4 pl-4 text-gray-700 dark:text-gray-300">
                    {item.assignedTo || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Assets
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {reportData.length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            ↑ 12% from last month
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            In Use
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {reportData.filter((item) => item.status === "In Use").length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            ↑ 5% from last month
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Under Maintenance
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {
              reportData.filter((item) => item.status === "Under Maintenance")
                .length
            }
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            → No change
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Retired
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {reportData.filter((item) => item.status === "Retired").length}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            ↑ 2 this month
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border-2 animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200"
              : toast.type === "error"
              ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toast.type === "success"
              ? "check_circle"
              : toast.type === "error"
              ? "error"
              : "info"}
          </span>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="ml-2 hover:opacity-70"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;
