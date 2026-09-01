import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import WorkspaceLayout from "../layouts/WorkspaceLayout";

const HostEntry=lazy(()=>import("../pages/HostEntry"));
const AppEntry=lazy(()=>import("../pages/AppEntry"));
const About=lazy(()=>import("../pages/About"));
const Memorial=lazy(()=>import("../pages/Memorial"));
const ContactPage=lazy(()=>import("../pages/ContactPage"));
const Estimator=lazy(()=>import("../pages/Estimator"));
const RequestService=lazy(()=>import("../pages/RequestService"));
const PublicInfo=lazy(()=>import("../pages/PublicInfo"));
const PublicJourney=lazy(()=>import("../pages/PublicJourney"));
const ProfessionalApplication=lazy(()=>import("../pages/ProfessionalApplication"));
const PartnerAccess=lazy(()=>import("../pages/PartnerAccess"));
const Accessibility=lazy(()=>import("../pages/Accessibility"));
const Legal=lazy(()=>import("../pages/Legal"));
const Login=lazy(()=>import("../pages/auth/Login"));
const Register=lazy(()=>import("../pages/auth/Register"));
const ForgotPassword=lazy(()=>import("../pages/auth/ForgotPassword"));
const ResetPassword=lazy(()=>import("../pages/auth/ResetPassword"));
const AcceptInvitation=lazy(()=>import("../pages/portal/AcceptInvitation"));
const AcceptWorkspaceInvitation=lazy(()=>import("../pages/team/AcceptWorkspaceInvitation"));
const HomeownerPortal=lazy(()=>import("../pages/portal/HomeownerPortal"));
const ContractorPortal=lazy(()=>import("../pages/portal/ContractorPortal"));
const PartnerPortal=lazy(()=>import("../pages/portal/PartnerPortal"));
const HomeownerPortalSection=lazy(()=>import("../pages/portal/HomeownerPortalSection"));
const HomeownerPortalDocuments=lazy(()=>import("../pages/portal/HomeownerPortalDocuments"));
const ResidentProfile=lazy(()=>import("../pages/portal/ResidentProfile"));
const ContractorProfile=lazy(()=>import("../pages/portal/ContractorProfile"));
const ContractorPortalServices=lazy(()=>import("../pages/portal/ContractorPortalServices"));
const ContractorPortalDocuments=lazy(()=>import("../pages/portal/ContractorPortalDocuments"));
const Dashboard=lazy(()=>import("../pages/dashboard/Dashboard"));
const WorkHome=lazy(()=>import("../pages/dashboard/WorkHome"));
const StartHere=lazy(()=>import("../pages/dashboard/StartHere"));
const OperationalGuide=lazy(()=>import("../pages/dashboard/OperationalGuide"));
const FormsChecklists=lazy(()=>import("../pages/dashboard/FormsChecklists"));
const ResourcesWorkspace=lazy(()=>import("../pages/dashboard/ResourcesWorkspace"));
const Analytics=lazy(()=>import("../pages/dashboard/Analytics"));
const BillingWorkspace=lazy(()=>import("../pages/dashboard/BillingWorkspace"));
const PropertyIntelligence=lazy(()=>import("../pages/dashboard/PropertyIntelligence"));
const Ecosystem=lazy(()=>import("../pages/dashboard/Ecosystem"));
const Workflow=lazy(()=>import("../pages/dashboard/Workflow"));
const Automations=lazy(()=>import("../pages/dashboard/Automations"));
const WorkspaceActivity=lazy(()=>import("../pages/dashboard/WorkspaceActivity"));
const PartnerManagement=lazy(()=>import("../pages/dashboard/PartnerManagement"));
const LaunchSurface=lazy(()=>import("../pages/dashboard/LaunchSurfaceRouter"));
const CommunityHub=lazy(()=>import("../pages/dashboard/CommunityHub"));
const CommunityDiscover=lazy(()=>import("../pages/dashboard/CommunityDiscover"));
const CommunityMatchDeck=lazy(()=>import("../pages/dashboard/CommunityMatchDeck"));
const CommunityMessages=lazy(()=>import("../pages/dashboard/CommunityMessages"));
const CommunityChallenges=lazy(()=>import("../pages/dashboard/CommunityChallenges"));
const CommunityAcademy=lazy(()=>import("../pages/dashboard/CommunityAcademy"));
const AcademyWorkspace=lazy(()=>import("../pages/dashboard/AcademyWorkspace"));
const RoleplayKnowledgeWorkspace=lazy(()=>import("../pages/dashboard/RoleplayKnowledgeWorkspace"));
const EligibilityFit=lazy(()=>import("../pages/dashboard/EligibilityFit"));
const ProviderMap=lazy(()=>import("../pages/dashboard/ProviderMap"));
const NetworkDirectory=lazy(()=>import("../pages/dashboard/NetworkDirectory"));
const MyProfile=lazy(()=>import("../pages/dashboard/MyProfile"));
const Leads=lazy(()=>import("../pages/dashboard/Leads"));
const LeadDetail=lazy(()=>import("../pages/dashboard/LeadDetail"));
const Jobs=lazy(()=>import("../pages/dashboard/Jobs"));
const JobDetail=lazy(()=>import("../pages/dashboard/JobDetail"));
const Calendar=lazy(()=>import("../pages/dashboard/Calendar"));
const Settings=lazy(()=>import("../pages/dashboard/Settings"));
const Team=lazy(()=>import("../pages/dashboard/Team"));
const FollowUps=lazy(()=>import("../pages/dashboard/FollowUps"));
const Messages=lazy(()=>import("../pages/dashboard/Messages"));
const Notifications=lazy(()=>import("../pages/dashboard/Notifications"));
const ManualCommunications=lazy(()=>import("../pages/dashboard/ManualCommunications"));
const AgentWorkspace=lazy(()=>import("../pages/dashboard/AgentWorkspace"));
const KendrellDedication=lazy(()=>import("../pages/dashboard/KendrellDedication"));
const Documents=lazy(()=>import("../pages/dashboard/Documents"));
const DocumentScan=lazy(()=>import("../pages/dashboard/DocumentScan"));
const CallCenter=lazy(()=>import("../pages/dashboard/CallCenter"));
const NotFound=lazy(()=>import("../pages/errors/404"));

