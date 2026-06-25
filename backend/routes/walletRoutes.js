const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getWallet, getTransactions, withdraw, getWithdrawals, topup } = require("../controllers/walletController");

router.get("/", verifyToken, roleMiddleware("user", "petugas", "admin"), getWallet);
router.get("/transactions", verifyToken, roleMiddleware("user", "petugas", "admin"), getTransactions);
router.get("/withdrawals", verifyToken, roleMiddleware("user", "petugas", "admin"), getWithdrawals);
router.post("/withdraw", verifyToken, roleMiddleware("user", "petugas"), withdraw);
router.post("/topup", verifyToken, roleMiddleware("user", "petugas"), topup);

module.exports = router;
