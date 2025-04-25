"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  MoreVertical,
  X,
  Check,
  AlertCircle,
  PaintBucket,
  GripHorizontal,
  Move,
  Columns,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "@/app/components/Toast";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Available colors for status columns
const STATUS_COLORS = [
  { id: "bg-red-500", label: "Red" },
  { id: "bg-orange-500", label: "Orange" },
  { id: "bg-yellow-500", label: "Yellow" },
  { id: "bg-green-500", label: "Green" },
  { id: "bg-blue-500", label: "Blue" },
  { id: "bg-indigo-500", label: "Indigo" },
  { id: "bg-purple-500", label: "Purple" },
  { id: "bg-pink-500", label: "Pink" },
  { id: "bg-cyan-500", label: "Cyan" },
  { id: "bg-emerald-500", label: "Emerald" },
];

// Algorithm categories
const ALGORITHM_CATEGORIES = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Heap / Priority Queue",
  "Backtracking",
  "Tries",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

// Common Big O notations
const BIG_O_NOTATIONS = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n²)",
  "O(n³)",
  "O(2^n)",
  "O(n!)",
  "Other",
];

// Type definitions
type LeetcodeStatus = {
  _id: Id<"leetcodeStatuses">;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  userId: string;
};

type LeetcodeProblem = {
  _id: Id<"leetcodeProblems">;
  title: string;
  link?: string;
  difficulty?: string;
  statusId: Id<"leetcodeStatuses">;
  notes?: string;
  score: number;
  spaceComplexity?: string;
  timeComplexity?: string;
  customSpaceComplexity?: string;
  customTimeComplexity?: string;
  userId: string;
  dayOfWeek: number;
  orderIndex?: number;
  createdAt: number;
  updatedAt: number;
  mastered?: boolean;
  category?: string;
};

type ToastMessage = {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void; // Make onClose required
};

