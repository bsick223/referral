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
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useUser();

  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [editingMessageId, setEditingMessageId] =
    useState<Id<"messages"> | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<Id<"messages"> | null>(
    null
  );
  const [messageFormData, setMessageFormData] = useState({
    title: "",
    content: "",
    isDefault: false,
  });

  // Get messages for the current user
  const messages = useQuery(api.messages.listByUser, {
    userId: user?.id || "",
  });

  // Mutations
  const createMessage = useMutation(api.messages.create);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.remove);

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
      await createMessage({
        userId: user.id,
        title: messageFormData.title,
        content: messageFormData.content,
        isDefault: messageFormData.isDefault,
      });

      // Reset form
      setMessageFormData({
        title: "",
        content: "",
        isDefault: false,
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
      await updateMessage({
        id: editingMessageId,
        title: messageFormData.title,
        content: messageFormData.content,
        isDefault: messageFormData.isDefault,
      });

      // Reset form
      setEditingMessageId(null);
      setMessageFormData({
        title: "",
        content: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const startEditing = (message: any) => {
    setEditingMessageId(message._id);
    setMessageFormData({
      title: message.title,
      content: message.content,
      isDefault: message.isDefault || false,
    });
    setShowNewMessageForm(false);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setMessageFormData({
      title: "",
      content: "",
      isDefault: false,
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

  // Loading state
  if (!user || messages === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center mr-4 text-gray-500 hover:text-gray-700"
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showNewMessageForm ? (
              "Cancel"
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Message
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Your message content. Use placeholders like [Name], [Company], etc."
                    />
                  </div>
                </div>

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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Add Message
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Your message content. Use placeholders like [Name], [Company], etc."
                    />
                  </div>
                </div>

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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!messageFormData.title || !messageFormData.content}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages List */}
        {messages.length === 0 ? (
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Message
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li key={message._id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.title}
                      </h3>
                      {message.isDefault && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          copyMessageToClipboard(message.content, message._id)
                        }
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Edit message"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete message"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    <pre className="font-sans whitespace-pre-wrap break-words">
                      {message.content}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
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
