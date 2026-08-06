import AppLayout from "../../components/layout/AppLayout";
import StatCard from "../../components/ui/StatCard";
import ActionButton from "../../components/ui/ActionButton";

export default function Dashboard(){

return (

<AppLayout>

<h1 style={{
fontSize:"42px",
marginBottom:"10px"
}}>
HomeLead Connect
</h1>

<p style={{
color:"#94a3b8",
fontSize:"18px"
}}>
One platform connecting homeowners, contractors, subcontractors, and businesses.
</p>


<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginTop:"35px"
}}>

<StatCard
title="New Leads"
value="24"
description="Incoming service requests"
/>

<StatCard
title="Active Jobs"
value="12"
description="Projects in progress"
/>

<StatCard
title="Messages"
value="8"
description="Customer conversations"
/>

<StatCard
title="Appointments"
value="5"
description="Scheduled events"
/>

</div>


<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
gap:"20px",
marginTop:"35px"
}}>


<div style={{
background:"#111827",
padding:"25px",
borderRadius:"18px",
border:"1px solid #263244"
}}>

<h2>Lead Pipeline</h2>

<p>🟦 New homeowner requests</p>
<p>🟨 Contractor matching</p>
<p>🟩 Job completion tracking</p>

</div>


<div style={{
background:"#111827",
padding:"25px",
borderRadius:"18px",
border:"1px solid #263244"
}}>

<h2>Quick Actions</h2>

<ActionButton>
Create Lead
</ActionButton>

<br/><br/>

<ActionButton>
Schedule Job
</ActionButton>

</div>


</div>


</AppLayout>

)

}
