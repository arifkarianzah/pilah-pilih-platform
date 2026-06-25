const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getNotifications, markAllRead, markAsRead } = require("../controllers/notificationController");

// Semua route notifikasi butuh token (protected)
router.get("/", verifyToken, getNotifications);
router.put("/read-all", verifyToken, markAllRead);
router.put("/:id/read", verifyToken, markAsRead);

module.exports = router;
