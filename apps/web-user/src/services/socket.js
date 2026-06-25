import { io } from "socket.io-client";

// Get base URL without /api at the end for socket
const getBaseUrl = () => {
    // If running on local development
    return "http://localhost:5000";
};

const socket = io(getBaseUrl(), {
    autoConnect: false, // We'll connect manually when user is authenticated
});

export default socket;
