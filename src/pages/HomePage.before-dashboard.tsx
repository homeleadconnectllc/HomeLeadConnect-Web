import Footer from "../components/Footer";

const features = [
  {
    title: "CRM Platform",
    text: "Manage leads, customers, jobs, and revenue from one connected command center."
  },
  {
    title: "AI Automation",
    text: "Automate follow-ups, workflows, and customer communication."
  },
  {
    title: "Contractor Network",
    text: "Connect homeowners with trusted service professionals."
  },
  {
    title: "Growth Engine",
    text: "Websites, leads, analytics, and tools built into one ecosystem."
  }
];

export default function HomePage() {
  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top,#dbeafe 0%,#ffffff 45%,#f8fafc 100%)",
          color: "#0f172a",
          padding: "40px 24px"
        }}
      >
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            textAlign: "center",
            padding: "90px 0 50px"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: "#fff",
              padding: 18,
              borderRadius: 30,
              boxShadow: "0 25px 70px rgba(15,23,42,.12)"
            }}
          >
            <img
              src="/logo.png"
              alt="HomeLead Connect"
              style={{
                width: 110,
                height: 110,
                objectFit: "contain"
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(52px,8vw,96px)",
              lineHeight: .95,
              letterSpacing: "-4px",
              fontWeight: 900,
              margin: "45px auto 25px",
              maxWidth: 950
            }}
          >
            The Future Of
            <br />
            Home Services
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: "0 auto",
              fontSize: 22,
              lineHeight: 1.6,
              color: "#475569"
            }}
          >
            One connected platform for CRM, leads, websites, AI automation,
            contractors, and business growth.
          </p>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              justifyContent: "center",
              gap: 18,
              flexWrap: "wrap"
            }}
          >
            <button
              style={{
                background: "#2563eb",
                color: "white",
                border: 0,
                borderRadius: 16,
                padding: "18px 38px",
                fontSize: 18,
                fontWeight: 800
              }}
            >
              Launch Platform
            </button>

            <button
              style={{
                background: "white",
                border: "1px solid #cbd5e1",
                borderRadius: 16,
                padding: "18px 38px",
                fontSize: 18,
                fontWeight: 800
              }}
            >
              Explore Features
            </button>
          </div>
        </section>

        <section
          style={{
            maxWidth: 1100,
            margin: "30px auto",
            background: "#0f172a",
            borderRadius: 32,
            padding: 35,
            color: "white",
            boxShadow: "0 40px 100px rgba(15,23,42,.25)"
          }}
        >
          <h2 style={{fontSize:42}}>
            HomeLead Command Center
          </h2>

          <p
            style={{
              color:"#cbd5e1",
              fontSize:20
            }}
          >
            Your complete business operating system.
          </p>

          <div
            style={{
              marginTop:35,
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
              gap:20
            }}
          >
            {["Leads","Customers","Jobs","Revenue"].map(item => (
              <div
                key={item}
                style={{
                  background:"rgba(255,255,255,.12)",
                  borderRadius:18,
                  padding:25
                }}
              >
                <strong>{item}</strong>
                <div style={{color:"#93c5fd"}}>
                  Active
                </div>
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
          {features.map(feature => (
            <div
              key={feature.title}
              style={{
                background:"#fff",
                borderRadius:24,
                padding:30,
                boxShadow:"0 20px 50px rgba(15,23,42,.08)"
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

      <Footer />
    </>
  );
}
