import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login          from "../pages/Login";
import Home           from "../pages/Home";
import Profile        from "../pages/Profile";
import Chat           from "../pages/Chat";
import Friends        from "../pages/Friends";
import Groups         from "../pages/Groups";
import Register       from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword  from "../pages/ResetPassword";

// Admin
import AdminLayout        from "../pages/admin/AdminLayout";
import Dashboard          from "../pages/admin/Dashboard";
import UserManagement     from "../pages/admin/UserManagement";
import PostManagement     from "../pages/admin/PostManagement";
import ReportsManagement  from "../pages/admin/ReportsManagement";
import Analytics          from "../pages/admin/Analytics";

// Placeholder pages cho routes còn thiếu
// Tạo file riêng khi cần: /admin/messages, /admin/settings
function ComingSoon({ title }) {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 700 }}>{title}</h2>
      <p style={{ color: "#868e96" }}>Trang này đang được xây dựng.</p>
    </div>
  );
}

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* ── User routes ── */}
        <Route path="/login"            element={<Login />} />
        <Route path="/"                 element={<Home />} />
        <Route path="/profile"          element={<Profile />} />
        <Route path="/chat"             element={<Chat />} />
        <Route path="/friends"          element={<Friends />} />
        <Route path="/groups"           element={<Groups />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* ── Admin routes ── */}
        <Route path="/admin"
          element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/users"
          element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/posts"
          element={<AdminLayout><PostManagement /></AdminLayout>} />
        <Route path="/admin/reports"
          element={<AdminLayout><ReportsManagement /></AdminLayout>} />
        <Route path="/admin/analytics"
          element={<AdminLayout><Analytics /></AdminLayout>} />

        {/* Routes trong AdminLayout sidebar nhưng chưa có trang — tránh 404 */}
        <Route path="/admin/messages"
          element={<AdminLayout><ComingSoon title="Messages" /></AdminLayout>} />
        <Route path="/admin/settings"
          element={<AdminLayout><ComingSoon title="Settings" /></AdminLayout>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;