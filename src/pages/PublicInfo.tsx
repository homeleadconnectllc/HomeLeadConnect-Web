import { Link } from "react-router-dom";

const content = {
  about: {
    title: "About HomeLead Connect",
    body: "HomeLead Connect provides software for organizing service requests, estimates, jobs, contractor assignments, and appointments.",
  },
  homeowners: {
    title: "For homeowners",
    body: "Submit a service request for review. A submitted request does not guarantee contractor assignment, pricing, or an appointment.",
  },
  contractors: {
    title: "For contractors",
    body: "HomeLead Connect supports contractor records, job offers, assignment history, and scheduling for participating businesses. A public contractor portal is not yet available.",
  },
  how: {
    title: "How it works",
    body: "The current service workflow is Request → Estimate → Contractor Assignment → Schedule → Work. Each step is recorded separately; submitting a request does not skip later review or acceptance steps.",
  },
} as const;

export default function PublicInfo({ page }: { page: keyof typeof content }) {
  const item = content[page];
  return <main style={{ width: "min(760px, calc(100% - 32px))", margin: "64px auto", lineHeight: 1.6 }}>
    <h1>{item.title}</h1>
    <p>{item.body}</p>
    {page === "homeowners" && <Link to="/request-service">Request service</Link>}
    {page === "contractors" && <p>Contractor account access and self-service acceptance will appear only after the contractor identity policy is implemented.</p>}
  </main>;
}
