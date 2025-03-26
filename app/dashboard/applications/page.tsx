"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  PaintBucket,
  GripHorizontal,
  Move,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "../../components/Toast";

// Available colors for status columns
const STATUS_COLORS = [
  { id: "bg-blue-500", label: "Blue" },
  { id: "bg-purple-500", label: "Purple" },
  { id: "bg-indigo-500", label: "Indigo" },
  { id: "bg-cyan-500", label: "Cyan" },
  { id: "bg-emerald-500", label: "Emerald" },
  { id: "bg-green-500", label: "Green" },
  { id: "bg-yellow-500", label: "Yellow" },
  { id: "bg-orange-500", label: "Orange" },
  { id: "bg-red-500", label: "Red" },
  { id: "bg-pink-500", label: "Pink" },
];

// Type definitions
type ApplicationStatus = {
  _id: Id<"applicationStatuses">;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  userId: string;
};

type Application = {
  _id: Id<"applications">;
  companyName: string;
  position: string;
  statusId: Id<"applicationStatuses">;
  dateApplied: string;
  notes?: string;
  userId: string;
  location?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
  url?: string;
};

type ToastMessage = {
  type: "success" | "error" | "info";
  message: string;
};

export default function ApplicationsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statuses, setStatuses] = useState<ApplicationStatus[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("bg-blue-500");
  const [editingStatusId, setEditingStatusId] =
    useState<Id<"applicationStatuses"> | null>(null);
  const [editingStatusName, setEditingStatusName] = useState("");
  const [editingStatusColor, setEditingStatusColor] = useState("");
  const [isReorderingColumns, setIsReorderingColumns] = useState(false);
  const [draggedStatusId, setDraggedStatusId] =
    useState<Id<"applicationStatuses"> | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [editedApplication, setEditedApplication] =
    useState<Application | null>(null);

  // Refs for click outside detection
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const newStatusFormRef = useRef<HTMLDivElement>(null);
  const applicationModalRef = useRef<HTMLDivElement>(null);

  // Get status data from Convex
  const statusesData = useQuery(api.applicationStatuses.listByUser, {
    userId: user?.id || "",
  });

  // Get application data from Convex
  const applicationsData = useQuery(api.applications.listByUser, {
    userId: user?.id || "",
  });

  // Convex mutations
  const initializeDefaultStatuses = useMutation(
    api.applicationStatuses.initializeDefaultStatuses
  );
  const createStatus = useMutation(api.applicationStatuses.create);
  const updateStatus = useMutation(api.applicationStatuses.update);
  const removeStatus = useMutation(api.applicationStatuses.remove);
  const reorderStatus = useMutation(api.applicationStatuses.reorder);
  const updateApplicationStatus = useMutation(api.applications.updateStatus);
  const updateApplication = useMutation(api.applications.update);

  // Initialize default statuses for new users
  useEffect(() => {
    if (user && statusesData !== undefined && statusesData.length === 0) {
      initializeDefaultStatuses({ userId: user.id });
    }
  }, [user, statusesData, initializeDefaultStatuses]);

  // Update state when Convex data changes
  useEffect(() => {
    if (statusesData) {
      setStatuses(statusesData);
    }
  }, [statusesData]);

  useEffect(() => {
    if (applicationsData) {
      setApplications(applicationsData);
    }
  }, [applicationsData]);

  // Horizontal scrolling functionality
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("board-container");
    if (container) {
      const scrollAmount = 300;
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Function to handle drag-and-drop for applications
  const handleDragStart = (
    e: React.DragEvent,
    applicationId: Id<"applications">
  ) => {
    e.dataTransfer.setData("applicationId", applicationId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetStatusId: Id<"applicationStatuses">
  ) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData(
      "applicationId"
    ) as Id<"applications">;

    if (!applicationId) return;

    try {
      // Optimistically update UI
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, statusId: targetStatusId } : app
        )
      );

      // Call Convex to update the status
      await updateApplicationStatus({
        id: applicationId,
        statusId: targetStatusId,
      });

      showToast("success", "Application status updated");
    } catch (error) {
      console.error("Error updating application status:", error);
      showToast("error", "Failed to update application status");
    }
  };

  // Functions to handle column status drag and drop
  const handleStatusDragStart = (
    e: React.DragEvent,
    statusId: Id<"applicationStatuses">
  ) => {
    if (!isReorderingColumns) return;

    setDraggedStatusId(statusId);
    e.dataTransfer.setData("statusId", statusId);

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-50");
    }
  };

  const handleStatusDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("opacity-50");
    }
    setDraggedStatusId(null);
  };

  const handleStatusDragOver = (e: React.DragEvent) => {
    if (!isReorderingColumns) return;
    e.preventDefault();
  };

  const handleStatusDrop = async (
    e: React.DragEvent,
    targetStatusId: Id<"applicationStatuses">
  ) => {
    if (!isReorderingColumns) return;
    e.preventDefault();

    const sourceStatusId = draggedStatusId;
    if (!sourceStatusId || sourceStatusId === targetStatusId) return;

    const sourceStatus = statuses.find((s) => s._id === sourceStatusId);
    const targetStatus = statuses.find((s) => s._id === targetStatusId);

    if (!sourceStatus || !targetStatus) return;

    try {
      // Optimistically update UI
      const newOrder = targetStatus.order;

      // Create a new array with the reordered statuses
      const updatedStatuses = [...statuses];

      // Adjust orders based on direction of movement
      if (sourceStatus.order < newOrder) {
        // Moving right
        updatedStatuses.forEach((s) => {
          if (s._id === sourceStatusId) {
            s.order = newOrder;
          } else if (s.order > sourceStatus.order && s.order <= newOrder) {
            s.order--;
          }
        });
      } else {
        // Moving left
        updatedStatuses.forEach((s) => {
          if (s._id === sourceStatusId) {
            s.order = newOrder;
          } else if (s.order >= newOrder && s.order < sourceStatus.order) {
            s.order++;
          }
        });
      }

      // Sort by new order
      updatedStatuses.sort((a, b) => a.order - b.order);
      setStatuses(updatedStatuses);

      // Call Convex to update the order
      await reorderStatus({
        userId: user!.id,
        statusId: sourceStatusId,
        newOrder: newOrder,
      });

      showToast("success", "Column order updated");
    } catch (error) {
      console.error("Error reordering columns:", error);
      showToast("error", "Failed to reorder columns");
    }
  };

  // Form handlers
  const handleAddStatus = async () => {
    if (!user || !newStatusName.trim()) return;

    try {
      await createStatus({
        userId: user.id,
        name: newStatusName.trim(),
        color: newStatusColor,
      });

      setNewStatusName("");
      setIsAddingStatus(false);
      showToast("success", "Status column added");
    } catch (error) {
      console.error("Error creating status:", error);
      showToast("error", "Failed to create status column");
    }
  };

  const handleUpdateStatus = async (statusId: Id<"applicationStatuses">) => {
    if (!editingStatusName.trim()) return;

    try {
      await updateStatus({
        id: statusId,
        name: editingStatusName.trim(),
        color: editingStatusColor,
      });

      setEditingStatusId(null);
      showToast("success", "Status column updated");
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("error", "Failed to update status column");
    }
  };

  const handleDeleteStatus = async (statusId: Id<"applicationStatuses">) => {
    // Find a fallback status that isn't this one
    const fallbackStatus = statuses.find((s) => s._id !== statusId);

    if (!fallbackStatus) {
      showToast("error", "Cannot delete the only status column");
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this status? All applications will be moved to another status."
      )
    ) {
      try {
        await removeStatus({
          id: statusId,
          fallbackStatusId: fallbackStatus._id,
        });

        showToast("success", "Status column deleted");
      } catch (error) {
        console.error("Error deleting status:", error);
        showToast("error", "Failed to delete status column");
      }
    }
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close color picker when clicking outside
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        // Don't close if clicking on a color button that triggered it
        if (
          !(event.target as HTMLElement).classList.contains(
            "color-picker-trigger"
          )
        ) {
          colorPickerRef.current.classList.add("hidden");
        }
      }

      // Close new status form when clicking outside
      if (
        newStatusFormRef.current &&
        !newStatusFormRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).classList.contains("add-status-trigger")
      ) {
        setIsAddingStatus(false);
      }

      // Close status menu when clicking outside
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).classList.contains("status-menu-trigger")
      ) {
        setEditingStatusId(null);
      }

      // Handle click outside application modal
      if (
        applicationModalRef.current &&
        !applicationModalRef.current.contains(event.target as Node) &&
        selectedApplication
      ) {
        // Only close if clicking on the overlay (not inside the modal)
        const target = event.target as HTMLElement;
        if (target.classList.contains("modal-overlay")) {
          closeApplicationModal();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedApplication]);

  // Show color picker
  const showColorPicker = (
    e: React.MouseEvent,
    statusId: Id<"applicationStatuses">
  ) => {
    e.stopPropagation();
    const colorPicker = colorPickerRef.current;

    if (colorPicker) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();

      colorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
      colorPicker.style.left = `${rect.left + window.scrollX}px`;

      colorPicker.classList.remove("hidden");

      // Set the status ID on the color picker
      colorPicker.dataset.statusId = statusId;
    }
  };

  // Select color from picker
  const selectColor = (color: string) => {
    const statusId = colorPickerRef.current?.dataset.statusId as
      | Id<"applicationStatuses">
      | undefined;

    if (statusId && statusId === editingStatusId) {
      setEditingStatusColor(color);
    } else if (!statusId) {
      setNewStatusColor(color);
    } else {
      // Direct color update without editing mode
      updateStatus({ id: statusId, color });
    }

    if (colorPickerRef.current) {
      colorPickerRef.current.classList.add("hidden");
    }
  };

  // Start editing a status
  const startEditingStatus = (status: ApplicationStatus) => {
    setEditingStatusId(status._id);
    setEditingStatusName(status.name);
    setEditingStatusColor(status.color);
  };

  // Filter applications based on search query
  const filteredApplications = applications.filter(
    (app) =>
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle reordering mode
  const toggleReorderingMode = () => {
    setIsReorderingColumns((prev) => !prev);
  };

  // Function to handle opening the application modal
  const openApplicationModal = (application: Application) => {
    setSelectedApplication(application);
    setEditedApplication({ ...application });
    setIsEditingApplication(false);
  };

  // Function to close the application modal
  const closeApplicationModal = () => {
    setSelectedApplication(null);
    setEditedApplication(null);
    setIsEditingApplication(false);
  };

  // Function to toggle edit mode for application
  const toggleEditApplication = () => {
    setIsEditingApplication(!isEditingApplication);
  };

  // Function to handle input changes in the edit form
  const handleApplicationInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editedApplication) return;

    setEditedApplication({
      ...editedApplication,
      [e.target.name]: e.target.value,
    });
  };

  // Function to save edited application
  const saveApplication = async () => {
    if (!editedApplication) return;

    try {
      // Optimistically update UI
      setApplications((apps) =>
        apps.map((app) =>
          app._id === editedApplication._id ? editedApplication : app
        )
      );

      // Update in database
      await updateApplication({
        id: editedApplication._id,
        companyName: editedApplication.companyName,
        position: editedApplication.position,
        dateApplied: editedApplication.dateApplied,
        notes: editedApplication.notes,
        location: editedApplication.location,
        salary: editedApplication.salary,
        contactName: editedApplication.contactName,
        contactEmail: editedApplication.contactEmail,
        url: editedApplication.url,
      });

      // Update selected application view
      setSelectedApplication(editedApplication);
      setIsEditingApplication(false);
      showToast("success", "Application updated successfully");
    } catch (error) {
      console.error("Error updating application:", error);
      showToast("error", "Failed to update application");
    }
  };

  // Loading state
  if (!user || statusesData === undefined || applicationsData === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative">
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          width: "200%",
          height: "200%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Blurry background elements */}
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-600/20 to-blue-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-purple-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Color picker (floating) */}
      <div
        ref={colorPickerRef}
        className="absolute hidden z-50 bg-[#0c1029] border border-[#20253d] rounded-md p-2 shadow-lg"
      >
        <div className="grid grid-cols-5 gap-2">
          {STATUS_COLORS.map((color) => (
            <button
              key={color.id}
              className={`w-6 h-6 rounded-full ${color.id} hover:opacity-80 transition-opacity`}
              title={color.label}
              onClick={() => selectColor(color.id)}
            ></button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 relative z-10">
                Job Applications
              </h2>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-indigo-500/40"></div>
            </div>

            {/* Search input */}
            <div className="ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-[#20253d]/50 rounded-md leading-5 bg-[#121a36]/50 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2 text-blue-400" />
              Dashboard
            </Link>

            <button
              onClick={toggleReorderingMode}
              className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm ${
                isReorderingColumns
                  ? "border-blue-500 bg-blue-500/30 text-white"
                  : "border-[#20253d]/50 text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70"
              }`}
            >
              <Move className="h-4 w-4 mr-2 text-blue-400" />
              {isReorderingColumns ? "Done Reordering" : "Reorder Columns"}
            </button>

            <button
              onClick={() => setIsAddingStatus(true)}
              className="add-status-trigger inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2 text-blue-400" />
              Add Status
            </button>

            <Link
              href="/dashboard/applications/new"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2 text-blue-400" />
              New Application
            </Link>
          </div>
        </div>

        {/* Form for adding new status */}
        {isAddingStatus && (
          <div
            ref={newStatusFormRef}
            className="mb-6 p-4 bg-[#121a36]/70 rounded-lg border border-[#20253d]/50 backdrop-blur-sm"
          >
            <h3 className="text-lg font-medium text-white mb-3">
              Add New Status Column
            </h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="Status name..."
                className="flex-1 px-3 py-2 rounded-md bg-[#0c1029]/80 border border-[#20253d]/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />

              <button
                onClick={(e) =>
                  showColorPicker(e, "" as Id<"applicationStatuses">)
                }
                className="color-picker-trigger px-3 py-2 rounded-md border border-[#20253d]/50 focus:outline-none"
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full ${newStatusColor} mr-2`}
                  ></div>
                  <PaintBucket className="h-4 w-4 text-gray-400" />
                </div>
              </button>

              <button
                onClick={handleAddStatus}
                disabled={!newStatusName.trim()}
                className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>

              <button
                onClick={() => setIsAddingStatus(false)}
                className="px-2 py-2 rounded-md hover:bg-[#0c1029]/50 focus:outline-none"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Reordering mode indicator */}
        {isReorderingColumns && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/40 text-blue-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>
                Drag and drop columns to reorder them. Click "Done Reordering"
                when finished.
              </p>
            </div>
          </div>
        )}

        {/* Board controls - horizontal scroll buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="p-2 rounded-full bg-[#121a36]/70 border border-[#20253d]/50 text-gray-300 hover:bg-[#121a36] focus:outline-none"
            onClick={() => scrollContainer("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-full bg-[#121a36]/70 border border-[#20253d]/50 text-gray-300 hover:bg-[#121a36] focus:outline-none"
            onClick={() => scrollContainer("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Trello-like Board */}
        <div
          id="board-container"
          className="flex overflow-x-auto pb-6 space-x-4 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Status Columns */}
          {statuses
            .sort((a, b) => a.order - b.order)
            .map((status) => (
              <div
                key={status._id}
                className={`flex-shrink-0 w-80 bg-[#121a36]/50 backdrop-blur-sm rounded-lg border overflow-hidden ${
                  isReorderingColumns
                    ? "border-dashed border-[#20253d] cursor-move"
                    : "border-[#20253d]/50"
                }`}
                draggable={isReorderingColumns}
                onDragStart={(e) => handleStatusDragStart(e, status._id)}
                onDragEnd={handleStatusDragEnd}
                onDragOver={handleStatusDragOver}
                onDrop={(e) => handleStatusDrop(e, status._id)}
                onDragEnter={(e) => {
                  if (isReorderingColumns) {
                    e.currentTarget.classList.add("border-blue-500");
                  }
                }}
                onDragLeave={(e) => {
                  if (isReorderingColumns) {
                    e.currentTarget.classList.remove("border-blue-500");
                  }
                }}
              >
                {/* Column Header */}
                <div
                  className={`px-4 py-3 ${status.color}/20 border-b border-[#20253d]/50 flex items-center justify-between relative`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status._id)}
                >
                  {editingStatusId === status._id ? (
                    <div className="flex items-center space-x-2 w-full pr-8">
                      <input
                        type="text"
                        value={editingStatusName}
                        onChange={(e) => setEditingStatusName(e.target.value)}
                        className="bg-[#0c1029]/50 border border-[#20253d]/70 px-2 py-1 rounded text-white text-sm flex-1"
                        autoFocus
                      />
                      <button
                        onClick={(e) => showColorPicker(e, status._id)}
                        className="color-picker-trigger p-1 rounded"
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${editingStatusColor}`}
                        ></div>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(status._id)}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingStatusId(null)}
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        {isReorderingColumns && (
                          <GripHorizontal className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <div
                          className={`h-3 w-3 rounded-full ${status.color} mr-2`}
                        ></div>
                        <h3 className="font-medium text-gray-200">
                          {status.name}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-400 bg-[#0c1029]/50 px-2 py-0.5 rounded-full mr-2">
                          {
                            filteredApplications.filter(
                              (app) => app.statusId === status._id
                            ).length
                          }
                        </span>
                        {!isReorderingColumns && (
                          <button
                            onClick={() => startEditingStatus(status)}
                            className="status-menu-trigger p-1 text-gray-400 hover:text-gray-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Status menu */}
                  {editingStatusId === status._id && (
                    <div
                      ref={statusMenuRef}
                      className="absolute top-full right-0 mt-1 w-36 bg-[#0c1029] rounded-md shadow-lg border border-[#20253d]/70 z-20"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => startEditingStatus(status)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#121a36] hover:text-white"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        {!status.isDefault && (
                          <button
                            onClick={() => handleDeleteStatus(status._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-[#121a36] hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div
                  className="p-2 h-[calc(100vh-15rem)] overflow-y-auto"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status._id)}
                >
                  {filteredApplications
                    .filter((app) => app.statusId === status._id)
                    .map((application) => (
                      <div
                        key={application._id}
                        draggable={!isReorderingColumns}
                        onDragStart={(e) => handleDragStart(e, application._id)}
                        onClick={() => openApplicationModal(application)}
                        className="mb-2 p-3 bg-[#0c1029]/80 rounded-md border border-[#20253d]/50 cursor-pointer hover:shadow-md hover:border-[#20253d] transition-all duration-200"
                      >
                        <h4 className="text-sm font-medium text-gray-200">
                          {application.position}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {application.companyName}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Applied: {application.dateApplied}
                          </span>
                        </div>
                        {application.notes && (
                          <p className="mt-2 text-xs text-gray-400 border-t border-[#20253d]/30 pt-2">
                            {application.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {/* Application Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center modal-overlay">
            <div
              ref={applicationModalRef}
              className="bg-[#121a36] border border-[#20253d] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="border-b border-[#20253d] px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  {isEditingApplication
                    ? "Edit Application"
                    : "Application Details"}
                </h3>
                <button
                  onClick={closeApplicationModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
                {isEditingApplication ? (
                  /* Edit Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Company
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={editedApplication?.companyName || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={editedApplication?.position || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Date Applied
                        </label>
                        <input
                          type="date"
                          name="dateApplied"
                          value={editedApplication?.dateApplied || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Status
                        </label>
                        <select
                          name="statusId"
                          value={editedApplication?.statusId || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        >
                          {statuses.map((status) => (
                            <option key={status._id} value={status._id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editedApplication?.location || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Salary
                        </label>
                        <input
                          type="text"
                          name="salary"
                          value={editedApplication?.salary || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          value={editedApplication?.contactName || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={editedApplication?.contactEmail || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Job URL
                      </label>
                      <input
                        type="url"
                        name="url"
                        value={editedApplication?.url || ""}
                        onChange={handleApplicationInputChange}
                        className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={editedApplication?.notes || ""}
                        onChange={handleApplicationInputChange}
                        rows={4}
                        className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  /* View Details */
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h4 className="text-xl font-medium text-white">
                          {selectedApplication.position}
                        </h4>
                        <p className="text-lg text-orange-400">
                          {selectedApplication.companyName}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <div
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-opacity-20"
                          style={{
                            backgroundColor: `rgba${statuses
                              .find(
                                (s) => s._id === selectedApplication.statusId
                              )
                              ?.color.replace("bg-", "")
                              .replace("-500", "")}`,
                            color: statuses
                              .find(
                                (s) => s._id === selectedApplication.statusId
                              )
                              ?.color.replace("bg-", "text-"),
                          }}
                        >
                          {
                            statuses.find(
                              (s) => s._id === selectedApplication.statusId
                            )?.name
                          }
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#20253d] pt-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-400">
                          Date Applied
                        </h5>
                        <p className="text-white">
                          {selectedApplication.dateApplied}
                        </p>
                      </div>

                      {selectedApplication.location && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">
                            Location
                          </h5>
                          <p className="text-white">
                            {selectedApplication.location}
                          </p>
                        </div>
                      )}

                      {selectedApplication.salary && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">
                            Salary
                          </h5>
                          <p className="text-white">
                            {selectedApplication.salary}
                          </p>
                        </div>
                      )}

                      {selectedApplication.contactName && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">
                            Contact
                          </h5>
                          <p className="text-white">
                            {selectedApplication.contactName}
                          </p>
                        </div>
                      )}

                      {selectedApplication.contactEmail && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">
                            Contact Email
                          </h5>
                          <p className="text-white">
                            {selectedApplication.contactEmail}
                          </p>
                        </div>
                      )}

                      {selectedApplication.url && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">
                            Job URL
                          </h5>
                          <a
                            href={selectedApplication.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline truncate block"
                          >
                            {selectedApplication.url}
                          </a>
                        </div>
                      )}
                    </div>

                    {selectedApplication.notes && (
                      <div className="border-t border-[#20253d] pt-4">
                        <h5 className="text-sm font-medium text-gray-400 mb-2">
                          Notes
                        </h5>
                        <p className="text-white whitespace-pre-wrap">
                          {selectedApplication.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-[#20253d] px-6 py-4 flex justify-end gap-3">
                {isEditingApplication ? (
                  <>
                    <button
                      onClick={() => setIsEditingApplication(false)}
                      className="px-4 py-2 border border-[#20253d] text-gray-300 rounded hover:bg-[#0c1029]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveApplication}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={closeApplicationModal}
                      className="px-4 py-2 border border-[#20253d] text-gray-300 rounded hover:bg-[#0c1029]"
                    >
                      Close
                    </button>
                    <button
                      onClick={toggleEditApplication}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Edit Application
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add custom CSS for hiding scrollbars */}
        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </main>
    </div>
  );
}
