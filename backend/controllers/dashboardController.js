const db = require("../config/db");

// Statistik User
exports.userDashboard = (req, res) => {
    const userId = req.user.id;

    const totalPickupQuery = `SELECT COUNT(*) as total_pickup FROM pickups WHERE user_id = ? AND status = 'completed'`;
    const recentTxQuery = `
        SELECT p.id, p.waste_type as name, p.estimated_weight as qty, 
               (p.estimated_weight * wp.price_per_kg) as price, 
               p.created_at as date, p.status
        FROM pickups p
        LEFT JOIN waste_prices wp ON p.waste_type = wp.waste_type
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT 5
    `;

    const activePickupQuery = `
        SELECT * FROM pickups 
        WHERE user_id = ? AND status != 'completed' 
        ORDER BY created_at DESC 
        LIMIT 1
    `;

    db.query(totalPickupQuery, [userId], (err, result1) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        db.query(recentTxQuery, [userId], (err, result2) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            db.query(activePickupQuery, [userId], (err, result3) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                
                res.json({
                    success: true,
                    total_pickup: result1[0].total_pickup,
                    recent_transactions: result2,
                    active_pickup: result3.length > 0 ? result3[0] : null
                });
            });
        });
    });
};

// Statistik Penjualan Chart
exports.userSalesChart = (req, res) => {
    const userId = req.user.id;
    const { month } = req.query; // 'current' atau 'last'

    // Determine date range based on month parameter
    let startDate = new Date();
    startDate.setDate(1); // First day of current month
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // First day of next month

    if (month === 'last') {
        endDate = new Date(startDate); // First day of current month
        startDate.setMonth(startDate.getMonth() - 1); // First day of last month
    }

    const sql = `
        SELECT 
            DATE(created_at) as date,
            SUM(amount) as total_sales
        FROM wallet_transactions 
        WHERE user_id = ? AND type = 'credit' AND created_at >= ? AND created_at < ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `;

    db.query(sql, [userId, startDate, endDate], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Format results for Recharts
        // We will generate fixed points (e.g., weekly or every few days) to make it look like the mockup, 
        // but populated with real data where it matches.
        // Actually, let's just return the raw aggregated data and let frontend handle it, 
        // or just format it as an array of { name: 'D MMM', value: amount }
        
        const salesData = results.map(row => {
            const d = new Date(row.date);
            return {
                name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`,
                value: parseFloat(row.total_sales)
            };
        });

        let finalData = salesData;
        let finalTotal = salesData.reduce((sum, item) => sum + item.value, 0);

        res.json({
            success: true,
            data: salesData,
            total: finalTotal
        });
    });
};

// Statistik Admin
exports.adminDashboard = (req, res) => {
    db.query(
        `SELECT COUNT(*) as total_pickups FROM pickups`,
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            res.json({
                success: true,
                total_pickups: result[0].total_pickups
            });
        }
    );
};
exports.getWastePrices = (req, res) => {
    const sql = `SELECT wp.waste_type as type, wp.price_per_kg as price, wt.icon, wt.description as \`desc\` FROM waste_prices wp LEFT JOIN waste_types wt ON wp.waste_type = wt.name`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
};