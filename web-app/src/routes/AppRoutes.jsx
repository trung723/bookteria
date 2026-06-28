import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/localStorageService";
import Login          from "../pages/Login";
import Home           from "../pages/Home";
import Profile        from "../pages/Profile";
import Chat           from "../pages/Chat";
import Friends        from "../pages/Friends";
import Groups         from "../pages/Groups";
import Register       from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword  from "../pages/ResetPassword";
import BookPage       from "../pages/BookPage";

// Admin
import AdminLayout        from "../pages/admin/AdminLayout";
import Dashboard          from "../pages/admin/Dashboard";
import UserManagement     from "../pages/admin/UserManagement";
import PostManagement     from "../pages/admin/PostManagement";
import BookManagement     from "../pages/admin/BookManagement";
import MessageManagement  from "../pages/admin/MessageManagement";
import Analytics          from "../pages/admin/Analytics";

// Placeholder pages for missing routes
// Create dedicated files as needed: /admin/messages, /admin/settings
function ComingSoon({ title }) {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 700 }}>{title}</h2>
      <p style={{ color: "#868e96" }}>This page is under construction.</p>
    </div>
  );
}

const AdminRouteWrapper = () => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const scopes = payload.scope ? payload.scope.split(" ") : [];
    const isAdmin = scopes.includes("ROLE_ADMIN");
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Token invalid", error);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

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
        <Route path="/books/:slug"      element={<BookPage />} />

        {/* ── Admin routes ── */}
        <Route element={<AdminRouteWrapper />}>
          <Route path="/admin"
            element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/users"
            element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin/posts"
            element={<AdminLayout><PostManagement /></AdminLayout>} />
          <Route path="/admin/books"
            element={<AdminLayout><BookManagement /></AdminLayout>} />
          <Route path="/admin/analytics"
            element={<AdminLayout><Analytics /></AdminLayout>} />
          <Route path="/admin/messages"
            element={<AdminLayout><MessageManagement /></AdminLayout>} />
          <Route path="/admin/settings"
            element={<AdminLayout><ComingSoon title="Settings" /></AdminLayout>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;