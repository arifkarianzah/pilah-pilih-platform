const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Public routes
router.post("/register", authController.register);
router.post("/register-petugas", authController.registerPetugas);
router.post("/register-pengepul", authController.registerPengepul);
router.post("/register-admin", authController.registerAdmin);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", verifyToken, authController.profile);
router.put("/profile", verifyToken, authController.updateProfile);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
