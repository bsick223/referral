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
  ArrowLeft,
  Menu,
  Columns,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "../../components/Toast";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  orderIndex?: number;
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
  const [dropZone, setDropZone] = useState<{
    statusId: Id<"applicationStatuses">;
    position: "before" | "after";
  } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [editedApplication, setEditedApplication] =
    useState<Application | null>(null);

  // New mobile-specific state
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [showingAllColumns, setShowingAllColumns] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Refs for click outside detection
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const newStatusFormRef = useRef<HTMLDivElement>(null);
  const applicationModalRef = useRef<HTMLDivElement>(null);

  // Add these to the state variables
  const [isDraggingApplication, setIsDraggingApplication] = useState(false);
  const [draggedApplicationId, setDraggedApplicationId] =
    useState<Id<"applications"> | null>(null);
  const [dropTargetId, setDropTargetId] = useState<Id<"applications"> | null>(
    null
  );
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

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
  const removeApplication = useMutation(api.applications.remove);
  const updateApplicationOrder = useMutation(api.applications.updateOrder);

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

  // Reset active column index when statuses change
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      setActiveColumnIndex((prev) => (prev >= statuses.length ? 0 : prev));
    }
  }, [statuses]);

  // Swipe handlers for mobile column navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile || showingAllColumns) return;
      setActiveColumnIndex((prev) => Math.min(prev + 1, statuses.length - 1));
    },
    onSwipedRight: () => {
      if (!isMobile || showingAllColumns) return;
      setActiveColumnIndex((prev) => Math.max(prev - 1, 0));
    },
    trackMouse: false,
  });

  // Function to navigate to a specific column by index
  const navigateToColumn = (index: number) => {
    if (index >= 0 && index < statuses.length) {
      setActiveColumnIndex(index);
    }
  };

  // Toggle between single column and all columns view on mobile
  const toggleColumnsView = () => {
    setShowingAllColumns(!showingAllColumns);
  };

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

  // Enhanced drag handlers for applications
  const handleDragStart = (
    e: React.DragEvent,
    applicationId: Id<"applications">
  ) => {
    if (isReorderingColumns) return; // Don't allow application dragging while reordering columns

    const application = applications.find((app) => app._id === applicationId);
    if (!application) return;

    e.dataTransfer.setData("applicationId", applicationId.toString());
    e.dataTransfer.setData("sourceStatusId", application.statusId.toString());

    // Set drag image to the element itself for better visual feedback
    if (e.target instanceof HTMLElement) {
      const rect = e.target.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        e.target,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }

    setIsDraggingApplication(true);
    setDraggedApplicationId(applicationId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDraggingApplication(false);
    setDraggedApplicationId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // Skip if we're reordering columns or if nothing is being dragged
    if (isReorderingColumns || !isDraggingApplication) return;

    // Remove any existing drop-target classes
    document.querySelectorAll(".drop-target").forEach((el) => {
      el.classList.remove("drop-target");
    });

    // If dragging over a column header or body, add drop-target class
    const target = e.currentTarget;
    if (
      target.classList.contains("column-header") ||
      target.classList.contains("column-body")
    ) {
      target.classList.add("drop-target");
    }

    // Clear previous drop target for application cards
    setDropTargetId(null);
    setDropPosition(null);

    // Find the application card element
    const appCard =
      e.target instanceof Element
        ? e.target.closest(".application-card")
        : null;
    if (!appCard) return;

    const appId = appCard.getAttribute(
      "data-app-id"
    ) as Id<"applications"> | null;
    if (!appId || appId === draggedApplicationId) return;

    const rect = appCard.getBoundingClientRect();
    const mouseY = e.clientY;
    const cardCenterY = rect.top + rect.height / 2;

    // Determine if we're dropping before or after the target
    const position = mouseY < cardCenterY ? "before" : "after";

    setDropTargetId(appId);
    setDropPosition(position);
  };

  const handleApplicationDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    // Get the dragged application ID from dataTransfer
    const applicationId = e.dataTransfer.getData(
      "applicationId"
    ) as Id<"applications">;
    const sourceStatusId = e.dataTransfer.getData(
      "sourceStatusId"
    ) as Id<"applicationStatuses">;

    if (!applicationId) {
      setIsDraggingApplication(false);
      setDraggedApplicationId(null);
      return;
    }

    try {
      // Remove any drop target highlights
      document.querySelectorAll(".drop-target").forEach((el) => {
        el.classList.remove("drop-target");
      });

      // First, determine if we're dropping on a column or an application
      const targetElement = e.currentTarget;
      const isColumnHeader = targetElement.classList.contains("column-header");
      const isColumnBody = targetElement.classList.contains("column-body");
      const isApplicationCard =
        targetElement.classList.contains("application-card");

      // If dropping on a column header or body, move to that status
      if (isColumnHeader || isColumnBody) {
        // Find the status ID of the column we're dropping on
        const statusColumn = targetElement.closest(".status-column");
        if (!statusColumn) return;

        const targetStatusId = statusColumn.getAttribute(
          "data-status-id"
        ) as Id<"applicationStatuses">;
        if (!targetStatusId || targetStatusId === sourceStatusId) return;

        // Optimistically update the UI
        setApplications((prevApps) =>
          prevApps.map((app) =>
            app._id === applicationId
              ? { ...app, statusId: targetStatusId }
              : app
          )
        );

        // Update the application status
        await updateApplicationStatus({
          id: applicationId,
          statusId: targetStatusId,
        });

        showToast("success", "Application moved to new status");
      }
      // If dropping on another application, check if reordering or changing status
      else if (isApplicationCard || dropTargetId) {
        // Get target app from the element or from dropTargetId
        const targetAppId = isApplicationCard
          ? (targetElement.getAttribute("data-app-id") as Id<"applications">)
          : dropTargetId;

        if (!targetAppId) return;

        const targetApp = applications.find((app) => app._id === targetAppId);
        if (!targetApp) return;

        // If dragging to a different status, update the status
        if (sourceStatusId !== targetApp.statusId) {
          // Optimistically update the UI
          setApplications((prevApps) =>
            prevApps.map((app) =>
              app._id === applicationId
                ? { ...app, statusId: targetApp.statusId }
                : app
            )
          );

          await updateApplicationStatus({
            id: applicationId,
            statusId: targetApp.statusId,
          });

          showToast("success", "Application moved to new status");
        }
        // Otherwise reorder within the same status
        else if (dropTargetId && dropPosition) {
          // Get all applications in this status
          const appsInStatus = applications.filter(
            (app) => app.statusId === targetApp.statusId
          );

          // Find current positions
          const draggedIndex = appsInStatus.findIndex(
            (app) => app._id === applicationId
          );
          const targetIndex = appsInStatus.findIndex(
            (app) => app._id === dropTargetId
          );

          if (draggedIndex === -1 || targetIndex === -1) return;

          // Calculate the new position
          let newIndex = targetIndex;
          if (dropPosition === "after") {
            newIndex++;
          }

          // Adjust if moving down
          if (draggedIndex < newIndex) {
            newIndex--;
          }

          // Rearrange the array
          const newApps = [...appsInStatus];
          const [removed] = newApps.splice(draggedIndex, 1);
          newApps.splice(newIndex, 0, removed);

          // Extract IDs and create order indices
          const applicationIds = newApps.map((app) => app._id);
          const orderIndices = newApps.map((_, index) => index);

          // Optimistically update UI
          setApplications((prevApps) => {
            // Create map of app ID to new order index
            const orderMap = applicationIds.reduce((map, id, index) => {
              map[id] = index;
              return map;
            }, {} as Record<string, number>);

            // Update all apps with new order indices
            return prevApps.map((app) => {
              if (orderMap[app._id] !== undefined) {
                return { ...app, orderIndex: orderMap[app._id] };
              }
              return app;
            });
          });

          // Call API to update orders
          await updateApplicationOrder({
            applicationIds,
            orderIndices,
          });

          showToast("success", "Application order updated");
        }
      }
    } catch (error) {
      console.error("Error updating application:", error);
      showToast("error", "Failed to update application");
    } finally {
      // Reset drag state
      setIsDraggingApplication(false);
      setDraggedApplicationId(null);
      setDropTargetId(null);
      setDropPosition(null);
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
    setDropZone(null);
  };

  const handleStatusDragOver = (e: React.DragEvent) => {
    if (!isReorderingColumns) return;
    e.preventDefault();

    // Only proceed if we're dragging over a status column
    if (!(e.currentTarget instanceof HTMLElement)) return;

    const columnElement = e.currentTarget.closest(".status-column");
    if (!columnElement) return;

    const statusId = columnElement.getAttribute(
      "data-status-id"
    ) as Id<"applicationStatuses">;
    if (!statusId || statusId === draggedStatusId) {
      setDropZone(null);
      return;
    }

    // Determine if we're on the left or right half of the column
    const columnRect = columnElement.getBoundingClientRect();
    const cursorX = e.clientX;
    const columnCenterX = columnRect.left + columnRect.width / 2;

    // Set the drop position based on cursor position
    const position = cursorX < columnCenterX ? "before" : "after";
    setDropZone({ statusId, position });
  };

  const clearAllDropZoneStyles = () => {
    // Remove all drop zone indicators
    document
      .querySelectorAll(".drop-zone-left, .drop-zone-right")
      .forEach((el) => {
        el.classList.remove("drop-zone-left", "drop-zone-right");
      });
  };

  const handleStatusDrop = async (e: React.DragEvent) => {
    if (!isReorderingColumns) return;
    e.preventDefault();

    const sourceStatusId = draggedStatusId;
    if (!sourceStatusId || !dropZone) {
      clearAllDropZoneStyles();
      setDropZone(null);
      return;
    }

    const { statusId: targetStatusId, position } = dropZone;
    const sourceStatus = statuses.find((s) => s._id === sourceStatusId);
    const targetStatus = statuses.find((s) => s._id === targetStatusId);

    if (!sourceStatus || !targetStatus) {
      clearAllDropZoneStyles();
      setDropZone(null);
      return;
    }

    try {
      // Calculate the new order based on drop position
      let newOrder;

      if (position === "before") {
        newOrder = targetStatus.order;
      } else {
        // 'after'
        newOrder = targetStatus.order + 1;
      }

      // If we're moving from left to right and dropping 'after', we need to adjust
      if (sourceStatus.order < targetStatus.order && position === "after") {
        newOrder--;
      }

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

      // Reset dropzone state
      clearAllDropZoneStyles();
      setDropZone(null);

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

    if (confirm("Are you sure, this will delete all items in this column?")) {
      try {
        await removeStatus({
          id: statusId,
        });

        showToast("success", "Status column deleted");
      } catch (error) {
        console.error("Error deleting status:", error);
        showToast("error", "Failed to delete status column");
      }
    }
  };

  // Function to handle deleting an application
  const handleDeleteApplication = async (
    e: React.MouseEvent,
    applicationId: Id<"applications">
  ) => {
    e.stopPropagation(); // Prevent opening the application modal

    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await removeApplication({ id: applicationId });
        showToast("success", "Application deleted");

        // If the deleted application is currently selected in the modal, close the modal
        if (selectedApplication && selectedApplication._id === applicationId) {
          closeApplicationModal();
        }
      } catch (error) {
        console.error("Error deleting application:", error);
        showToast("error", "Failed to delete application");
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
      const target = event.target as HTMLElement;

      // Is the click inside or related to the color picker?
      const isColorPickerClick =
        colorPickerRef.current?.contains(target) ||
        target.closest(".color-picker-trigger") !== null;

      // Is the click inside or related to the status menu or its buttons?
      const isStatusMenuOrTriggerClick =
        statusMenuRef.current?.contains(target) ||
        target.closest(".status-menu-trigger") !== null ||
        target.closest(".editing-status-container") !== null;

      // Close color picker when clicking outside (excluding triggers)
      if (
        colorPickerRef.current &&
        colorPickerRef.current.style.display !== "none" &&
        !colorPickerRef.current.contains(target) &&
        !isColorPickerClick
      ) {
        colorPickerRef.current.style.display = "none";
        colorPickerRef.current.classList.add("hidden");
      }

      // Close new status form when clicking outside
      if (
        newStatusFormRef.current &&
        isAddingStatus &&
        !newStatusFormRef.current.contains(target) &&
        !target.closest(".add-status-trigger") &&
        !isColorPickerClick
      ) {
        setIsAddingStatus(false);
      }

      // Close status menu when clicking outside (but not on its trigger or the menu itself)
      if (
        editingStatusId !== null &&
        !isStatusMenuOrTriggerClick &&
        !isColorPickerClick
      ) {
        setEditingStatusId(null);
      }

      // Handle click outside application modal
      if (
        applicationModalRef.current &&
        selectedApplication &&
        !applicationModalRef.current.contains(target) &&
        target.classList.contains("modal-overlay")
      ) {
        closeApplicationModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedApplication, editingStatusId, isAddingStatus]);

  // Show color picker
  const showColorPicker = (
    e: React.MouseEvent,
    statusId: Id<"applicationStatuses"> | null
  ) => {
    e.stopPropagation();
    const colorPicker = colorPickerRef.current;

    if (colorPicker) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();

      // Position the color picker just below the button
      colorPicker.style.position = "fixed";
      colorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
      colorPicker.style.left = `${rect.left + window.scrollX}px`;

      // Make sure it's visible by setting both display and removing hidden class
      colorPicker.style.display = "block";
      colorPicker.classList.remove("hidden");

      // Store which status we're editing in data attributes
      if (statusId === null) {
        // We're adding a new status
        colorPicker.setAttribute("data-for-new", "true");
        colorPicker.removeAttribute("data-for-edit");
        colorPicker.removeAttribute("data-status-id");
      } else if (statusId === editingStatusId) {
        // We're editing a status
        colorPicker.setAttribute("data-for-edit", "true");
        colorPicker.removeAttribute("data-for-new");
        colorPicker.setAttribute("data-status-id", statusId);
      } else {
        // Direct color change on a status
        colorPicker.removeAttribute("data-for-new");
        colorPicker.removeAttribute("data-for-edit");
        colorPicker.setAttribute("data-status-id", statusId);
      }
    }
  };

  // Select color from picker
  const selectColor = (color: string) => {
    const colorPicker = colorPickerRef.current;
    if (!colorPicker) return;

    const forNewStatus = colorPicker.hasAttribute("data-for-new");
    const forEditStatus = colorPicker.hasAttribute("data-for-edit");
    const statusIdAttr = colorPicker.getAttribute("data-status-id");

    if (forNewStatus) {
      // For new status
      setNewStatusColor(color);
    } else if (forEditStatus && statusIdAttr) {
      // For editing existing status
      setEditingStatusColor(color);
    } else if (statusIdAttr) {
      // Direct update without editing mode
      const statusId = statusIdAttr as Id<"applicationStatuses">;
      updateStatus({ id: statusId, color });
    }

    // Hide the color picker, but don't close the add status form
    colorPicker.style.display = "none";
    colorPicker.classList.add("hidden");
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

    // Validate required fields
    if (
      !editedApplication.companyName.trim() ||
      !editedApplication.position.trim()
    ) {
      showToast("error", "Company and position are required fields");
      return;
    }

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
        statusId: editedApplication.statusId,
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

  // Add click outside detection for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close mobile menu when clicking outside
      const actionsMenu = document.getElementById("mobile-actions-menu");
      if (
        actionsMenu &&
        !actionsMenu.contains(target) &&
        !target.closest('button[aria-controls="mobile-actions-menu"]')
      ) {
        actionsMenu.classList.add("hidden");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add document listeners for closing menus on navigation
  useEffect(() => {
    const closeMenus = () => {
      // Close mobile menus when navigating
      const actionsMenu = document.getElementById("mobile-actions-menu");
      const searchInput = document.getElementById("mobile-search");
      if (actionsMenu) actionsMenu.classList.add("hidden");
      if (searchInput) searchInput.classList.add("hidden");
    };

    // Listen for navigation events
    window.addEventListener("popstate", closeMenus);

    return () => {
      window.removeEventListener("popstate", closeMenus);
    };
  }, []);

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
        className="fixed hidden z-[100] bg-[#0c1029] border border-[#20253d] rounded-md p-2 shadow-xl"
        style={{ display: "none" }}
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
      <main className="relative z-10 max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Back button and title */}
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="p-2 rounded-md text-gray-300 hover:bg-[#121a36] hover:text-white mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="relative">
                {isMobile && !showingAllColumns && statuses.length > 0 && (
                  <div className="flex items-center space-x-1 mb-1 text-xs text-gray-400">
                    <span>{activeColumnIndex + 1}</span>
                    <span>/</span>
                    <span>{statuses.length}</span>
                  </div>
                )}
                <h2 className="text-lg md:text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 relative z-10">
                  {isMobile && !showingAllColumns && statuses.length > 0
                    ? statuses.sort((a, b) => a.order - b.order)[
                        activeColumnIndex
                      ]?.name || "Applications"
                    : "Job Applications"}
                </h2>
                <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-indigo-500/40"></div>
              </div>
            </div>

            {/* Search input - only visible on larger screens */}
            <div className="hidden md:block ml-4">
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

          {/* Mobile search icon and menu */}
          <div className="flex items-center space-x-2">
            {/* Search button for mobile */}
            <button
              className="md:hidden p-2 rounded-md text-gray-300 hover:bg-[#121a36] hover:text-white"
              onClick={() => {
                // Implement search display toggle for mobile
                const searchInput = document.getElementById("mobile-search");
                if (searchInput) {
                  searchInput.classList.toggle("hidden");
                  if (!searchInput.classList.contains("hidden")) {
                    setTimeout(() => {
                      const input = searchInput.querySelector("input");
                      if (input) input.focus();
                    }, 100);
                  }
                }
              }}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop buttons */}
            <div className="hidden md:flex space-x-2 md:space-x-3">
              <button
                onClick={toggleReorderingMode}
                className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm ${
                  isReorderingColumns
                    ? "border-blue-500 bg-blue-500/30 text-white"
                    : "border-[#20253d]/50 text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70"
                }`}
              >
                <Move className="h-4 w-4 mr-2 text-blue-400" />
                {isReorderingColumns ? "Done" : "Reorder"}
              </button>

              <button
                onClick={() => setIsAddingStatus(true)}
                className="add-status-trigger inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-2 text-blue-400" />
                <span className="hidden sm:inline">Add Status</span>
                <span className="sm:hidden">Status</span>
              </button>

              <Link
                href="/dashboard/applications/new"
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-2 text-blue-400" />
                <span className="hidden sm:inline">New Application</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-md text-gray-300 hover:bg-[#121a36] hover:text-white"
                onClick={() => {
                  // Toggle mobile menu dropdown
                  const mobileMenu = document.getElementById(
                    "mobile-actions-menu"
                  );
                  if (mobileMenu) {
                    mobileMenu.classList.toggle("hidden");
                  }
                }}
                aria-controls="mobile-actions-menu"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Mobile menu dropdown */}
              <div
                id="mobile-actions-menu"
                className="hidden absolute right-2 top-14 z-50 bg-[#121a36] border border-[#20253d] rounded-md shadow-lg overflow-hidden w-48"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAddingStatus(true);
                      document
                        .getElementById("mobile-actions-menu")
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2545] hover:text-white flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-3 text-blue-400" />
                    Add Status
                  </button>

                  <Link
                    href="/dashboard/applications/new"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2545] hover:text-white flex items-center"
                    onClick={() =>
                      document
                        .getElementById("mobile-actions-menu")
                        ?.classList.add("hidden")
                    }
                  >
                    <Plus className="h-4 w-4 mr-3 text-blue-400" />
                    New Application
                  </Link>

                  <button
                    onClick={() => {
                      toggleReorderingMode();
                      document
                        .getElementById("mobile-actions-menu")
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2545] hover:text-white flex items-center"
                  >
                    <Move className="h-4 w-4 mr-3 text-blue-400" />
                    {isReorderingColumns
                      ? "Done Reordering"
                      : "Reorder Columns"}
                  </button>

                  <button
                    onClick={() => {
                      toggleColumnsView();
                      document
                        .getElementById("mobile-actions-menu")
                        ?.classList.add("hidden");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1a2545] hover:text-white flex items-center"
                  >
                    <Columns className="h-4 w-4 mr-3 text-blue-400" />
                    {showingAllColumns
                      ? "Single Column View"
                      : "All Columns View"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar (hidden by default) */}
        <div id="mobile-search" className="md:hidden mb-4 hidden">
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
                onClick={(e) => showColorPicker(e, null)}
                className="color-picker-trigger px-3 py-2 rounded-md border border-[#20253d]/50 focus:outline-none flex items-center"
              >
                <div
                  className={`w-5 h-5 rounded-full ${newStatusColor} mr-2`}
                ></div>
                <PaintBucket className="h-4 w-4 text-gray-400" />
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
                Drag and drop columns to reorder them. Click "Done" when
                finished.
              </p>
            </div>
          </div>
        )}

        {/* Board controls - horizontal scroll buttons */}
        <div className="flex justify-between items-center mb-2">
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
          {...swipeHandlers}
          id="board-container"
          className={`flex ${
            !isMobile || showingAllColumns
              ? "overflow-x-auto"
              : "overflow-hidden"
          } pb-4 space-x-3 md:space-x-4 ${
            isMobile && !showingAllColumns ? "" : "custom-scrollbar"
          } relative`}
          style={{ scrollbarWidth: "thin", msOverflowStyle: "auto" }}
        >
          {/* Status Columns */}
          {statuses
            .sort((a, b) => a.order - b.order)
            .map((status, index) => (
              <div
                key={status._id}
                data-status-id={status._id}
                className={`status-column flex-shrink-0 w-72 sm:w-76 md:w-80 bg-[#121a36]/50 backdrop-blur-sm rounded-lg border overflow-hidden relative ${
                  isReorderingColumns
                    ? "border-dashed border-[#20253d] cursor-move"
                    : "border-[#20253d]/50"
                } ${
                  dropZone?.statusId === status._id
                    ? dropZone.position === "before"
                      ? "drop-zone-left"
                      : "drop-zone-right"
                    : ""
                } ${
                  isMobile && !showingAllColumns
                    ? index === activeColumnIndex
                      ? "block w-full transform-none"
                      : "hidden"
                    : ""
                }`}
                draggable={isReorderingColumns}
                onDragStart={(e) => handleStatusDragStart(e, status._id)}
                onDragEnd={handleStatusDragEnd}
                onDragOver={handleStatusDragOver}
                onDrop={handleStatusDrop}
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
                {/* Drop zone indicators that appear during drag */}
                {isReorderingColumns && (
                  <>
                    <div className="drop-indicator drop-indicator-left"></div>
                    <div className="drop-indicator drop-indicator-right"></div>
                  </>
                )}

                {/* Column Header */}
                <div
                  className={`column-header px-3 py-2.5 sm:px-4 sm:py-3 ${status.color}/20 border-b border-[#20253d]/50 flex items-center justify-between relative`}
                  onDragOver={handleDragOver}
                  onDrop={handleApplicationDrop}
                >
                  {editingStatusId === status._id ? (
                    <div className="flex items-center space-x-2 w-full pr-8 editing-status-container">
                      <input
                        type="text"
                        value={editingStatusName}
                        onChange={(e) => setEditingStatusName(e.target.value)}
                        className="bg-[#0c1029]/50 border border-[#20253d]/70 px-2 py-1 rounded text-white text-sm flex-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showColorPicker(e, status._id);
                        }}
                        className="color-picker-trigger p-1 rounded hover:bg-[#0c1029]/30"
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${editingStatusColor}`}
                        ></div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(status._id);
                        }}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatusId(null);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStatus(status._id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete this status"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        {isReorderingColumns && (
                          <GripHorizontal className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <div
                          className={`h-3 w-3 rounded-full ${status.color} mr-2 cursor-pointer hover:ring-2 hover:ring-white/30`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isReorderingColumns) {
                              showColorPicker(e, status._id);
                            }
                          }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingStatus(status);
                            }}
                            className="status-menu-trigger p-1 text-gray-400 hover:text-gray-200"
                            title="Edit this status"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Cards */}
                <div
                  className="column-body p-2 h-[calc(100vh-11rem)] sm:h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)] overflow-y-auto"
                  onDragOver={handleDragOver}
                  onDrop={handleApplicationDrop}
                >
                  {filteredApplications
                    .filter((app) => app.statusId === status._id)
                    // Sort applications by date - newest first
                    .sort(
                      (a, b) =>
                        new Date(b.dateApplied).getTime() -
                        new Date(a.dateApplied).getTime()
                    )
                    .map((application) => (
                      <div
                        key={application._id}
                        data-app-id={application._id}
                        draggable={!isReorderingColumns}
                        onDragStart={(e) => handleDragStart(e, application._id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={handleApplicationDrop}
                        onClick={() => openApplicationModal(application)}
                        className={`application-card mb-2 pl-5 pr-3 py-3 bg-[#0c1029]/80 rounded-md border border-[#20253d]/50 cursor-pointer hover:shadow-md hover:border-[#20253d] transition-all duration-200 relative group
                          ${
                            dropTargetId === application._id &&
                            dropPosition === "before"
                              ? "border-t-2 border-t-blue-500 pt-[10px]"
                              : ""
                          }
                          ${
                            dropTargetId === application._id &&
                            dropPosition === "after"
                              ? "border-b-2 border-b-blue-500 pb-[10px]"
                              : ""
                          }`}
                      >
                        {!isReorderingColumns && (
                          <div className="absolute -left-1 top-0 bottom-0 w-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <GripVertical
                              size={16}
                              className="text-gray-400 drag-handle"
                            />
                          </div>
                        )}
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
                          <button
                            onClick={(e) =>
                              handleDeleteApplication(e, application._id)
                            }
                            className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete this application"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {application.notes && (
                          <p className="mt-2 text-xs text-gray-400 border-t border-[#20253d]/30 pt-2 line-clamp-2">
                            {application.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>

        {/* Mobile Column Navigation Dots */}
        {isMobile && !showingAllColumns && statuses.length > 0 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
            {statuses
              .sort((a, b) => a.order - b.order)
              .map((status, index) => (
                <button
                  key={status._id}
                  onClick={() => navigateToColumn(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === activeColumnIndex
                      ? `${status.color} w-4`
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Navigate to ${status.name}`}
                />
              ))}
          </div>
        )}

        {/* Mobile Toggle View Button (Zoom in/out) */}
        {isMobile && (
          <div className="fixed bottom-16 right-4 z-20">
            <button
              onClick={toggleColumnsView}
              className="p-3 rounded-full bg-[#121a36] border border-[#20253d] shadow-lg text-gray-200 hover:bg-[#192245] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              aria-label={showingAllColumns ? "Zoom In" : "Zoom Out"}
            >
              {showingAllColumns ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              )}
            </button>
          </div>
        )}

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
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={editedApplication?.companyName || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Position <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={editedApplication?.position || ""}
                          onChange={handleApplicationInputChange}
                          className="w-full bg-[#0c1029] border border-[#20253d] rounded px-3 py-2 text-white"
                          required
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
                      onClick={(e) =>
                        handleDeleteApplication(e, selectedApplication!._id)
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
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

        {/* Add custom CSS for scrollbars */}
        <style jsx global>{`
          /* Hide scrollbar for mobile view */
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          /* Custom scrollbar for desktop */
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
            background-color: rgba(12, 16, 41, 0.3);
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background-color: rgba(12, 16, 41, 0.3);
            border-radius: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(32, 37, 61, 0.8);
            border-radius: 8px;
            border: 1px solid rgba(59, 130, 246, 0.1);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(59, 130, 246, 0.6);
          }

          /* Vertical scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background-color: #0c1029;
            border-radius: 8px;
          }

          ::-webkit-scrollbar-thumb {
            background-color: #20253d;
            border-radius: 8px;
            border: 1px solid #121a36;
          }

          ::-webkit-scrollbar-thumb:hover {
            background-color: #2a3152;
          }

          /* Firefox scrollbar */
          * {
            scrollbar-width: thin;
            scrollbar-color: #20253d #0c1029;
          }

          /* Drop zone indicators */
          .drop-indicator {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: transparent;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .drop-indicator-left {
            left: 0;
            border-radius: 4px 0 0 4px;
          }

          .drop-indicator-right {
            right: 0;
            border-radius: 0 4px 4px 0;
          }

          .drop-zone-left .drop-indicator-left {
            background-color: rgba(59, 130, 246, 0.7);
            box-shadow: -2px 0 8px rgba(59, 130, 246, 0.4);
            opacity: 1;
          }

          .drop-zone-right .drop-indicator-right {
            background-color: rgba(59, 130, 246, 0.7);
            box-shadow: 2px 0 8px rgba(59, 130, 246, 0.4);
            opacity: 1;
          }

          .status-column.drop-zone-left {
            margin-left: 10px;
            transform: translateX(-5px);
            transition: transform 0.2s ease;
          }

          .status-column.drop-zone-right {
            margin-right: 10px;
            transform: translateX(5px);
            transition: transform 0.2s ease;
          }

          /* Gap effect when dragging */
          .status-column {
            transition: margin 0.2s ease, transform 0.2s ease;
          }

          /* Application card dragging styles */
          .status-column .application-card[draggable="true"]:active {
            cursor: grabbing;
            transform: scale(1.02);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
            z-index: 10;
          }

          .application-card .drag-handle {
            cursor: grab;
          }

          .application-card:active .drag-handle {
            cursor: grabbing;
          }

          /* Highlight drop zone */
          .column-header.drop-target,
          .column-body.drop-target {
            background-color: rgba(59, 130, 246, 0.1);
            transition: background-color 0.2s ease;
          }
        `}</style>
      </main>
    </div>
  );
}
