import { Link } from "react-router-dom";

export default function PartnerAccess(){
  return <main style={{width:"min(920px,calc(100% - 32px))",margin:"48px auto",display:"grid",gap:20}}>
    <header style={{padding:"clamp(24px,6vw,56px)",borderRadius:24,background:"linear-gradient(135deg,#081426,#12365f)",color:"#f8fafc"}}>
      <p style={{fontWeight:900,letterSpacing:".08em"}}>HOMELEAD CONNECT PARTNERS</p>
      <h1>Refer people without entering the contractor workflow.</h1>
      <p>Approved businesses, community organizations, and referral sources can use a dedicated partner account to record resident or professional referrals, check their current status, and submit another referral.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><Link to="/login">Sign in</Link><Link to="/contact">Ask about partner access</Link></div>
    </header>
    <section><h2>How partner access works</h2><ol><li>Contact HLC and identify the business or referral relationship.</li><li>HLC approves and links a signed-in account to the partner source.</li><li>The partner portal records referral attribution and status without exposing internal CRM records.</li><li>Partners can return to submit another referral when needed.</li></ol></section>
    <section><h2>Already approved?</h2><p>Sign in with the account HLC linked to your partner source, then open the Partner Portal.</p><Link to="/partner-portal">Open Partner Portal</Link></section>
  </main>;
}
