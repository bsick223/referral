"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Define tag color options
const TAG_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-800", name: "Blue" },
  { bg: "bg-green-100", text: "text-green-800", name: "Green" },
  { bg: "bg-red-100", text: "text-red-800", name: "Red" },
  { bg: "bg-yellow-100", text: "text-yellow-800", name: "Yellow" },
  { bg: "bg-purple-100", text: "text-purple-800", name: "Purple" },
  { bg: "bg-pink-100", text: "text-pink-800", name: "Pink" },
  { bg: "bg-indigo-100", text: "text-indigo-800", name: "Indigo" },
  { bg: "bg-gray-100", text: "text-gray-800", name: "Gray" },
  { bg: "bg-orange-100", text: "text-orange-800", name: "Orange" },
];

interface Tag {
  name: string;
  color: number; // Index of the color in TAG_COLORS
}

export default function MessagesPage() {
  const router = useRouter();
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
  const [orderedMessages, setOrderedMessages] = useState<any[]>([]);
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

  const startEditing = (message: any) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Render form tag section
  const renderTagsSection = () => (
    <div>
      <label
        htmlFor="tags"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {messageFormData.tags.map((tag) => (
          <div
            key={tag.name}
            className={`flex items-center ${TAG_COLORS[tag.color].bg} ${
              TAG_COLORS[tag.color].text
            } rounded-full px-3 py-1 text-sm`}
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
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none px-3 py-2"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-none shadow-sm text-sm font-medium ${TAG_COLORS[selectedColorIndex].bg} ${TAG_COLORS[selectedColorIndex].text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span className="w-4 h-4 rounded-full mr-1"></span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="p-2 grid grid-cols-3 gap-1">
                {TAG_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => selectColor(index)}
                    className={`${color.bg} ${color.text} px-2 py-1 rounded text-xs font-medium flex items-center justify-between cursor-pointer`}
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
          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 shadow-sm text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center mr-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Message Templates
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            Create and manage message templates for quick copying
          </p>
          <button
            onClick={() => {
              setShowNewMessageForm((prev) => !prev);
              if (editingMessageId) cancelEditing();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            {showNewMessageForm ? (
              "Cancel"
            ) : (
              <>
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Message</span>
              </>
            )}
          </button>
        </div>

        {/* New Message Form */}
        {showNewMessageForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add New Message Template
            </h3>
            <form onSubmit={handleNewMessageSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="Message title"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Set as default message
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewMessageForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Message Template
            </h3>
            <form onSubmit={handleEditMessageSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="Message title"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Set as default message
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
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
          <div className="text-center py-16 bg-white shadow rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No message templates yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first message template.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Message</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {orderedMessages.map((message) => (
                <li
                  key={message._id}
                  className={`p-6 relative ${
                    draggedItemId === message._id ? "opacity-50 bg-gray-50" : ""
                  }`}
                  draggable={true}
                  onDragStart={() => handleDragStart(message._id)}
                  onDragOver={(e) => handleDragOver(e, message._id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="absolute top-6 left-2 cursor-move">
                    <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </div>
                  <div className="flex items-center justify-between mb-2 pl-8">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.title}
                      </h3>
                      {message.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
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
                            } ${TAG_COLORS[tag.color].text} rounded-full`}
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
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        title="Edit message"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                        title="Delete message"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md ml-8">
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
