"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  PlusCircle,
  MessageSquare,
  Trash,
  RefreshCw,
  Copy,
  Pencil,
  Check,
  X,
  Tag,
  Plus,
  ChevronDown,
  Save,
  GripVertical,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

// Define tag color options for dark theme
const TAG_COLORS = [
  { bg: "bg-blue-900/50", text: "text-blue-300", name: "Blue" },
  { bg: "bg-green-900/50", text: "text-green-300", name: "Green" },
  { bg: "bg-red-900/50", text: "text-red-300", name: "Red" },
  { bg: "bg-yellow-900/50", text: "text-yellow-300", name: "Yellow" },
  { bg: "bg-purple-900/50", text: "text-purple-300", name: "Purple" },
  { bg: "bg-pink-900/50", text: "text-pink-300", name: "Pink" },
  { bg: "bg-indigo-900/50", text: "text-indigo-300", name: "Indigo" },
  { bg: "bg-gray-800/50", text: "text-gray-300", name: "Gray" },
  { bg: "bg-orange-900/50", text: "text-orange-300", name: "Orange" },
];

interface Tag {
  name: string;
  color: number; // Index of the color in TAG_COLORS
}

interface MessageType {
  _id: Id<"messages">;
  title: string;
  content: string;
  isDefault?: boolean;
  tags?: string[];
  createdAt: number;
}