// Format time elapsed since a given date
const formatTimeElapsed = (date: string | number): string => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();

  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;

  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;

  // Convert to hours
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}hr`;

  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  // Convert to weeks
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w`;

  // Convert to months
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;

  // Convert to years
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}yr`;
};

export default function LeetcodeTrackerPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statuses, setStatuses] = useState<LeetcodeStatus[]>([]);
  const [problems, setProblems] = useState<LeetcodeProblem[]>([]);
  const [masteredProblems, setMasteredProblems] = useState<LeetcodeProblem[]>(
    []
  );
  const [groupedMasteredProblems, setGroupedMasteredProblems] = useState<
    {
      category: string;
      problems: LeetcodeProblem[];
    }[]
  >([]);
  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("bg-blue-500");
  const [editingStatusId, setEditingStatusId] =
    useState<Id<"leetcodeStatuses"> | null>(null);
  const [editingStatusName, setEditingStatusName] = useState("");
  const [editingStatusColor, setEditingStatusColor] = useState("");
  const [isReorderingColumns, setIsReorderingColumns] = useState(false);
  const [draggedStatusId, setDraggedStatusId] =
    useState<Id<"leetcodeStatuses"> | null>(null);
  const [dropZone, setDropZone] = useState<{
    statusId: Id<"leetcodeStatuses">;
    position: "before" | "after";
  } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedProblem, setSelectedProblem] =
    useState<LeetcodeProblem | null>(null);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [editedProblem, setEditedProblem] = useState<LeetcodeProblem | null>(
    null
  );

  // New mobile-specific state
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [showingAllColumns, setShowingAllColumns] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Refs for click outside detection
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const newStatusFormRef = useRef<HTMLDivElement>(null);
  const problemModalRef = useRef<HTMLDivElement>(null);

  // Add these to the state variables
  const [isDraggingProblem, setIsDraggingProblem] = useState(false);
  const [draggedProblemId, setDraggedProblemId] =
    useState<Id<"leetcodeProblems"> | null>(null);
  const [dropTargetId, setDropTargetId] =
    useState<Id<"leetcodeProblems"> | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  // Add these below the existing state variables
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchCurrentTarget, setTouchCurrentTarget] =
    useState<HTMLElement | null>(null);
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);

  // Add a state for showing mobile instructions
  const [showDragInstructions, setShowDragInstructions] = useState(false);

  // Add new problem state
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: "",
    link: "",
    notes: "",
    score: 1,
    spaceComplexity: "",
    timeComplexity: "",
    customSpaceComplexity: "",
    customTimeComplexity: "",
    category: "",
    difficulty: "",
  });
  const addProblemModalRef = useRef<HTMLDivElement>(null);

  // Get status data from Convex
  const statusesData = useQuery(api.leetcodeStatuses.listByUser, {
    userId: user?.id || "",
  });

  // Get problem data from Convex
  const problemsData = useQuery(api.leetcodeProblems.listByUser, {
    userId: user?.id || "",
  });

  // Convex mutations
  const initializeDefaultStatuses = useMutation(
    api.leetcodeStatuses.initializeDefaultStatuses
  );
  const createStatus = useMutation(api.leetcodeStatuses.create);
  const updateStatus = useMutation(api.leetcodeStatuses.update);
  const removeStatus = useMutation(api.leetcodeStatuses.remove);
  const reorderStatus = useMutation(api.leetcodeStatuses.reorder);
  const updateProblemStatus = useMutation(api.leetcodeProblems.updateStatus);
  const updateProblem = useMutation(api.leetcodeProblems.update);
  const removeProblem = useMutation(api.leetcodeProblems.remove);
  const updateProblemOrder = useMutation(api.leetcodeProblems.updateOrder);
  const createProblem = useMutation(api.leetcodeProblems.create);

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
    if (problemsData) {
      // Split problems into active and mastered
      const active: LeetcodeProblem[] = [];
      const mastered: LeetcodeProblem[] = [];

      problemsData.forEach((problem) => {
        const problemWithOptionalMastered = problem as LeetcodeProblem;
        if (problemWithOptionalMastered.mastered) {
          mastered.push(problemWithOptionalMastered);
        } else {
          active.push(problemWithOptionalMastered);
        }
      });

      setProblems(active);
      setMasteredProblems(mastered);
    }
  }, [problemsData]);

  // Reset active column index when statuses change
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      setActiveColumnIndex((prev) => (prev >= statuses.length ? 0 : prev));
    }
  }, [statuses]);

  // Add this useEffect for mobile instructions
  useEffect(() => {
    if (isMobile && showingAllColumns) {
      setShowDragInstructions(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowDragInstructions(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isMobile, showingAllColumns]);

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

  // Toggle between single column and all columns view
  const toggleColumnsView = () => {
    setShowingAllColumns(!showingAllColumns);
  };

  // Scroll horizontally on desktop
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("columns-container");
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Drag and drop functions for problems
  const handleDragStart = (
    e: React.DragEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    if (isReorderingColumns) return;

    setIsDraggingProblem(true);
    setDraggedProblemId(problemId);

    // Add data to the drag event
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type: "problem", id: problemId })
    );

    // Set the drag image
    const draggedElement = e.currentTarget as HTMLElement;
    if (draggedElement) {
      // Create ghost image with same dimensions but semi-transparent
      const rect = draggedElement.getBoundingClientRect();
      const ghost = draggedElement.cloneNode(true) as HTMLElement;

      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.transform = "rotate(3deg)";
      ghost.style.opacity = "0.8";
      ghost.style.position = "absolute";
      ghost.style.top = "-1000px";
      ghost.style.left = "-1000px";

      // Add it to the DOM temporarily
      document.body.appendChild(ghost);

      // Set as drag image
      e.dataTransfer.setDragImage(ghost, rect.width / 2, 20);

      // Clean up after drag operation
      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setIsDraggingProblem(false);
    setDraggedProblemId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isDraggingProblem || isReorderingColumns) return;

    // Find the problem element we're dragging over
    let problemElement = e.target as HTMLElement;
    while (
      problemElement &&
      !problemElement.hasAttribute("data-problem-id") &&
      problemElement !== e.currentTarget
    ) {
      problemElement = problemElement.parentElement as HTMLElement;
    }

    if (
      problemElement &&
      problemElement.hasAttribute("data-problem-id") &&
      problemElement !== e.currentTarget
    ) {
      const targetId = problemElement.getAttribute(
        "data-problem-id"
      ) as Id<"leetcodeProblems">;

      if (targetId !== draggedProblemId) {
        const rect = problemElement.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "before" : "after";

        setDropTargetId(targetId);
        setDropPosition(position);

        // Remove any existing hover classes
        document
          .querySelectorAll(".problem-drop-before, .problem-drop-after")
          .forEach((el) => {
            el.classList.remove("problem-drop-before", "problem-drop-after");
          });

        // Add appropriate hover class
        problemElement.classList.add(`problem-drop-${position}`);
      }
    } else {
      // We're just over the column but not a specific problem
      setDropTargetId(null);
      setDropPosition(null);

      // Remove any existing hover classes
      document
        .querySelectorAll(".problem-drop-before, .problem-drop-after")
        .forEach((el) => {
          el.classList.remove("problem-drop-before", "problem-drop-after");
        });
    }
  };

  const handleProblemDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    // Remove any existing hover classes
    document
      .querySelectorAll(".problem-drop-before, .problem-drop-after")
      .forEach((el) => {
        el.classList.remove("problem-drop-before", "problem-drop-after");
      });

    if (isReorderingColumns) return;

    // Get the data from the drag event
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const { type, id } = JSON.parse(data);

      if (type !== "problem" || !id) return;

      // Get the column we're dropping onto
      const columnElement = e.currentTarget as HTMLElement;
      const statusId = columnElement.getAttribute(
        "data-status-id"
      ) as Id<"leetcodeStatuses">;
      const dayOfWeekStr = columnElement.getAttribute("data-day-of-week");
      const dayOfWeek = dayOfWeekStr ? parseInt(dayOfWeekStr, 10) : 0;

      if (!statusId) return;

      // Get the problem being dragged
      const draggedProblem = problems.find((p) => p._id === id);
      if (!draggedProblem) return;

      // Check if we're dropping onto a different column
      if (
        draggedProblem.statusId !== statusId ||
        draggedProblem.dayOfWeek !== dayOfWeek
      ) {
        // Update the problem's status and day of week
        await updateProblemStatus({
          id,
          statusId,
          dayOfWeek,
        });
        showToast("success", "Problem moved");
        return;
      }

      // If we're in the same column and have a target, reorder
      if (dropTargetId && dropPosition) {
        const statusProblems = problems.filter(
          (p) => p.statusId === statusId && p.dayOfWeek === dayOfWeek
        );

        // Sort by order index
        const orderedProblems = [...statusProblems].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );

        // Find the indices of the dragged and target problems
        const draggedIndex = orderedProblems.findIndex((p) => p._id === id);
        const targetIndex = orderedProblems.findIndex(
          (p) => p._id === dropTargetId
        );

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create a new array with the reordered problems
        const newOrder = [...orderedProblems];
        const [removed] = newOrder.splice(draggedIndex, 1);

        // Adjust target index if needed
        let adjustedTargetIndex = targetIndex;
        if (draggedIndex < targetIndex && dropPosition === "before") {
          adjustedTargetIndex--;
        } else if (draggedIndex > targetIndex && dropPosition === "after") {
          adjustedTargetIndex++;
        }

        // Insert at the adjusted position
        const insertIndex =
          dropPosition === "after"
            ? adjustedTargetIndex + 1
            : adjustedTargetIndex;
        newOrder.splice(insertIndex, 0, removed);

        // Update order indices
        const problemIds = newOrder.map((p) => p._id);
        const orderIndices = problemIds.map((_, i) => i);

        await updateProblemOrder({
          problemIds,
          orderIndices,
        });

        showToast("success", "Problem reordered");
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      showToast("error", "Failed to move problem");
    }
  };

  // Status drag and drop functions
  const handleStatusDragStart = (
    e: React.DragEvent,
    statusId: Id<"leetcodeStatuses">
  ) => {
    if (!isReorderingColumns) return;

    setDraggedStatusId(statusId);

    // Add data to the drag event
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type: "status", id: statusId })
    );

    // Set the drag image
    const draggedElement = e.currentTarget as HTMLElement;
    if (draggedElement) {
      const rect = draggedElement.getBoundingClientRect();
      e.dataTransfer.setDragImage(
        draggedElement,
        rect.width / 2,
        rect.height / 2
      );
    }
  };

  const handleStatusDragEnd = (e: React.DragEvent) => {
    clearAllDropZoneStyles();
    setDraggedStatusId(null);
    setDropZone(null);
  };

  const handleStatusDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isReorderingColumns || !draggedStatusId) return;

    // Find the column being dragged over
    let columnElement = e.target as HTMLElement;
    while (
      columnElement &&
      !columnElement.hasAttribute("data-status-id") &&
      columnElement !== document.body
    ) {
      columnElement = columnElement.parentElement as HTMLElement;
    }

    if (columnElement && columnElement.hasAttribute("data-status-id")) {
      const targetId = columnElement.getAttribute(
        "data-status-id"
      ) as Id<"leetcodeStatuses">;

      if (targetId !== draggedStatusId) {
        const rect = columnElement.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const position = e.clientX < midX ? "before" : "after";

        setDropZone({ statusId: targetId, position });

        // Remove any existing dropzone styles
        clearAllDropZoneStyles();

        // Add the appropriate dropzone style
        columnElement.classList.add(`dropzone-${position}`);
      }
    }
  };

  const clearAllDropZoneStyles = () => {
    document
      .querySelectorAll(".dropzone-before, .dropzone-after")
      .forEach((el) => {
        el.classList.remove("dropzone-before", "dropzone-after");
      });
  };

  const handleStatusDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    clearAllDropZoneStyles();

    if (!isReorderingColumns || !draggedStatusId || !dropZone) return;

    // Get the data from the drag event
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const { type, id } = JSON.parse(data);

      if (type !== "status" || !id) return;

      // Find the indices of the dragged and target statuses
      const draggedStatus = statuses.find((s) => s._id === id);
      const targetStatus = statuses.find((s) => s._id === dropZone.statusId);

      if (!draggedStatus || !targetStatus) return;

      const draggedOrder = draggedStatus.order;
      const targetOrder = targetStatus.order;

      // Calculate the new order
      let newOrder = targetOrder;
      if (dropZone.position === "after") {
        newOrder = targetOrder + 1;
      }

      // If we're moving to the right, adjust target order
      if (draggedOrder < targetOrder) {
        newOrder =
          dropZone.position === "before" ? targetOrder - 1 : targetOrder;
      }

      // Update the status order
      await reorderStatus({
        userId: user?.id || "",
        statusId: id,
        newOrder,
      });

      showToast("success", "Columns reordered");
    } catch (error) {
      console.error("Error handling drop:", error);
      showToast("error", "Failed to reorder columns");
    }
  };

  // CRUD functions for statuses
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
      showToast("success", "Column added");
    } catch (error) {
      console.error("Error adding status:", error);
      showToast("error", "Failed to add column");
    }
  };

  const handleUpdateStatus = async (statusId: Id<"leetcodeStatuses">) => {
    try {
      await updateStatus({
        id: statusId,
        color: editingStatusColor,
      });

      setEditingStatusId(null);
      showToast("success", "Column color updated");
    } catch (error) {
      console.error("Error updating status color:", error);
      showToast("error", "Failed to update column color");
    }
  };

  const handleDeleteStatus = async (statusId: Id<"leetcodeStatuses">) => {
    if (
      !confirm(
        "Are you sure you want to delete this column and all its problems?"
      )
    ) {
      return;
    }

    try {
      await removeStatus({ id: statusId });
      showToast("success", "Column deleted");
    } catch (error) {
      console.error("Error deleting status:", error);
      showToast("error", "Failed to delete column");
    }
  };

  // Get day of week from a score
  const getTargetDayOfWeek = (score: number): number => {
    // Get current day (0-6, where 0 is Sunday)
    const today = new Date().getDay();

    // Calculate target day by adding the score
    const targetDay = (today + score) % 7;

    return targetDay;
  };

  // Problem CRUD operations
  const handleAddProblemClick = (statusId: Id<"leetcodeStatuses">) => {
    setNewProblem({
      title: "",
      link: "",
      notes: "",
      score: 1,
      spaceComplexity: "",
      timeComplexity: "",
      customSpaceComplexity: "",
      customTimeComplexity: "",
      category: "",
      difficulty: "",
    });
    setIsAddingProblem(true);
  };

  const handleAddProblem = async () => {
    if (!user || !newProblem.title.trim()) {
      showToast("error", "Problem title is required");
      return;
    }

    try {
      const targetDayOfWeek = getTargetDayOfWeek(newProblem.score);

      // Find the status for the target day
      const targetStatus = statuses.find((s) => s.order === targetDayOfWeek);

      if (!targetStatus) {
        showToast("error", "Could not find the target day column");
        return;
      }

      // Determine final complexity values
      const finalTimeComplexity =
        newProblem.timeComplexity === "Other"
          ? newProblem.customTimeComplexity
          : newProblem.timeComplexity;

      const finalSpaceComplexity =
        newProblem.spaceComplexity === "Other"
          ? newProblem.customSpaceComplexity
          : newProblem.spaceComplexity;

      await createProblem({
        userId: user.id,
        title: newProblem.title.trim(),
        statusId: targetStatus._id,
        dayOfWeek: targetDayOfWeek,
        link: newProblem.link.trim() || undefined,
        notes: newProblem.notes.trim() || undefined,
        score: newProblem.score,
        spaceComplexity: finalSpaceComplexity.trim() || undefined,
        timeComplexity: finalTimeComplexity.trim() || undefined,
        category: newProblem.category || undefined,
        difficulty: newProblem.difficulty || undefined,
      });

      setIsAddingProblem(false);
      showToast("success", "Problem added");
    } catch (error) {
      console.error("Error adding problem:", error);
      showToast("error", "Failed to add problem");
    }
  };

  const handleNewProblemInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle special case for complexity fields with "Other" option
    if (name === "timeComplexity" && value === "Other") {
      setNewProblem((prev) => ({
        ...prev,
        [name]: value,
        customTimeComplexity: "",
      }));
    } else if (name === "spaceComplexity" && value === "Other") {
      setNewProblem((prev) => ({
        ...prev,
        [name]: value,
        customSpaceComplexity: "",
      }));
    } else if (name === "customTimeComplexity") {
      setNewProblem((prev) => ({
        ...prev,
        customTimeComplexity: value,
      }));
    } else if (name === "customSpaceComplexity") {
      setNewProblem((prev) => ({
        ...prev,
        customSpaceComplexity: value,
      }));
    } else {
      setNewProblem((prev) => ({
        ...prev,
        [name]: name === "score" ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleDeleteProblem = async (
    e: React.MouseEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this problem?")) {
      return;
    }

    try {
      await removeProblem({ id: problemId });
      showToast("success", "Problem deleted");
    } catch (error) {
      console.error("Error deleting problem:", error);
      showToast("error", "Failed to delete problem");
    }
  };

  // Toast message
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({
      type,
      message,
      onClose: () => setToast(null), // Add onClose handler
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle color picker outside click
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        const clickedElement = event.target as HTMLElement;
        const isColorPickerButton = clickedElement.closest(
          "[data-color-picker-button]"
        );

        if (!isColorPickerButton) {
          setEditingStatusId(null);
        }
      }

      // Handle new status form outside click
      if (
        isAddingStatus &&
        newStatusFormRef.current &&
        !newStatusFormRef.current.contains(event.target as Node)
      ) {
        const clickedElement = event.target as HTMLElement;
        const isAddButton = clickedElement.closest("[data-add-status-button]");

        if (!isAddButton) {
          setIsAddingStatus(false);
        }
      }

      // Handle problem modal outside click
      if (
        problemModalRef.current &&
        !problemModalRef.current.contains(event.target as Node)
      ) {
        closeMenus();
      }

      // Handle add problem modal outside click
      if (
        isAddingProblem &&
        addProblemModalRef.current &&
        !addProblemModalRef.current.contains(event.target as Node)
      ) {
        setIsAddingProblem(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingStatus, isAddingProblem]);

  // Color picker for column colors
  const showColorPicker = (
    e: React.MouseEvent,
    statusId: Id<"leetcodeStatuses"> | null
  ) => {
    e.stopPropagation();

    // If we're editing an existing status
    if (statusId) {
      const foundStatus = statuses.find((s) => s._id === statusId);
      if (foundStatus) {
        setEditingStatusId(foundStatus._id);
        setEditingStatusName(foundStatus.name);
        setEditingStatusColor(foundStatus.color);
      }
      return;
    }

    // If we're adding a new status
    setIsAddingStatus(true);
  };

  // Select a color from the color picker
  const selectColor = (color: string) => {
    if (editingStatusId) {
      setEditingStatusColor(color);
    } else {
      setNewStatusColor(color);
    }
  };

  // Status editing functions
  const startEditingStatus = (status: LeetcodeStatus) => {
    setEditingStatusId(status._id);
    setEditingStatusName(status.name);
    setEditingStatusColor(status.color);
  };

  // Toggle reordering mode for columns
  const toggleReorderingMode = () => {
    setIsReorderingColumns(!isReorderingColumns);
  };

  // Problem modal functions
  const openProblemModal = (problem: LeetcodeProblem) => {
    setSelectedProblem(problem);

    // Add custom complexity fields if they don't exist
    const problemWithCustomFields = {
      ...problem,
      customTimeComplexity: problem.customTimeComplexity || "",
      customSpaceComplexity: problem.customSpaceComplexity || "",
    };

    setEditedProblem(problemWithCustomFields);
    setIsEditingProblem(false);
  };

  const closeProblemModal = () => {
    setSelectedProblem(null);
    setEditedProblem(null);
    setIsEditingProblem(false);
  };

  const toggleEditProblem = () => {
    setIsEditingProblem(!isEditingProblem);

    // Ensure the editedProblem has the custom fields if timeComplexity is "Other"
    if (selectedProblem && !isEditingProblem) {
      const updatedProblem = { ...selectedProblem };

      // Add customTimeComplexity if needed
      if (
        selectedProblem.timeComplexity === "Other" &&
        !updatedProblem.customTimeComplexity
      ) {
        updatedProblem.customTimeComplexity = "";
      }

      // Add customSpaceComplexity if needed
      if (
        selectedProblem.spaceComplexity === "Other" &&
        !updatedProblem.customSpaceComplexity
      ) {
        updatedProblem.customSpaceComplexity = "";
      }

      setEditedProblem(updatedProblem);
    }
  };

  const handleProblemInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editedProblem) return;

    const { name, value } = e.target;

    // Handle special case for complexity fields with "Other" option
    if (name === "timeComplexity" && value === "Other") {
      setEditedProblem({
        ...editedProblem,
        timeComplexity: value,
        customTimeComplexity: "",
      });
    } else if (name === "spaceComplexity" && value === "Other") {
      setEditedProblem({
        ...editedProblem,
        spaceComplexity: value,
        customSpaceComplexity: "",
      });
    } else if (name === "customTimeComplexity") {
      setEditedProblem({
        ...editedProblem,
        customTimeComplexity: value,
      });
    } else if (name === "customSpaceComplexity") {
      setEditedProblem({
        ...editedProblem,
        customSpaceComplexity: value,
      });
    } else {
      setEditedProblem({
        ...editedProblem,
        [name]: name === "score" ? parseInt(value, 10) : value,
      });
    }
  };

  const saveProblem = async () => {
    if (!editedProblem) return;

    try {
      const { _id } = editedProblem;

      // Get the original problem to calculate the day shift
      const originalProblem = problems.find((p) => p._id === _id);
      if (!originalProblem) {
        showToast("error", "Problem not found");
        return;
      }

      // Determine final complexity values
      const finalTimeComplexity =
        editedProblem.timeComplexity === "Other"
          ? editedProblem.customTimeComplexity
          : editedProblem.timeComplexity;

      const finalSpaceComplexity =
        editedProblem.spaceComplexity === "Other"
          ? editedProblem.customSpaceComplexity
          : editedProblem.spaceComplexity;

      // Prepare the update object with only the fields we want to update
      const updateData: {
        id: Id<"leetcodeProblems">;
        title?: string;
        link?: string;
        difficulty?: string;
        notes?: string;
        score?: number;
        spaceComplexity?: string;
        timeComplexity?: string;
        statusId?: Id<"leetcodeStatuses">;
        dayOfWeek?: number;
        category?: string;
      } = {
        id: _id,
        title: editedProblem.title,
        link: editedProblem.link,
        difficulty: editedProblem.difficulty,
        notes: editedProblem.notes,
        score:
          typeof editedProblem.score === "string"
            ? parseInt(editedProblem.score, 10)
            : editedProblem.score,
        spaceComplexity: finalSpaceComplexity,
        timeComplexity: finalTimeComplexity,
        category: editedProblem.category,
      };

      // Calculate the day shift based on score change
      if (originalProblem.score !== updateData.score) {
        // Calculate the difference in days
        const scoreDiff = updateData.score! - originalProblem.score;

        // Apply the difference to the current day
        let dayOfWeek = (originalProblem.dayOfWeek + scoreDiff) % 7;
        if (dayOfWeek < 0) dayOfWeek += 7; // Handle negative values

        // Find the target status for the new day
        const targetStatus = statuses.find((s) => s.order === dayOfWeek);
        if (!targetStatus) {
          showToast("error", "Could not find the target day column");
          return;
        }

        // Update the status ID and day of week in our update data
        updateData.statusId = targetStatus._id;
        updateData.dayOfWeek = dayOfWeek;
      }

      await updateProblem(updateData);

      // Completely close the modal
      setIsEditingProblem(false);
      setSelectedProblem(null);
      setEditedProblem(null);
      showToast("success", "Problem updated");
    } catch (error) {
      console.error("Error updating problem:", error);
      showToast("error", "Failed to update problem");
    }
  };

  // Close all open menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all open menus
      if (!selectedProblem && !isAddingStatus && editingStatusId === null) {
        return;
      }

      const targetElement = event.target as HTMLElement;

      // Check if we clicked on a menu trigger
      const isMenuTrigger = targetElement.closest("[data-menu-trigger]");
      if (isMenuTrigger) return;

      // Check if we clicked inside a menu
      const isInsideMenu =
        targetElement.closest("[data-menu]") ||
        targetElement.closest("[data-color-picker]") ||
        targetElement.closest("[data-problem-modal]");

      if (!isInsideMenu) {
        closeMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedProblem, isAddingStatus, editingStatusId]);

  const closeMenus = () => {
    setSelectedProblem(null);
    setIsAddingStatus(false);
    setEditingStatusId(null);
  };

  // Mobile touch handling for drag and drop
  const handleTouchStart = (
    e: React.TouchEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    if (isReorderingColumns) return;

    // Check if it's a long press (start timer)
    const target = e.currentTarget as HTMLElement;

    // Use setTimeout to detect long press
    const timer = setTimeout(() => {
      setTouchDragging(true);
      setDraggedProblemId(problemId);

      // Create and position the ghost element
      const rect = target.getBoundingClientRect();
      const ghost = target.cloneNode(true) as HTMLElement;

      ghost.style.position = "fixed";
      ghost.style.top = `${rect.top}px`;
      ghost.style.left = `${rect.left}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.transform = "rotate(2deg) scale(1.05)";
      ghost.style.opacity = "0.9";
      ghost.style.zIndex = "9999";
      ghost.style.pointerEvents = "none";
      ghost.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
      ghost.classList.add("touch-drag-ghost");

      document.body.appendChild(ghost);
      setGhostElement(ghost);

      // Visual feedback for the original element
      target.style.opacity = "0.4";

      // Show touch indicator
      showTouchIndicator(e);
    }, 300); // 300ms long press to start drag

    // Store the timer so we can clear it if touch ends before long press
    (e.currentTarget as any)._longPressTimer = timer;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragging || !ghostElement) return;

    const touch = e.touches[0];

    // Move the ghost element to follow the touch
    ghostElement.style.top = `${touch.clientY - 30}px`; // offset to position under finger
    ghostElement.style.left = `${
      touch.clientX - ghostElement.offsetWidth / 2
    }px`;

    // Find the element under the touch
    const elementsUnderTouch = document.elementsFromPoint(
      touch.clientX,
      touch.clientY
    );

    // Find column and problem elements under touch
    const columnElement = elementsUnderTouch.find((el) =>
      el.hasAttribute("data-status-id")
    ) as HTMLElement | undefined;

    const problemElement = elementsUnderTouch.find((el) =>
      el.hasAttribute("data-problem-id")
    ) as HTMLElement | undefined;

    // Reset previous touch target styles
    if (touchCurrentTarget && touchCurrentTarget !== columnElement) {
      touchCurrentTarget.classList.remove(
        "touch-drag-over",
        "problem-drop-before",
        "problem-drop-after"
      );
    }

    if (columnElement) {
      // We're over a column
      setTouchCurrentTarget(columnElement);
      columnElement.classList.add("touch-drag-over");

      // If we're also over a problem, handle problem drop position
      if (
        problemElement &&
        problemElement !== e.currentTarget &&
        problemElement.hasAttribute("data-problem-id")
      ) {
        const targetId = problemElement.getAttribute(
          "data-problem-id"
        ) as Id<"leetcodeProblems">;

        if (targetId !== draggedProblemId) {
          const rect = problemElement.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const position = touch.clientY < midY ? "before" : "after";

          setDropTargetId(targetId);
          setDropPosition(position);

          // Remove any existing hover classes
          document
            .querySelectorAll(".problem-drop-before, .problem-drop-after")
            .forEach((el) => {
              el.classList.remove("problem-drop-before", "problem-drop-after");
            });

          // Add appropriate hover class
          problemElement.classList.add(`problem-drop-${position}`);
        }
      } else {
        // Just over a column, not a specific problem
        setDropTargetId(null);
        setDropPosition(null);
      }
    } else {
      setTouchCurrentTarget(null);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    // Clear long press timer if touch ends before drag starts
    const timer = (e.currentTarget as any)._longPressTimer;
    if (timer) {
      clearTimeout(timer);
      (e.currentTarget as any)._longPressTimer = null;
    }

    if (!touchDragging || !draggedProblemId) {
      return;
    }

    try {
      const targetElement = touchCurrentTarget;

      if (
        targetElement &&
        targetElement.hasAttribute("data-status-id") &&
        targetElement.hasAttribute("data-day-of-week")
      ) {
        const statusId = targetElement.getAttribute(
          "data-status-id"
        ) as Id<"leetcodeStatuses">;
        const dayOfWeekStr = targetElement.getAttribute("data-day-of-week");
        const dayOfWeek = dayOfWeekStr ? parseInt(dayOfWeekStr, 10) : 0;

        // Get the problem being dragged
        const draggedProblem = problems.find((p) => p._id === draggedProblemId);
        if (!draggedProblem) return;

        // Check if we're dropping onto a different column
        if (
          draggedProblem.statusId !== statusId ||
          draggedProblem.dayOfWeek !== dayOfWeek
        ) {
          // Update the problem's status and day of week
          await updateProblemStatus({
            id: draggedProblemId,
            statusId,
            dayOfWeek,
          });
          showToast("success", "Problem moved");
        } else if (dropTargetId && dropPosition) {
          // We're in the same column and have a target - reorder

          const statusProblems = problems.filter(
            (p) => p.statusId === statusId && p.dayOfWeek === dayOfWeek
          );

          // Sort by order index
          const orderedProblems = [...statusProblems].sort(
            (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
          );

          // Find the indices of the dragged and target problems
          const draggedIndex = orderedProblems.findIndex(
            (p) => p._id === draggedProblemId
          );
          const targetIndex = orderedProblems.findIndex(
            (p) => p._id === dropTargetId
          );

          if (draggedIndex === -1 || targetIndex === -1) return;

          // Create a new array with the reordered problems
          const newOrder = [...orderedProblems];
          const [removed] = newOrder.splice(draggedIndex, 1);

          // Adjust target index if needed
          let adjustedTargetIndex = targetIndex;
          if (draggedIndex < targetIndex && dropPosition === "before") {
            adjustedTargetIndex--;
          } else if (draggedIndex > targetIndex && dropPosition === "after") {
            adjustedTargetIndex++;
          }

          // Insert at the adjusted position
          const insertIndex =
            dropPosition === "after"
              ? adjustedTargetIndex + 1
              : adjustedTargetIndex;
          newOrder.splice(insertIndex, 0, removed);

          // Update order indices
          const problemIds = newOrder.map((p) => p._id);
          const orderIndices = problemIds.map((_, i) => i);

          await updateProblemOrder({
            problemIds,
            orderIndices,
          });

          showToast("success", "Problem reordered");
        }
      }
    } catch (error) {
      console.error("Error handling touch drop:", error);
      showToast("error", "Failed to move problem");
    } finally {
      cleanupTouchDrag();
    }
  };

  const cleanupTouchDrag = () => {
    // Remove ghost element from DOM
    if (ghostElement && ghostElement.parentNode) {
      ghostElement.parentNode.removeChild(ghostElement);
    }

    // Reset original element opacity
    const originalElement = document.querySelector(
      `[data-problem-id="${draggedProblemId}"]`
    ) as HTMLElement;
    if (originalElement) {
      originalElement.style.opacity = "1";
    }

    // Reset other state
    if (touchCurrentTarget) {
      touchCurrentTarget.classList.remove(
        "touch-drag-over",
        "problem-drop-before",
        "problem-drop-after"
      );
    }

    // Remove any drop indicators
    document
      .querySelectorAll(".problem-drop-before, .problem-drop-after")
      .forEach((el) => {
        el.classList.remove("problem-drop-before", "problem-drop-after");
      });

    setTouchDragging(false);
    setDraggedProblemId(null);
    setGhostElement(null);
    setTouchCurrentTarget(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const showTouchIndicator = (e: React.TouchEvent) => {
    // Create a ripple effect to show the user the drag has started
    const touch = e.touches[0];
    const ripple = document.createElement("div");
    ripple.className = "touch-drag-indicator";
    ripple.style.position = "fixed";
    ripple.style.top = `${touch.clientY - 25}px`;
    ripple.style.left = `${touch.clientX - 25}px`;
    ripple.style.width = "50px";
    ripple.style.height = "50px";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.zIndex = "9998";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "ripple 0.8s ease-out forwards";

    document.body.appendChild(ripple);

    // Remove the ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  };

  // Add a function to mark a problem as mastered
  const handleMarkAsMastered = async (problemId: Id<"leetcodeProblems">) => {
    try {
      await updateProblem({
        id: problemId,
        mastered: true,
      });

      // Close the modal and show success message
      setSelectedProblem(null);
      showToast("success", "Problem marked as mastered!");
    } catch (error) {
      console.error("Error marking problem as mastered:", error);
      showToast("error", "Failed to mark problem as mastered");
    }
  };

  // Add a function to unmark a problem as mastered
  const handleUnmasterProblem = async (problemId: Id<"leetcodeProblems">) => {
    try {
      await updateProblem({
        id: problemId,
        mastered: false,
      });

      // Close the modal and show success message
      setSelectedProblem(null);
      showToast("success", "Problem moved back to active board");
    } catch (error) {
      console.error("Error unmarking problem as mastered:", error);
      showToast("error", "Failed to move problem back to board");
    }
  };

  // Use effect to group mastered problems by category
  useEffect(() => {
    if (masteredProblems.length === 0) {
      setGroupedMasteredProblems([]);
      return;
    }

    // Group problems by category
    const problemsByCategory: { [key: string]: LeetcodeProblem[] } = {};

    // Add "Uncategorized" group
    problemsByCategory["Uncategorized"] = [];

    // Group problems
    masteredProblems.forEach((problem) => {
      if (problem.category) {
        if (!problemsByCategory[problem.category]) {
          problemsByCategory[problem.category] = [];
        }
        problemsByCategory[problem.category].push(problem);
      } else {
        problemsByCategory["Uncategorized"].push(problem);
      }
    });

    // If no uncategorized problems, remove that group
    if (problemsByCategory["Uncategorized"].length === 0) {
      delete problemsByCategory["Uncategorized"];
    }

    // Sort categories alphabetically, but keep "Uncategorized" at the end
    const sortedCategories = Object.keys(problemsByCategory).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });

    // Create the grouped array
    const groupedProblems = sortedCategories.map((category) => ({
      category,
      problems: problemsByCategory[category],
    }));

    setGroupedMasteredProblems(groupedProblems);
  }, [masteredProblems]);

  // Loading state
  if (!user || !statuses || !problems) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Function to toggle category collapse
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      className="min-h-screen bg-[#090d1b] flex flex-col overflow-hidden"
      {...swipeHandlers}
    >
      {/* Header with navigation and controls */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center">
          <Link
            href="/dashboard/resources"
            className="text-gray-400 hover:text-white mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300">
            Leetcode Tracker
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {!isMobile && (
            <div className="hidden md:flex items-center mr-2">
              <button
                onClick={() => scrollContainer("left")}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollContainer("right")}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {isMobile && (
            <button
              onClick={toggleColumnsView}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 border border-gray-700"
            >
              <Columns className="h-5 w-5" />
              <span className="sr-only">
                {showingAllColumns ? "Single Column" : "All Columns"}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setNewProblem({
                title: "",
                link: "",
                notes: "",
                score: 1,
                spaceComplexity: "",
                timeComplexity: "",
                customSpaceComplexity: "",
                customTimeComplexity: "",
                category: "",
                difficulty: "",
              });
              setIsAddingProblem(true);
            }}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 border border-gray-700"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Problem</span>
          </button>
        </div>
      </div>

      {/* Mobile column navigation */}
      {isMobile && !showingAllColumns && statuses.length > 0 && (
        <div className="flex items-center justify-center p-2 bg-[#0c1324]">
          <button
            onClick={() => navigateToColumn(Math.max(0, activeColumnIndex - 1))}
            className="text-gray-400 p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
            disabled={activeColumnIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="mx-2 text-gray-300 text-sm">
            {statuses[activeColumnIndex]?.name || ""}
          </div>
          <button
            onClick={() =>
              navigateToColumn(
                Math.min(statuses.length - 1, activeColumnIndex + 1)
              )
            }
            className="text-gray-400 p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
            disabled={activeColumnIndex === statuses.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Mobile drag instructions */}
      {showDragInstructions && isMobile && (
        <div className="fixed top-16 left-0 right-0 mx-auto w-5/6 bg-blue-900/80 backdrop-blur-sm p-3 rounded-lg z-20 shadow-md text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="text-blue-300 mr-2 h-5 w-5" />
            <p className="text-white text-sm font-medium">Drag Instructions</p>
          </div>
          <p className="text-blue-100 text-xs">
            Long-press a problem to drag it between days. Tap a problem to view
            details.
          </p>
          <button
            onClick={() => setShowDragInstructions(false)}
            className="mt-2 text-xs text-blue-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Columns container */}
      <div
        id="columns-container"
        className="flex-1 overflow-x-auto overflow-y-hidden flex md:px-4 pt-2 pb-4"
      >
        <div
          className={`flex ${
            isMobile && !showingAllColumns ? "w-full h-full" : "space-x-4"
          }`}
        >
          {statuses.map((status, index) => (
            <div
              key={status._id}
              className={`flex-shrink-0 ${
                isMobile && !showingAllColumns
                  ? activeColumnIndex === index
                    ? "w-full h-full"
                    : "hidden"
                  : "w-72"
              }`}
              data-status-id={status._id}
              data-day-of-week={status.order}
            >
              {/* Column header */}
              <div
                className={`p-2 rounded-t-md flex items-center justify-between ${status.color} bg-opacity-70`}
              >
                <div className="flex items-center">
                  <h3 className="font-medium text-white truncate max-w-[140px]">
                    {status.name}
                  </h3>
                  <div className="ml-2 bg-white/20 text-white text-xs px-1.5 rounded-full">
                    {
                      problems.filter(
                        (p) =>
                          p.statusId === status._id &&
                          p.dayOfWeek === status.order
                      ).length
                    }
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="relative group" data-menu-trigger>
                    <button className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {/* Column menu dropdown */}
                    <div
                      className="absolute right-0 mt-1 w-36 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block"
                      data-menu
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Only allow color editing
                          const statusId = status._id;
                          const foundStatus = statuses.find(
                            (s) => s._id === statusId
                          );
                          if (foundStatus) {
                            setEditingStatusId(foundStatus._id);
                            setEditingStatusName(foundStatus.name);
                            setEditingStatusColor(foundStatus.color);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Change Color
                      </button>
                      {!status.isDefault && (
                        <button
                          onClick={() => handleDeleteStatus(status._id)}
                          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Problems container */}
              <div
                className="bg-[#121a36]/50 backdrop-blur-sm h-[calc(100vh-13rem)] overflow-y-auto p-2 rounded-b-md border border-t-0 border-[#20253d]/50 flex flex-col gap-2"
                onDragOver={handleDragOver}
                onDrop={handleProblemDrop}
              >
                {problems
                  .filter(
                    (p) =>
                      p.statusId === status._id && p.dayOfWeek === status.order
                  )
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((problem) => (
                    <div
                      key={problem._id}
                      className={`bg-[#1c2642]/70 p-3 rounded-md border border-[#2a3353]/60 cursor-pointer transition-all ${
                        draggedProblemId === problem._id
                          ? "opacity-50"
                          : "hover:border-indigo-500/40"
                      }`}
                      onClick={() => openProblemModal(problem)}
                      draggable={!isReorderingColumns}
                      onDragStart={(e) => handleDragStart(e, problem._id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, problem._id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      data-problem-id={problem._id}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-white">
                          {problem.title}
                        </h4>
                        <button
                          onClick={(e) => handleDeleteProblem(e, problem._id)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {problem.difficulty && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              problem.difficulty === "Easy"
                                ? "bg-green-500/20 text-green-300"
                                : problem.difficulty === "Medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {problem.difficulty.charAt(0)}
                          </span>
                        )}
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300"
                          title="Problem score"
                        >
                          {problem.score}
                        </span>
                      </div>
                      {problem.notes && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                          {problem.notes}
                        </p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {formatTimeElapsed(problem.updatedAt)}
                        </span>
                        {problem.link && (
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View Problem
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mastered Problems Section */}
      {masteredProblems.length > 0 && (
        <div className="border-t border-gray-800 mt-4 mx-4">
          <div className="flex items-center justify-between pt-4 pb-2">
            <h2 className="text-lg font-medium text-white">
              Mastered Problems
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-sm px-2 py-1 rounded-full">
              {masteredProblems.length}{" "}
              {masteredProblems.length === 1 ? "problem" : "problems"}
            </span>
          </div>

          {/* Render grouped problems */}
          {groupedMasteredProblems.map((group) => (
            <div key={group.category} className="mb-6">
              <h3
                className="text-indigo-300 text-md font-medium mt-4 mb-2 border-b border-indigo-900/30 pb-1 flex items-center cursor-pointer"
                onClick={() => toggleCategoryCollapse(group.category)}
              >
                <span className="mr-2">
                  {collapsedCategories[group.category] ? (
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-indigo-400" />
                  )}
                </span>
                {group.category}{" "}
                <span className="text-sm text-indigo-400/60 ml-1">
                  ({group.problems.length})
                </span>
              </h3>

              {!collapsedCategories[group.category] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.problems.map((problem) => (
                    <div
                      key={problem._id}
                      className="bg-[#121a36]/50 border border-emerald-800/30 p-3 rounded-md cursor-pointer hover:bg-[#1a2542]/50"
                      onClick={() => openProblemModal(problem)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-white">
                          {problem.title}
                        </h4>
                        {problem.difficulty && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              problem.difficulty === "Easy"
                                ? "bg-green-500/20 text-green-300"
                                : problem.difficulty === "Medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        )}
                      </div>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                        >
                          View Problem
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Color picker / status editor */}
      {(isAddingStatus || editingStatusId) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
          onClick={() => {
            setIsAddingStatus(false);
            setEditingStatusId(null);
          }}
        >
          <div
            ref={editingStatusId ? colorPickerRef : newStatusFormRef}
            className="bg-gray-900 p-4 rounded-lg w-80 max-w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            data-color-picker
          >
            <h3 className="text-white text-lg mb-4">
              {editingStatusId ? "Edit Day Color" : "Add New Day"}
            </h3>
            {!editingStatusId && (
              <div className="mb-4">
                <label className="block text-gray-400 mb-1 text-sm">Name</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter day name"
                />
              </div>
            )}
            {editingStatusId && (
              <div className="mb-4">
                <p className="text-gray-400 mb-1 text-sm">Name</p>
                <p className="text-white text-md font-medium">
                  {editingStatusName}
                </p>
              </div>
            )}
            <div className="mb-6">
              <label className="block text-gray-400 mb-1 text-sm">Color</label>
              <div className="grid grid-cols-5 gap-2">
                {STATUS_COLORS.map((color) => (
                  <button
                    key={color.id}
                    className={`w-10 h-10 rounded-full ${color.id} ${
                      (editingStatusId
                        ? editingStatusColor
                        : newStatusColor) === color.id
                        ? "ring-2 ring-white ring-opacity-60"
                        : ""
                    }`}
                    onClick={() => selectColor(color.id)}
                    aria-label={`Select ${color.label} color`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingStatus(false);
                  setEditingStatusId(null);
                }}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  editingStatusId
                    ? handleUpdateStatus(editingStatusId)
                    : handleAddStatus()
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                {editingStatusId ? "Update Color" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem detail modal */}
      {selectedProblem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
          onClick={closeProblemModal}
        >
          <div
            ref={problemModalRef}
            className="bg-gray-900 p-4 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-problem-modal
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg">
                {isEditingProblem ? "Edit Problem" : "Problem Details"}
              </h3>
              <button
                onClick={closeProblemModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isEditingProblem && editedProblem ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editedProblem.title}
                    onChange={handleProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={editedProblem.difficulty || ""}
                    onChange={handleProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Score (1-5)
                  </label>
                  <select
                    name="score"
                    value={editedProblem.score}
                    onChange={handleProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={1}>1 - Review tomorrow</option>
                    <option value={2}>2 - Review in 2 days</option>
                    <option value={3}>3 - Review in 3 days</option>
                    <option value={4}>4 - Review in 4 days</option>
                    <option value={5}>5 - Review in 5 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Problem Link
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={editedProblem.link || ""}
                    onChange={handleProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://leetcode.com/problems/..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-400 mb-1 text-sm">
                      Time Complexity
                    </label>
                    <select
                      name="timeComplexity"
                      value={editedProblem.timeComplexity || ""}
                      onChange={handleProblemInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select complexity</option>
                      {BIG_O_NOTATIONS.map((notation) => (
                        <option key={notation} value={notation}>
                          {notation}
                        </option>
                      ))}
                    </select>
                    {editedProblem.timeComplexity === "Other" && (
                      <input
                        type="text"
                        name="customTimeComplexity"
                        value={editedProblem.customTimeComplexity || ""}
                        onChange={handleProblemInputChange}
                        className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g., O(m*n)"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-400 mb-1 text-sm">
                      Space Complexity
                    </label>
                    <select
                      name="spaceComplexity"
                      value={editedProblem.spaceComplexity || ""}
                      onChange={handleProblemInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select complexity</option>
                      {BIG_O_NOTATIONS.map((notation) => (
                        <option key={notation} value={notation}>
                          {notation}
                        </option>
                      ))}
                    </select>
                    {editedProblem.spaceComplexity === "Other" && (
                      <input
                        type="text"
                        name="customSpaceComplexity"
                        value={editedProblem.customSpaceComplexity || ""}
                        onChange={handleProblemInputChange}
                        className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g., O(m*n)"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={editedProblem.notes || ""}
                    onChange={handleProblemInputChange}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Add your notes here..."
                  />
                </div>
                {/* Add this to the Edit Problem form */}
                <div>
                  <label className="block text-gray-400 mb-1 text-sm">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editedProblem.category || ""}
                    onChange={handleProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    {ALGORITHM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setIsEditingProblem(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProblem}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  {/* Add "Mastered" tag for mastered problems */}
                  {selectedProblem.mastered && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
                        Mastered
                      </span>
                      <button
                        onClick={() =>
                          handleUnmasterProblem(selectedProblem._id)
                        }
                        className="text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-800 rounded"
                      >
                        Move back to board
                      </button>
                    </div>
                  )}

                  <h4 className="text-white text-xl mb-2">
                    {selectedProblem.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProblem.difficulty && (
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          selectedProblem.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-300"
                            : selectedProblem.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {selectedProblem.difficulty}
                      </span>
                    )}
                    <span className="text-sm px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                      Score: {selectedProblem.score}
                    </span>

                    {/* Display category if available */}
                    {selectedProblem.category && (
                      <span className="text-sm px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                        {selectedProblem.category}
                      </span>
                    )}
                  </div>

                  {/* Add mastered checkbox if score is 5 */}
                  {selectedProblem.score === 5 && !selectedProblem.mastered && (
                    <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-md p-3 mt-2 mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="mastered-checkbox"
                          className="mr-2 h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                          onChange={() =>
                            handleMarkAsMastered(selectedProblem._id)
                          }
                        />
                        <label
                          htmlFor="mastered-checkbox"
                          className="text-emerald-300 text-sm"
                        >
                          Mark as mastered (achieved score of 5)
                        </label>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        This will move the problem to your mastered list below
                        the board.
                      </p>
                    </div>
                  )}

                  {(selectedProblem.timeComplexity ||
                    selectedProblem.spaceComplexity) && (
                    <div className="bg-gray-800/50 rounded-md p-2 mb-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {selectedProblem.timeComplexity && (
                          <div className="text-sm">
                            <span className="text-gray-400">Time:</span>
                            <span className="text-white ml-1">
                              {selectedProblem.timeComplexity}
                            </span>
                          </div>
                        )}
                        {selectedProblem.spaceComplexity && (
                          <div className="text-sm">
                            <span className="text-gray-400">Space:</span>
                            <span className="text-white ml-1">
                              {selectedProblem.spaceComplexity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedProblem.link && (
                    <a
                      href={selectedProblem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center mb-4"
                    >
                      <span>Open on Leetcode</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                  )}
                  <div className="border-t border-gray-800 my-4"></div>
                  <div>
                    <h5 className="text-gray-400 text-sm mb-1">Notes</h5>
                    <p className="text-white whitespace-pre-wrap">
                      {selectedProblem.notes || "No notes added."}
                    </p>
                  </div>
                  <div className="text-gray-500 text-xs mt-4">
                    Last updated:{" "}
                    {new Date(selectedProblem.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  {/* Only show edit button for non-mastered problems */}
                  {!selectedProblem.mastered && (
                    <button
                      onClick={toggleEditProblem}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                    >
                      Edit Problem
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      {isAddingProblem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
          onClick={() => setIsAddingProblem(false)}
        >
          <div
            ref={addProblemModalRef}
            className="bg-gray-900 p-4 rounded-lg w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg">Add Leetcode Problem</h3>
              <button
                onClick={() => setIsAddingProblem(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Problem Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newProblem.title}
                  onChange={handleNewProblemInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., Two Sum"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={newProblem.difficulty}
                  onChange={handleNewProblemInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Score <span className="text-red-500">*</span>
                  <span className="text-xs ml-1 text-gray-500">
                    (1-5, determines review schedule)
                  </span>
                </label>
                <select
                  name="score"
                  value={newProblem.score}
                  onChange={handleNewProblemInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value={1}>1 - Review tomorrow</option>
                  <option value={2}>2 - Review in 2 days</option>
                  <option value={3}>3 - Review in 3 days</option>
                  <option value={4}>4 - Review in 4 days</option>
                  <option value={5}>5 - Review in 5 days</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {`This problem will be scheduled for ${
                    [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ][getTargetDayOfWeek(newProblem.score)]
                  }`}
                </p>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Problem Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={newProblem.link}
                  onChange={handleNewProblemInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-400 mb-1 text-sm">
                    Time Complexity
                  </label>
                  <select
                    name="timeComplexity"
                    value={newProblem.timeComplexity}
                    onChange={handleNewProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select complexity</option>
                    {BIG_O_NOTATIONS.map((notation) => (
                      <option key={notation} value={notation}>
                        {notation}
                      </option>
                    ))}
                  </select>
                  {newProblem.timeComplexity === "Other" && (
                    <input
                      type="text"
                      name="customTimeComplexity"
                      value={newProblem.customTimeComplexity}
                      onChange={handleNewProblemInputChange}
                      className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g., O(m*n)"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 mb-1 text-sm">
                    Space Complexity
                  </label>
                  <select
                    name="spaceComplexity"
                    value={newProblem.spaceComplexity}
                    onChange={handleNewProblemInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Select complexity</option>
                    {BIG_O_NOTATIONS.map((notation) => (
                      <option key={notation} value={notation}>
                        {notation}
                      </option>
                    ))}
                  </select>
                  {newProblem.spaceComplexity === "Other" && (
                    <input
                      type="text"
                      name="customSpaceComplexity"
                      value={newProblem.customSpaceComplexity}
                      onChange={handleNewProblemInputChange}
                      className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g., O(m*n)"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={newProblem.notes}
                  onChange={handleNewProblemInputChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Add your notes, approach, or tips here..."
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Category
                </label>
                <select
                  name="category"
                  value={newProblem.category}
                  onChange={handleNewProblemInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select category</option>
                  {ALGORITHM_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsAddingProblem(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProblem}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Add Problem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={toast.onClose}
        />
      )}

      {/* Add global styles for touch dragging */}
      <style jsx global>{`
        .touch-drag-ghost {
          touch-action: none;
        }

        .touch-drag-over {
          background-color: rgba(79, 70, 229, 0.1);
        }

        .problem-drop-before {
          border-top: 2px solid #6366f1;
        }

        .problem-drop-after {
          border-bottom: 2px solid #6366f1;
        }

        .dropzone-before {
          box-shadow: -4px 0 0 #6366f1;
        }

        .dropzone-after {
          box-shadow: 4px 0 0 #6366f1;
        }

        @keyframes ripple {
          0% {
            transform: scale(0.1);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
