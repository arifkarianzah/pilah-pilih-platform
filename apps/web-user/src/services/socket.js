import { io } from "socket.io-client";

// Get base URL without /api at the end for socket
const getBaseUrl = () => {
    // If running on local development
    return "https://pilahpilih-backend-abc-gfa9dgdtfmfjbsgp.southeastasia-01.azurewebsites.net";
};

const socket = io(getBaseUrl(), {
    autoConnect: false, // We'll connect manually when user is authenticated
    transports: ['polling', 'websocket'], // Prioritize polling first as fallback for Azure
});

export default socket;
