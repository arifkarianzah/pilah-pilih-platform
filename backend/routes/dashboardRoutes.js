const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { userDashboard, userSalesChart, adminDashboard, getWastePrices } = require("../controllers/dashboardController");

router.get("/user", verifyToken, roleMiddleware("user"), userDashboard);
router.get("/sales", verifyToken, roleMiddleware("user"), userSalesChart);
router.get("/admin", verifyToken, roleMiddleware("admin"), adminDashboard);
router.get("/waste-prices", verifyToken, getWastePrices);

module.exports = router;
