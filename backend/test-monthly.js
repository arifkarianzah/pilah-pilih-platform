require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, role: 'pengepul' }, process.env.JWT_SECRET || 'secret');

const run = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/pengepul/monthly-stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', data);
    } catch (e) {
        console.error(e);
    }
};

run();
