import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import Estimator from "../pages/Estimator";
import RequestService from "../pages/RequestService";
import PublicInfo from "../pages/PublicInfo";
import Legal from "../pages/Legal";

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
import Messages from "../pages/dashboard/Messages";
import Notifications from "../pages/dashboard/Notifications";
import ManualCommunications from "../pages/dashboard/ManualCommunications";
import AgentWorkspace from "../pages/dashboard/AgentWorkspace";
import Documents from "../pages/dashboard/Documents";
import CallCenter from "../pages/dashboard/CallCenter";
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
          <Route path="/leadscope" element={<PublicInfo page="leadscope" />} />
          <Route path="/community" element={<PublicInfo page="community" />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="/terms" element={<Legal page="terms" />} />
          <Route path="/platform-disclosure" element={<Legal page="platform" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/portal/accept" element={<AcceptInvitation />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/homeowner-portal" element={<HomeownerPortal />} />
            <Route path="/contractor-portal" element={<ContractorPortal />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route element={<WorkspaceLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/manual-communications" element={<ManualCommunications />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/call-center" element={<CallCenter />} />
              <Route path="/hq" element={<AgentWorkspace agentId="kendrell" />} />
              <Route path="/operations" element={<AgentWorkspace agentId="dion" />} />
              <Route path="/customer-experience" element={<AgentWorkspace agentId="diamond" />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
