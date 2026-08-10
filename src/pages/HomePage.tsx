import Footer from "../components/Footer";

const features = [
  ["CRM Platform", "Manage leads, estimates, jobs, contractor assignments, and appointments."],
  ["LeadScope", "Create itemized estimates with clear quantities, costs, markup, and totals."],
  ["Contractor Operations", "Record contractor offers, acceptance, assignment history, and scheduled work."],
  ["Workspace Security", "Keep operational records scoped to an authenticated business workspace."]
];

export default function HomePage() {
  return (
    <>
      <main
        style={{
          minHeight:"100vh",
          padding:"40px 24px",
          background:
          "linear-gradient(135deg,#ffffff 0%,#eff6ff 45%,#dbeafe 100%)",
          color:"#0f172a"
        }}
      >

        <section
          style={{
            maxWidth:1200,
            margin:"0 auto",
            textAlign:"center",
            padding:"80px 0"
          }}
        >

          <div
            style={{
              display:"inline-flex",
              padding:20,
              background:"#fff",
              borderRadius:32,
              boxShadow:"0 25px 80px rgba(0,0,0,.12)"
            }}
          >
            <img
              src="/hlc-logo-final.png"
              alt="HomeLead Connect"
              style={{
                width:120,
                height:120,
                objectFit:"contain",
                borderRadius:24
              }}
            />
          </div>

          <h1
            style={{
              fontSize:"clamp(50px,8vw,92px)",
              lineHeight:.95,
              letterSpacing:"-4px",
              fontWeight:900,
              margin:"45px auto 25px"
            }}
          >
            The Future Of
            <br/>
            Home Services
          </h1>

          <p
            style={{
              maxWidth:760,
              margin:"0 auto",
              fontSize:22,
              color:"#475569",
              lineHeight:1.6
            }}
          >
            One connected platform for CRM, leads, websites,
            AI automation, contractors, and business growth.
          </p>

        </section>


        <section
          style={{
            maxWidth:1100,
            margin:"0 auto",
            background:"#0f172a",
            borderRadius:35,
            padding:45,
            color:"#fff",
            boxShadow:"0 40px 100px rgba(15,23,42,.25)"
          }}
        >

          <h2 style={{fontSize:42}}>
            HomeLead Command Center
          </h2>

          <p style={{color:"#cbd5e1",fontSize:20}}>
            One place to move service work from lead to scheduled job.
          </p>


          <div
            style={{
              marginTop:35,
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
              gap:20
            }}
          >

          {["Leads", "Estimates", "Jobs", "Schedule"].map(item=>(
            <div
              key={item}
              style={{
                padding:25,
                borderRadius:20,
                background:"rgba(255,255,255,.12)"
              }}
            >
              <strong>{item}</strong>
              <br/>
              <span style={{color:"#93c5fd"}}>Workspace tools</span>
            </div>
          ))}

          </div>

        </section>


        <section
          style={{
            maxWidth:1100,
            margin:"80px auto",
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",
            gap:24
          }}
        >

        {features.map(([title,text])=>(
          <div
            key={title}
            style={{
              background:"#fff",
              borderRadius:24,
              padding:30,
              boxShadow:"0 20px 50px rgba(0,0,0,.08)"
            }}
          >
            <h3>{title}</h3>
            <p style={{color:"#64748b"}}>
              {text}
            </p>
          </div>
        ))}

        </section>

  

        <section
          style={{
            maxWidth:1050,
            margin:"40px auto 0",
            background:"rgba(255,255,255,.85)",
            backdropFilter:"blur(20px)",
            borderRadius:32,
            padding:30,
            boxShadow:"0 40px 100px rgba(15,23,42,.18)",
            border:"1px solid rgba(255,255,255,.8)"
          }}
        >

          <div
            style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              marginBottom:25,
              flexWrap:"wrap",
              gap:15
            }}
          >
            <h2 style={{margin:0}}>
              Product workflow
            </h2>

            <span
              style={{
                background:"#dcfce7",
                color:"#166534",
                padding:"8px 16px",
                borderRadius:999,
                fontWeight:800
              }}
            >
              Available after CRM login
            </span>
          </div>


          <div
            style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
              gap:20
            }}
          >

            {[
              ["Request", "Capture a service need"],
              ["Estimate", "Prepare itemized scope and pricing"],
              ["Contractor", "Offer and record acceptance"],
              ["Schedule", "Create a job appointment"]
            ].map(card=>(
              <div
                className="hlc-card"
                key={card[0]}
                style={{
                  background:"#f8fafc",
                  borderRadius:20,
                  padding:25
                }}
              >
                <strong>
                  {card[0]}
                </strong>

                <div
                  style={{
                    marginTop:12,
                    fontSize:24,
                    fontWeight:900,
                    color:"#2563eb"
                  }}
                >
                  {card[1]}
                </div>

              </div>
            ))}

          </div>

        </section>


    </main>

      <Footer/>
    </>
  );
}
