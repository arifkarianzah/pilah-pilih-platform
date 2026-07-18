import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./auth.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pickup from "./pages/Pickup";
import JualSampah from "./pages/JualSampah";
import History from "./pages/History";
import Wallet from "./pages/Wallet";
import Withdraw from "./pages/Withdraw";
import Profile from "./pages/Profile";
import Reward from "./pages/Reward";
import Edukasi from "./pages/Edukasi";
import ArticleDetail from "./pages/ArticleDetail";
import AiScan from "./pages/AiScan";
import Chat from "./pages/Chat";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pickup" element={<ProtectedRoute><Pickup /></ProtectedRoute>} />
        <Route path="/jual-sampah" element={<ProtectedRoute><JualSampah /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/reward" element={<ProtectedRoute><Reward /></ProtectedRoute>} />
        <Route path="/ai-scan" element={<ProtectedRoute><AiScan /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:pickupId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/edukasi" element={<ProtectedRoute><Edukasi /></ProtectedRoute>} />
        <Route path="/edukasi/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
