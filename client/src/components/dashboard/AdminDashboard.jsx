import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTickets,
  updateTicketStatus,
} from "../../features/tickets/ticketSlice";
import TicketDetails from "../tickets/TicketDetails";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = async (e, ticketId) => {
    e.stopPropagation(); // Prevent opening ticket details
    const newStatus = e.target.value;
    await dispatch(updateTicketStatus({ id: ticketId, status: newStatus }));
  };

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
        <h2 className="text-lg font-medium text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.username}. Manage all tickets here.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {tickets.map((ticket) => (
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
                      <div className="mt-1 flex items-center space-x-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(e, ticket._id)}
                          className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                          onClick={(e) => e.stopPropagation()} // Prevent opening ticket details
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                        <span className="text-sm text-gray-500">
                          Created by: {ticket.creator?.username}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
