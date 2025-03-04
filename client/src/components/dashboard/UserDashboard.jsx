import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets } from "../../features/tickets/ticketSlice";
import TicketDetails from "../tickets/TicketDetails";
import CreateTicketModal from "../tickets/CreateTicketModal";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Filter tickets to show only the current user's tickets
  const userTickets = tickets.filter(
    (ticket) => ticket.creator?._id === user?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Welcome, {user?.username}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's an overview of your tickets
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
          >
            Create New Ticket
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            {userTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  You haven't created any tickets yet.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                >
                  Create Your First Ticket
                </button>
              </div>
            ) : (
              <ul className="-my-5 divide-y divide-gray-200">
                {userTickets.map((ticket) => (
                  <li
                    key={ticket._id}
                    className="py-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status:{" "}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ticket.status === "open"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreateTicketModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}
