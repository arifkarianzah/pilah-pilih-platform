const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Public routes
router.post("/register", authController.register);
router.post("/register-pengepul", authController.registerPengepul);
router.post("/register-admin", authController.registerAdmin);
router.post("/login", authController.login);

router.post("/register-petugas", verifyToken, authController.registerPetugas);
router.get("/profile", verifyToken, authController.profile);
router.put("/profile", verifyToken, authController.updateProfile);
router.put("/update-status", verifyToken, authController.updatePetugasStatus);
router.post("/change-password", verifyToken, authController.changePassword);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
