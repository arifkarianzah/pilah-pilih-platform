const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const a = require("../controllers/adminController");

const admin = [verifyToken, roleMiddleware("admin")];

// ── Dashboard ───────────────────────────────────────────
router.get("/stats",           ...admin, a.getAdminStats);
router.get("/chart/monthly",   ...admin, a.getMonthlyChart);
router.get("/activity",        ...admin, a.getRecentActivity);

// ── Kelola User ──────────────────────────────────────────
router.get("/users",               ...admin, a.getAllUsers);
router.put("/users/:id/toggle",    ...admin, a.toggleUserStatus);
router.delete("/users/:id",        ...admin, a.deleteUser);

// ── Kelola Petugas ───────────────────────────────────────
router.get("/petugas",                 ...admin, a.getAllPetugas);
router.post("/petugas",                ...admin, a.addPetugas);
router.put("/petugas/:id",             ...admin, a.editPetugas);
router.delete("/petugas/:id",          ...admin, a.deletePetugas);
router.put("/petugas/:id/toggle",      ...admin, a.togglePetugasStatus);

// ── Kelola Pengepul ──────────────────────────────────────
router.get("/pengepul",                ...admin, a.getAllPengepul);
router.post("/pengepul",               ...admin, a.addPengepul);
router.put("/pengepul/:id",            ...admin, a.editPengepul);
router.delete("/pengepul/:id",         ...admin, a.deletePengepul);
router.put("/pengepul/:id/verifikasi", ...admin, a.toggleVerifikasiPengepul);

// ── Jenis Sampah ─────────────────────────────────────────
router.get("/waste-types",             ...admin, a.getAllWasteTypes);
router.post("/waste-types",            ...admin, a.addWasteType);
router.put("/waste-types/:id",         ...admin, a.editWasteType);
router.delete("/waste-types/:id",      ...admin, a.deleteWasteType);
router.put("/waste-types/:id/toggle",  ...admin, a.toggleWasteType);

// ── Harga Sampah ─────────────────────────────────────────
router.get("/prices",          ...admin, a.getAllPrices);
router.put("/prices/:id",      ...admin, a.updatePrice);
router.get("/prices/history",  ...admin, a.getPriceHistory);

// ── Penarikan Saldo ──────────────────────────────────────
router.get("/withdrawals",                  ...admin, a.getAllWithdrawals);
router.put("/withdrawals/:id/approve",      ...admin, a.approveWithdrawal);
router.put("/withdrawals/:id/success",      ...admin, a.successWithdrawal);
router.put("/withdrawals/:id/reject",       ...admin, a.rejectWithdrawal);

// ── Monitoring ───────────────────────────────────────────
router.get("/pickups",          ...admin, a.getAllPickupsAdmin);
router.get("/sampah",           ...admin, a.getSampahMonitoring);

// ── Keuangan & Laporan ───────────────────────────────────
router.get("/keuangan",         ...admin, a.getKeuanganReport);
router.get("/transactions",     ...admin, a.getTransactionHistory);

// ── Notifikasi ───────────────────────────────────────────
router.get("/notifications",           ...admin, a.getAdminNotifications);
router.put("/notifications/read-all",  ...admin, a.markAllNotificationsAsRead);
router.put("/notifications/:id/read",  ...admin, a.markNotificationAsRead);

module.exports = router;
