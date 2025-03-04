const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

// Admin role middleware
const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

// Resource ownership middleware
const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const ticket = await require("../models/Ticket").findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (
      req.user.role !== "admin" &&
      ticket.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied. Not authorized." });
    }

    req.ticket = ticket;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { auth, isAdmin, isOwnerOrAdmin };
