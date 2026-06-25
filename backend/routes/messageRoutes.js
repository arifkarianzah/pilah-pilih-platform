const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/unread-count", verifyToken, messageController.getUnreadCount);
router.get("/user/:userId", verifyToken, messageController.getMessagesByUser);
router.get("/:pickupId", verifyToken, messageController.getMessagesByPickupId);
router.post("/", verifyToken, messageController.sendMessage);

module.exports = router;
