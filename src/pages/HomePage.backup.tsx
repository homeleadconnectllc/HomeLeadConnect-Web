import Footer from "../components/Footer";

const features = [
  {
    title: "CRM Platform",
    text: "Manage customers, leads, jobs, and growth from one command center."
  },
  {
    title: "AI Automation",
    text: "Automate follow-ups, communication, and business workflows."
  },
  {
    title: "Contractor Network",
    text: "Connect homeowners and service professionals efficiently."
  },
  {
    title: "Websites & Leads",
    text: "Generate leads with integrated digital tools."
  }
];

export default function HomePage() {
  return (
    <>
      <main
        style={{
          background:
            "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
          color:"#111827",
          minHeight:"100vh",
          padding:"40px 24px"
        }}
      >

        <section
          style={{
            maxWidth:"1200px",
            margin:"0 auto",
            textAlign:"center",
            padding:"80px 0"
          }}
        >

          <img
            src="/hlc-icon.jpeg"
            alt="HomeLead Connect"
            style={{
              width:120,
              height:120,
              objectFit:"contain",
              background:"#fff",
              borderRadius:24,
              marginBottom:35
            }}
          />

          <h1
            style={{
              fontSize:"clamp(48px,7vw,84px)",
              lineHeight:1,
              letterSpacing:"-3px",
              margin:"0 auto 30px",
              maxWidth:900,
              fontWeight:900
            }}
          >
            The Future Of<br/>Home Services
          </h1>

          <p
            style={{
              maxWidth:750,
              margin:"0 auto 45px",
              fontSize:22,
              lineHeight:1.6,
              color:"#475569"
            }}
          >
            One connected platform for CRM, leads, websites, AI automation, contractors, and business growth.
          </p>


          <div
            style={{
              display:"flex",
              justifyContent:"center",
              gap:18,
              flexWrap:"wrap"
            }}
          >

            <button
              style={{
                background:"#111827",
                color:"#fff",
                border:0,
                borderRadius:14,
                padding:"18px 36px",
                fontSize:18,
                fontWeight:800
              }}
            >
              Launch Platform
            </button>


            <button
              style={{
                background:"#fff",
                color:"#111827",
                border:"1px solid #cbd5e1",
                borderRadius:14,
                padding:"18px 36px",
                fontSize:18,
                fontWeight:800
              }}
            >
              View Features
            </button>

          </div>

        </section>



        <section
          style={{
            maxWidth:1100,
            margin:"0 auto",
            background:"#ffffff",
            borderRadius:30,
            padding:35,
            boxShadow:"0 30px 80px rgba(0,0,0,.08)",
            border:"1px solid #e5e7eb"
          }}
        >

          <div
            style={{
              background:"#0f172a",
              borderRadius:22,
              minHeight:360,
              padding:35,
              color:"#fff",
              display:"flex",
              flexDirection:"column",
              justifyContent:"center"
            }}
          >

            <h2
              style={{
                fontSize:40,
                marginBottom:15
              }}
            >
              HomeLead Command Center
            </h2>

            <p
              style={{
                fontSize:20,
                color:"#cbd5e1",
                maxWidth:650
              }}
            >
              Your CRM dashboard, customer pipeline, contractor
              management, and business intelligence in one place.
            </p>


            <div
              style={{
                display:"grid",
                gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",
                gap:18,
                marginTop:35
              }}
            >

              {["Leads","Customers","Jobs","Revenue"].map(item=>(
                <div
                  key={item}
                  style={{
                    background:"rgba(255,255,255,.1)",
                    padding:20,
                    borderRadius:15
                  }}
                >
                  <strong>{item}</strong>
                  <br/>
                  Active
                </div>
              ))}

            </div>

          </div>

        </section>



        <section
          style={{
            maxWidth:1100,
            margin:"80px auto",
            display:"grid",
            gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
            gap:25
          }}
        >

        {features.map(feature=>(
          <div
            key={feature.title}
            style={{
              background:"#fff",
              border:"1px solid #e2e8f0",
              borderRadius:22,
              padding:30,
              boxShadow:"0 15px 35px rgba(0,0,0,.05)"
            }}
          >
            <h3>{feature.title}</h3>
            <p style={{color:"#64748b"}}>
              {feature.text}
            </p>
          </div>
        ))}

        </section>

      </main>

      <Footer/>
    </>
  );
}
