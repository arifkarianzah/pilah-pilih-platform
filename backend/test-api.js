require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 2, role: 'petugas' }, process.env.JWT_SECRET || 'secret');
const run = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/pickups/status/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ status: 'accepted' })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch(err) {
        console.log("Fetch Error:", err);
    }
    process.exit();
};
run();
