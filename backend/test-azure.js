const run = async () => {
    try {
        // Login as admin
        const loginRes = await fetch('https://pilahpilih-backend-abc-gfa9dgdtfmfjbsgp.southeastasia-01.azurewebsites.net/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@pilahpilih.id', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            console.log("Login failed:", loginData);
            process.exit();
        }

        const token = loginData.token;
        console.log("Logged in, token:", token.substring(0, 20) + "...");

        // Try to send a message
        const response = await fetch('https://pilahpilih-backend-abc-gfa9dgdtfmfjbsgp.southeastasia-01.azurewebsites.net/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ pickup_id: 8, receiver_id: 7, message: "hai dari test" })
        });
        const data = await response.json();
        console.log("Message send Status:", response.status);
        console.log("Message send Data:", data);
    } catch(err) {
        console.log("Fetch Error:", err);
    }
    process.exit();
};
run();
