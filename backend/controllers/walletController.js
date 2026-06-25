const db = require("../config/db");

// GET Saldo User
exports.getWallet = (req, res) => {

    const user_id = req.user.id;

    db.query(
        "SELECT * FROM wallets WHERE user_id = ?",
        [user_id],
        (err, result) => {
            if(err) return res.status(500).json({ success: false, message: err.message });

            if(result.length === 0){
                // Create wallet on the fly if it doesn't exist
                db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [user_id], (insertErr) => {
                    if (insertErr) {
                        console.error("DB Error in getWallet:", insertErr);
                        return res.status(500).json({ success: false, message: insertErr.message });
                    }
                    return res.json({ success: true, balance: 0 });
                });
            } else {
                res.json({
                    success: true,
                    balance: result[0].balance
                });
            }
        }
    );

};

// GET Riwayat Transaksi
exports.getTransactions = (req, res) => {

    const user_id = req.user.id;

    db.query(
        "SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY id DESC",
        [user_id],
        (err, result) => {
            if(err) return res.status(500).json({ success: false, message: err.message });

            res.json({
                success: true,
                data: result
            });
        }
    );

};

// Request Withdrawal
exports.withdraw = (req, res) => {
    const userId = req.user.id;
    const { amount, bank_name, account_number, account_name } = req.body;

    // TODO: Verify if user has enough balance before allowing withdrawal

    db.query(
        `INSERT INTO withdrawals (user_id, amount, bank_name, account_number, account_name) VALUES (?,?,?,?,?)`,
        [userId, amount, bank_name, account_number, account_name],
        (err) => {
            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true,
                message:"Permintaan penarikan berhasil"
            });
        }
    );
};

// GET Riwayat Penarikan (Withdrawals)
exports.getWithdrawals = (req, res) => {
    const user_id = req.user.id;

    db.query(
        "SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC",
        [user_id],
        (err, result) => {
            if(err) return res.status(500).json({ success: false, message: err.message });

            res.json({
                success: true,
                data: result
            });
        }
    );
};

// POST Top Up Saldo
exports.topup = (req, res) => {
    const userId = req.user.id;
    const { amount, method } = req.body;

    if (!amount || amount < 10000) {
        return res.status(400).json({ success: false, message: "Minimal top up Rp 10.000" });
    }

    db.query(
        "UPDATE wallets SET balance = balance + ? WHERE user_id = ?",
        [amount, userId],
        (err) => {
            if(err) return res.status(500).json({ success: false, message: err.message });

            // Record transaction
            db.query(
                "INSERT INTO wallet_transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', ?)",
                [userId, amount, `Top Up Saldo via ${method || 'Bank'}`],
                (errTx) => {
                    if(errTx) return res.status(500).json({ success: false, message: errTx.message });
                    
                    res.json({ success: true, message: "Top up berhasil" });
                }
            );
        }
    );
};
