import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTickets,
  updateTicketStatus,
} from "../../features/tickets/ticketSlice";
import TicketDetails from "../tickets/TicketDetails";
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((state) => state.tickets);
  const { user } = useSelector((state) => state.auth);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleStatusChange = async (e, ticketId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    try {
      await dispatch(
        updateTicketStatus({ id: ticketId, status: newStatus })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    statusFilter === "all" ? true : ticket.status === statusFilter
  );

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

  const getStatusCount = (status) => {
    return tickets.filter((ticket) => ticket.status === status).length;
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
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.username}. Manage all tickets here.
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchTickets())}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2 " />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tickets
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {tickets.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Tickets
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {getStatusCount("open")}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Progress
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {getStatusCount("in_progress")}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">All Tickets</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
             
            </select>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <li
                  key={ticket._id}
                  className="py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
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
                          className={`p-1.5 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 ${getStatusColor(
                            ticket.status
                          )}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                        <span className="text-sm text-gray-500">
                          Created by: {ticket.user?.username}
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
