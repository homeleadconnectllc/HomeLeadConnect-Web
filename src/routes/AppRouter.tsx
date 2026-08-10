import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import Estimator from "../pages/Estimator";
import RequestService from "../pages/RequestService";
import PublicInfo from "../pages/PublicInfo";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AcceptInvitation from "../pages/portal/AcceptInvitation";
import HomeownerPortal from "../pages/portal/HomeownerPortal";
import ContractorPortal from "../pages/portal/ContractorPortal";

import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/dashboard/Leads";
import Jobs from "../pages/dashboard/Jobs";
import JobDetail from "../pages/dashboard/JobDetail";
import Calendar from "../pages/dashboard/Calendar";
import Settings from "../pages/dashboard/Settings";
import FollowUps from "../pages/dashboard/FollowUps";
import NotFound from "../pages/errors/404";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/request-service" element={<RequestService />} />
          <Route path="/about" element={<PublicInfo page="about" />} />
          <Route path="/homeowners" element={<PublicInfo page="homeowners" />} />
          <Route path="/contractors" element={<PublicInfo page="contractors" />} />
          <Route path="/how-it-works" element={<PublicInfo page="how" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/portal/accept" element={<AcceptInvitation />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/homeowner-portal" element={<HomeownerPortal />} />
            <Route path="/contractor-portal" element={<ContractorPortal />} />
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/follow-ups" element={<FollowUps />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
