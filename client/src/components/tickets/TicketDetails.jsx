import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateTicket,
  updateTicketStatus,
  deleteTicket,
} from "../../features/tickets/ticketSlice";

export default function TicketDetails({ ticket, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: ticket.title,
    description: ticket.description,
  });
  const [newNote, setNewNote] = useState("");

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.tickets);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      updateTicket({ id: ticket._id, updates: formData })
    );
    if (!result.error) {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (e) => {
    try {
      await dispatch(
        updateTicketStatus({ id: ticket._id, status: e.target.value })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const result = await dispatch(
      updateTicket({
        id: ticket._id,
        updates: {
          notes: [
            {
              text: newNote,
              createdBy: user.username,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      })
    );
    if (!result.error) {
      setNewNote("");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      const result = await dispatch(deleteTicket(ticket._id));
      if (!result.error) {
        onClose();
      }
    }
  };

  const isOwner = ticket.creator?._id === user?.id;
  const isAdmin = user?.role === "admin";

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ticket Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Title</h4>
              <p className="mt-1 text-sm text-gray-900">{ticket.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{ticket.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              {isAdmin ? (
                <select
                  value={ticket.status}
                  onChange={handleStatusChange}
                  disabled={loading}
                  className={`mt-1 block w-full px-3 py-1.5 text-sm font-semibold rounded-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <span
                  className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Created By</h4>
              <p className="mt-1 text-sm text-gray-900">
                {ticket.creator?.username}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Created At</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Notes Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Notes</h4>
              <div className="mt-2 space-y-2">
                {ticket.notes?.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-900">{note.text}</p>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                      <span>Added by: {note.createdBy}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <form onSubmit={handleAddNote} className="mt-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    rows={2}
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim() || loading}
                    className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </form>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
