import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

const AppEntry = lazy(() => import("../pages/AppEntry"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const Estimator = lazy(() => import("../pages/Estimator"));
const RequestService = lazy(() => import("../pages/RequestService"));
const PublicInfo = lazy(() => import("../pages/PublicInfo"));
const Legal = lazy(() => import("../pages/Legal"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const AcceptInvitation = lazy(() => import("../pages/portal/AcceptInvitation"));
const HomeownerPortal = lazy(() => import("../pages/portal/HomeownerPortal"));
const ContractorPortal = lazy(() => import("../pages/portal/ContractorPortal"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Ecosystem = lazy(() => import("../pages/dashboard/Ecosystem"));
const Leads = lazy(() => import("../pages/dashboard/Leads"));
const Jobs = lazy(() => import("../pages/dashboard/Jobs"));
const JobDetail = lazy(() => import("../pages/dashboard/JobDetail"));
const Calendar = lazy(() => import("../pages/dashboard/Calendar"));
const Settings = lazy(() => import("../pages/dashboard/Settings"));
const FollowUps = lazy(() => import("../pages/dashboard/FollowUps"));
const Messages = lazy(() => import("../pages/dashboard/Messages"));
const Notifications = lazy(() => import("../pages/dashboard/Notifications"));
const ManualCommunications = lazy(() => import("../pages/dashboard/ManualCommunications"));
const AgentWorkspace = lazy(() => import("../pages/dashboard/AgentWorkspace"));
const Documents = lazy(() => import("../pages/dashboard/Documents"));
const CallCenter = lazy(() => import("../pages/dashboard/CallCenter"));
const NotFound = lazy(() => import("../pages/errors/404"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<main style={{ padding: 32 }}><p role="status">Loading page…</p></main>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<AppEntry />} />
          <Route path="/contact" element={<ContactPage />} />
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
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/estimator" element={<Estimator />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
