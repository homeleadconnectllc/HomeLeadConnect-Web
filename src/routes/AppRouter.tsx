import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";

import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import Estimator from "../pages/Estimator";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/dashboard/Leads";
import Jobs from "../pages/dashboard/Jobs";
import JobDetail from "../pages/dashboard/JobDetail";
import Calendar from "../pages/dashboard/Calendar";
import Settings from "../pages/dashboard/Settings";
import NotFound from "../pages/errors/404";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/estimator" element={<Estimator />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
