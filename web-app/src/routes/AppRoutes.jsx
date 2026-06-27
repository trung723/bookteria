import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Chat from "../pages/Chat";
import Friends from "../pages/Friends";  
import Groups from "../pages/Groups";   
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword  from "../pages/ResetPassword";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/friends" element={<Friends />} /> 
        <Route path="/groups" element={<Groups />} />  
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} /> 
      </Routes>
    </Router>
  );
};

export default AppRoutes;