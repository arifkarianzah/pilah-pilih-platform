const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { 
    getDashboardStats, 
    getIncomingWaste, 
    updateWasteStatus, 
    getInventory, 
    updateInventory,
    getPetugasPerformance,
    createFactorySale,
    getFactorySales,
    getKeuangan,
    updateProfile,
    changePassword,
    getPetugasList,
    getMonthlyStats
} = require("../controllers/pengepulController");

// Semua route di bawah ini harus untuk pengepul
router.use(verifyToken, roleMiddleware("pengepul", "admin"));

// Dashboard
router.get("/dashboard", getDashboardStats);
router.get("/monthly-stats", getMonthlyStats);

// Sampah Masuk dari Petugas
router.get("/incoming-waste", getIncomingWaste);
router.put("/incoming-waste/:id/status", updateWasteStatus);

// Inventori
router.get("/inventory", getInventory);
router.put("/inventory", updateInventory);

// Petugas
router.get("/petugas-performance", getPetugasPerformance);

// Penjualan ke Pabrik
router.post("/sales", createFactorySale);
router.get("/sales", getFactorySales);

// Keuangan & Akun
router.get("/keuangan", getKeuangan);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.get("/petugas-list", getPetugasList);

module.exports = router;
