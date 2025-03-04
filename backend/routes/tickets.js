const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { auth, isAdmin, isOwnerOrAdmin } = require("../middleware/auth");

// Create a new ticket (authenticated users only)
router.post("/", auth, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      user: req.user._id,
    });
    await ticket.save();
    await ticket.populate("user", "username email");
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get tickets (users see their own, admins see all)
router.get("/", auth, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const tickets = await Ticket.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific ticket (owner or admin only)
router.get("/:id", auth, isOwnerOrAdmin, async (req, res) => {
  try {
    await req.ticket.populate("user", "username email");
    res.json(req.ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket status (admin only)
router.put("/:id/status", auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (!["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    ticket.status = status;
    await ticket.save();
    await ticket.populate("user", "username email");
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update ticket details (owner only)
router.put("/:id", auth, isOwnerOrAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description", "notes"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates" });
  }

  try {
    const ticket = req.ticket;
    updates.forEach((update) => {
      if (update === "notes") {
        // For notes, we want to append the new note to the existing notes array
        ticket.notes = [...(ticket.notes || []), ...req.body[update]];
      } else {
        ticket[update] = req.body[update];
      }
    });
    await ticket.save();
    await ticket.populate("user", "username email");
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete ticket (admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    await ticket.deleteOne();
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
