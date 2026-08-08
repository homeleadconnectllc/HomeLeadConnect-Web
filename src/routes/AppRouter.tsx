import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";

import LoginPage from "../pages/auth/Login";
import SignupPage from "../pages/auth/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import UpdatePasswordPage from "../pages/auth/UpdatePassword";

import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/dashboard/Profile";
import Messages from "../pages/dashboard/Messages";
import Calendar from "../pages/dashboard/Calendar";

import NotFound from "../pages/errors/404";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/update-password" element={<UpdatePasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