export default function AppRouter(){return <BrowserRouter><Suspense fallback={<main style={{padding:32}}><p role="status">Loading page…</p></main>}><Routes><Route element={<AppLayout/>}>
<Route path="/" element={<HostEntry/>}/><Route path="/app" element={<AppEntry/>}/><Route path="/portal" element={<AppEntry/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/request-service" element={<RequestService/>}/><Route path="/about" element={<About/>}/><Route path="/kendrell-memorial" element={<Memorial/>}/><Route path="/memorial" element={<Memorial/>}/><Route path="/homeowners" element={<PublicInfo page="homeowners"/>}/><Route path="/contractors" element={<PublicInfo page="contractors"/>}/><Route path="/how-it-works" element={<PublicInfo page="how"/>}/><Route path="/leadscope" element={<PublicInfo page="leadscope"/>}/><Route path="/community" element={<PublicInfo page="community"/>}/><Route path="/services" element={<PublicJourney page="services"/>}/><Route path="/pricing" element={<PublicJourney page="pricing"/>}/><Route path="/trust" element={<PublicJourney page="trust"/>}/><Route path="/professionals" element={<PublicJourney page="professionals"/>}/><Route path="/partners" element={<PartnerAccess/>}/><Route path="/demo" element={<PublicJourney page="demo"/>}/><Route path="/professional-application" element={<ProfessionalApplication/>}/><Route path="/accessibility" element={<Accessibility/>}/><Route path="/privacy" element={<Legal page="privacy"/>}/><Route path="/terms" element={<Legal page="terms"/>}/><Route path="/platform-disclosure" element={<Legal page="platform"/>}/>
<Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/portal/accept" element={<AcceptInvitation/>}/><Route path="/team/accept" element={<AcceptWorkspaceInvitation/>}/>
<Route element={<ProtectedLayout/>}><Route path="/homeowner-portal" element={<HomeownerPortal/>}/><Route path="/contractor-portal" element={<ContractorPortal/>}/><Route path="/partner-portal" element={<PartnerPortal/>}/><Route path="/homeowner-portal/requests" element={<HomeownerPortalSection section="requests"/>}/><Route path="/homeowner-portal/appointments" element={<HomeownerPortalSection section="appointments"/>}/><Route path="/homeowner-portal/jobs" element={<HomeownerPortalSection section="jobs"/>}/><Route path="/homeowner-portal/documents" element={<HomeownerPortalDocuments/>}/><Route path="/homeowner-portal/profile" element={<ResidentProfile/>}/><Route path="/homeowner-portal/settings" element={<ResidentProfile/>}/><Route path="/contractor-portal/profile" element={<ContractorProfile />}/><Route path="/contractor-portal/services" element={<ContractorPortalServices/>}/><Route path="/contractor-portal/documents" element={<ContractorPortalDocuments/>}/><Route path="/messages" element={<Messages/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/academy" element={<AcademyWorkspace/>}/><Route path="/academy/paths" element={<AcademyWorkspace/>}/><Route path="/academy/practice/:moduleId" element={<AcademyWorkspace/>}/><Route path="/academy/certifications" element={<AcademyWorkspace/>}/><Route path="/academy/progress" element={<AcademyWorkspace/>}/><Route path="/academy/roleplay" element={<RoleplayKnowledgeWorkspace/>}/><Route path="/academy/library" element={<RoleplayKnowledgeWorkspace/>}/>
<Route element={<WorkspaceLayout/>}>
<Route path="/dashboard" element={<Dashboard/>}/><Route path="/work" element={<WorkHome/>}/><Route path="/work/matching" element={<EligibilityFit/>}/><Route path="/start-here" element={<StartHere/>}/><Route path="/ecosystem" element={<Ecosystem/>}/><Route path="/workflow" element={<Workflow/>}/><Route path="/automations" element={<Automations/>}/><Route path="/activity" element={<WorkspaceActivity/>}/><Route path="/partners/manage" element={<PartnerManagement/>}/>
<Route path="/network" element={<NetworkDirectory/>}/><Route path="/map" element={<ProviderMap/>}/><Route path="/network/map" element={<ProviderMap/>}/><Route path="/profiles" element={<NetworkDirectory/>}/><Route path="/providers" element={<NetworkDirectory/>}/><Route path="/providers/:providerId" element={<LaunchSurface page="providerDetail"/>}/><Route path="/matching" element={<CommunityMatchDeck/>}/><Route path="/community/swipe" element={<CommunityMatchDeck/>}/><Route path="/network/service-areas" element={<LaunchSurface page="serviceAreas"/>}/><Route path="/network/availability" element={<LaunchSurface page="availability"/>}/><Route path="/network/eligibility" element={<EligibilityFit/>}/><Route path="/network/saved" element={<NetworkDirectory savedOnly/>}/>
<Route path="/community-hub" element={<CommunityHub/>}/><Route path="/community/discover" element={<CommunityDiscover/>}/><Route path="/community/messages" element={<CommunityMessages/>}/><Route path="/community/challenges" element={<CommunityChallenges/>}/><Route path="/community/academy" element={<CommunityAcademy/>}/><Route path="/community/discussions" element={<LaunchSurface page="discussions"/>}/><Route path="/community/reviews" element={<LaunchSurface page="reviews"/>}/><Route path="/community/referrals" element={<LaunchSurface page="referrals"/>}/><Route path="/community/events" element={<LaunchSurface page="events"/>}/><Route path="/community/moderation" element={<LaunchSurface page="moderation"/>}/><Route path="/community/groups" element={<LaunchSurface page="groups"/>}/>
<Route path="/resources" element={<ResourcesWorkspace/>}/><Route path="/resources/materials" element={<ResourcesWorkspace/>}/><Route path="/resources/suppliers" element={<ResourcesWorkspace/>}/><Route path="/resources/suppliers/map" element={<ResourcesWorkspace/>}/><Route path="/help" element={<OperationalGuide page="help"/>}/><Route path="/tutorials" element={<OperationalGuide page="tutorials"/>}/><Route path="/rules" element={<OperationalGuide page="rules"/>}/><Route path="/resources/forms" element={<FormsChecklists/>}/><Route path="/profile" element={<MyProfile/>}/><Route path="/homeowner-portal/properties" element={<PropertyIntelligence/>}/><Route path="/homeowner-portal/matches" element={<EligibilityFit/>}/><Route path="/contractor-portal/team" element={<LaunchSurface page="team"/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/hq/approvals" element={<LaunchSurface page="approvals"/>}/><Route path="/hq/system-health" element={<LaunchSurface page="systemHealth"/>}/>
<Route path="/settings/billing" element={<BillingWorkspace/>}/><Route path="/leads" element={<Leads/>}/><Route path="/leads/:leadId" element={<LeadDetail/>}/><Route path="/estimator" element={<Estimator/>}/><Route path="/jobs" element={<Jobs/>}/><Route path="/jobs/:jobId" element={<JobDetail/>}/><Route path="/calendar" element={<Calendar/>}/><Route path="/settings" element={<Settings/>}/><Route path="/team" element={<Team/>}/><Route path="/follow-ups" element={<FollowUps/>}/><Route path="/manual-communications" element={<ManualCommunications/>}/><Route path="/documents" element={<Documents/>}/><Route path="/documents/scan" element={<DocumentScan/>}/><Route path="/call-center" element={<CallCenter/>}/><Route path="/hq/dedication" element={<KendrellDedication/>}/><Route path="/hq" element={<AgentWorkspace agentId="kendrell"/>}/><Route path="/operations" element={<AgentWorkspace agentId="dion"/>}/><Route path="/customer-experience" element={<AgentWorkspace agentId="diamond"/>}/>
</Route></Route><Route path="*" element={<NotFound/>}/></Route></Routes></Suspense></BrowserRouter>}
