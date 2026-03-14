import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Donor from "./pages/Donor";
import Ngodashboard from "./pages/Ngodashboard.jsx";
import Volunteerdashboard from "./pages/Volunteerdashboard.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/donor" element={<Donor />} />
                <Route path="/login" element={<Login />} />
                <Route path="/ngo-dashboard" element={<Ngodashboard />} />
                <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;