export default function MessagesPage() {
  const { user } = useUser();

  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [editingMessageId, setEditingMessageId] =
    useState<Id<"messages"> | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<Id<"messages"> | null>(
    null
  );
  const [newTagName, setNewTagName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [messageFormData, setMessageFormData] = useState({
    title: "",
    content: "",
    isDefault: false,
    tags: [] as Tag[],
  });
  const [orderedMessages, setOrderedMessages] = useState<Array<MessageType>>(
    []
  );
  const [draggedItemId, setDraggedItemId] = useState<Id<"messages"> | null>(
    null
  );

  // Get messages for the current user
  const messages = useQuery(api.messages.listByUser, {
    userId: user?.id || "",
  });

  // Mutations
  const createMessage = useMutation(api.messages.create);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.remove);

  // Update the orderedMessages state when messages are loaded or updated
  useEffect(() => {
    if (messages && Array.isArray(messages)) {
      setOrderedMessages([...messages]);
    }
  }, [messages]);

  // Drag and drop handlers
  const handleDragStart = (messageId: Id<"messages">) => {
    setDraggedItemId(messageId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: Id<"messages">) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIndex = orderedMessages.findIndex(
      (m) => m._id === draggedItemId
    );
    const targetIndex = orderedMessages.findIndex((m) => m._id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Create a new array to avoid mutating state
      const newOrder = [...orderedMessages];
      // Remove the dragged item
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      // Insert it at the target position
      newOrder.splice(targetIndex, 0, draggedItem);

      setOrderedMessages(newOrder);
    }
  };

  const handleDragEnd = async () => {
    if (draggedItemId) {
      // Save the new order to the database
      try {
        // Get the ordered IDs
        const newOrderIds = orderedMessages.map((message, index) => ({
          id: message._id,
          order: index,
        }));

        // Update each message with its new order
        for (const item of newOrderIds) {
          await updateMessage({
            id: item.id,
            order: item.order,
          });
        }
      } catch (error) {
        console.error("Error updating message order:", error);
        // Revert to original order on error
        if (messages) {
          setOrderedMessages([...messages]);
        }
      }

      setDraggedItemId(null);
    }
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMessageFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setMessageFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleNewMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Convert tags to string format for storage
      const stringTags = messageFormData.tags.map(
        (tag) => `${tag.name}|${tag.color}`
      );

      await createMessage({
        userId: user.id,
        title: messageFormData.title,
        content: messageFormData.content,
        isDefault: messageFormData.isDefault,
        tags: stringTags,
      });

      // Reset form
      setMessageFormData({
        title: "",
        content: "",
        isDefault: false,
        tags: [],
      });
      setShowNewMessageForm(false);
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const handleEditMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessageId) return;

    try {
      // Convert tags to string format for storage
      const stringTags = messageFormData.tags.map(
        (tag) => `${tag.name}|${tag.color}`
      );

      await updateMessage({
        id: editingMessageId,
        title: messageFormData.title,
        content: messageFormData.content,
        isDefault: messageFormData.isDefault,
        tags: stringTags,
      });

      // Reset form
      setEditingMessageId(null);
      setMessageFormData({
        title: "",
        content: "",
        isDefault: false,
        tags: [],
      });
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const startEditing = (message: MessageType) => {
    setEditingMessageId(message._id);

    // Parse tags from string format
    const parsedTags = (message.tags || []).map((tagString: string) => {
      const [name, colorIndex] = tagString.split("|");
      return {
        name,
        color: parseInt(colorIndex) || 0,
      };
    });

    setMessageFormData({
      title: message.title,
      content: message.content,
      isDefault: message.isDefault || false,
      tags: parsedTags,
    });
    setShowNewMessageForm(false);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setMessageFormData({
      title: "",
      content: "",
      isDefault: false,
      tags: [],
    });
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage({ id: messageId });
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const copyMessageToClipboard = (
    content: string,
    messageId: Id<"messages">
  ) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const addTag = () => {
    if (
      newTagName.trim() &&
      !messageFormData.tags.some((tag) => tag.name === newTagName.trim())
    ) {
      setMessageFormData((prev) => ({
        ...prev,
        tags: [
          ...prev.tags,
          { name: newTagName.trim(), color: selectedColorIndex },
        ],
      }));
      setNewTagName("");
      setShowColorPicker(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMessageFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.name !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const selectColor = (index: number) => {
    setSelectedColorIndex(index);
    setShowColorPicker(false);
  };

  // Parse tags for display in the message list
  const parseTagsForDisplay = (messageTags: string[] | undefined) => {
    if (!messageTags) return [];

    return messageTags.map((tagString) => {
      const [name, colorIndex] = tagString.split("|");
      return {
        name,
        color: parseInt(colorIndex) || 0,
      };
    });
  };

  // Loading state
  if (!user || messages === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Render form tag section
  const renderTagsSection = () => (
    <div>
      <label
        htmlFor="tags"
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {messageFormData.tags.map((tag) => (
          <div
            key={tag.name}
            className={`flex items-center ${TAG_COLORS[tag.color].bg} ${
              TAG_COLORS[tag.color].text
            } rounded-full px-3 py-1 text-sm border border-[#20253d]/50`}
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => removeTag(tag.name)}
              className={`ml-1.5 ${
                TAG_COLORS[tag.color].text
              } hover:opacity-80 focus:outline-none cursor-pointer`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleTagKeyPress}
          placeholder="Add a tag"
          className="bg-[#121a36]/50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md rounded-r-none px-3 py-2 text-white"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`inline-flex items-center px-3 py-2 border-y border-r border-[#20253d]/50 rounded-none shadow-sm text-sm font-medium ${TAG_COLORS[selectedColorIndex].bg} ${TAG_COLORS[selectedColorIndex].text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span className="w-4 h-4 rounded-full mr-1"></span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 mt-1 w-48 bg-[#121a36] rounded-md shadow-lg z-10 border border-[#20253d]/50">
              <div className="p-2 grid grid-cols-3 gap-1">
                {TAG_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => selectColor(index)}
                    className={`${color.bg} ${color.text} px-2 py-1 rounded text-xs font-medium flex items-center justify-between cursor-pointer border border-[#20253d]/50`}
                  >
                    {color.name}
                    {selectedColorIndex === index && (
                      <Check className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center px-3 py-2 border-y border-r border-[#20253d]/50 rounded-r-md shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/70 hover:bg-[#1d2442]/50 focus:outline-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

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
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Header */}
      <header className="relative z-10 bg-[#0f1326]/80 shadow-md border-b border-[#20253d]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center mr-5 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
          </Link>
          <div className="relative">
            <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
              Message Templates
            </h1>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Create and manage message templates for quick copying
          </p>
          <button
            onClick={() => {
              setShowNewMessageForm((prev) => !prev);
              if (editingMessageId) cancelEditing();
            }}
            className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/60 focus:outline-none backdrop-blur-sm cursor-pointer relative group overflow-hidden transition-all duration-300"
          >
            {/* Gradient border hover effect */}
            <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 transition-opacity duration-300"></span>

            {showNewMessageForm ? (
              <span className="relative z-10">Cancel</span>
            ) : (
              <span className="relative z-10 flex items-center">
                <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                <span className="hidden sm:inline group-hover:text-white transition-colors duration-300">
                  Add Message
                </span>
              </span>
            )}
          </button>
        </div>

        {/* New Message Form */}
        {showNewMessageForm && (
          <div className="bg-[#121a36]/50 backdrop-blur-sm shadow-md rounded-lg p-6 mb-6 border border-[#20253d]/50">
            <h3 className="text-lg font-light text-white mb-4">
              Add New Message Template
            </h3>
            <form onSubmit={handleNewMessageSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Title *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={messageFormData.title}
                      onChange={handleMessageChange}
                      className="bg-[#121a36]/70 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md px-3 py-2 text-white"
                      placeholder="Message title"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Message Content *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      name="content"
                      rows={5}
                      required
                      value={messageFormData.content}
                      onChange={handleMessageChange}
                      className="bg-[#121a36]/70 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md px-3 py-2 text-white"
                      placeholder="Your message content. Use placeholders like [Name], [Company], etc."
                    />
                  </div>
                </div>

                {renderTagsSection()}

                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={messageFormData.isDefault}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-[#20253d]/50 rounded bg-[#121a36]/70"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Set as default message
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewMessageForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none mr-3 cursor-pointer backdrop-blur-sm"
                >
                  <X className="h-4 w-4 sm:mr-2 text-gray-400" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border-0 border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-400 hover:to-purple-500 focus:outline-none disabled:opacity-90 cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                >
                  <PlusCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Message</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Message Form */}
        {editingMessageId && (
          <div className="bg-[#121a36]/50 backdrop-blur-sm shadow-md rounded-lg p-6 mb-6 border border-[#20253d]/50">
            <h3 className="text-lg font-light text-white mb-4">
              Edit Message Template
            </h3>
            <form onSubmit={handleEditMessageSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Title *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={messageFormData.title}
                      onChange={handleMessageChange}
                      className="bg-[#121a36]/70 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md px-3 py-2 text-white"
                      placeholder="Message title"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Message Content *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      name="content"
                      rows={5}
                      required
                      value={messageFormData.content}
                      onChange={handleMessageChange}
                      className="bg-[#121a36]/70 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md px-3 py-2 text-white"
                      placeholder="Your message content. Use placeholders like [Name], [Company], etc."
                    />
                  </div>
                </div>

                {renderTagsSection()}

                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={messageFormData.isDefault}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-[#20253d]/50 rounded bg-[#121a36]/70"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Set as default message
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none mr-3 cursor-pointer backdrop-blur-sm"
                >
                  <X className="h-4 w-4 sm:mr-2 text-gray-400" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-400 hover:to-purple-500 focus:outline-none disabled:opacity-50 cursor-pointer backdrop-blur-sm"
                >
                  <Save className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages List */}
        {messages?.length === 0 ? (
          <div className="text-center py-16 bg-[#121a36]/50 backdrop-blur-sm shadow-md rounded-lg border border-[#20253d]/50">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-light text-white">
              No message templates yet
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Get started by creating your first message template.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 focus:outline-none cursor-pointer backdrop-blur-sm"
              >
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Message</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#121a36]/50 backdrop-blur-sm shadow-md rounded-lg overflow-hidden border border-[#20253d]/50">
            <ul className="divide-y divide-[#20253d]/50">
              {orderedMessages.map((message) => (
                <li
                  key={message._id}
                  className={`p-6 relative ${
                    draggedItemId === message._id
                      ? "opacity-50 bg-[#1d2442]/30"
                      : ""
                  }`}
                  draggable={true}
                  onDragStart={() => handleDragStart(message._id)}
                  onDragOver={(e) => handleDragOver(e, message._id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="absolute top-6 left-2 cursor-move">
                    <GripVertical className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  </div>
                  <div className="flex items-center justify-between mb-2 pl-8">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-lg font-light text-white">
                        {message.title}
                      </h3>
                      {message.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/30">
                          Default
                        </span>
                      )}
                      {message.tags &&
                        message.tags.length > 0 &&
                        parseTagsForDisplay(message.tags).map((tag) => (
                          <span
                            key={tag.name}
                            className={`px-2 py-0.5 text-xs ${
                              TAG_COLORS[tag.color].bg
                            } ${
                              TAG_COLORS[tag.color].text
                            } rounded-full border border-[#20253d]/70`}
                          >
                            {tag.name}
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          copyMessageToClipboard(message.content, message._id)
                        }
                        className="inline-flex items-center p-1.5 border border-[#20253d]/50 rounded-md text-gray-400 hover:text-orange-400 focus:outline-none cursor-pointer transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedMessageId === message._id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(message)}
                        className="inline-flex items-center p-1.5 border border-[#20253d]/50 rounded-md text-gray-400 hover:text-orange-400 focus:outline-none cursor-pointer transition-colors"
                        title="Edit message"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="inline-flex items-center p-1.5 border border-[#20253d]/50 rounded-md text-gray-400 hover:text-red-400 focus:outline-none cursor-pointer transition-colors"
                        title="Delete message"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-300 bg-[#1d2442]/30 p-3 rounded-md ml-8 border border-[#20253d]/50">
                    <pre className="font-sans whitespace-pre-wrap break-words">
                      {message.content}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 ml-8">
                    Added {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
