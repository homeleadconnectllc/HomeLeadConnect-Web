import Navbar from "./components/Navbar";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Navbar />

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "70px 40px",
          textAlign: "center",
        }}
      >
        <img
          src="/hlc-trans-logo.jpeg"
          alt="HomeLead Connect"
          style={{
            width: "420px",
            maxWidth: "90%",
            height: "auto",
            objectFit: "contain",
            marginBottom: "40px",
          }}
        />

        <h1
          style={{
            fontSize: "52px",
            margin: "0 0 20px",
          }}
        >
          HomeLead Connect CRM
        </h1>

        <p
          style={{
            maxWidth: "700px",
            fontSize: "22px",
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          The all-in-one platform connecting homeowners, contractors,
          leads, websites, and AI-powered business tools.
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "50px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button>Customers</button>
          <button>Leads</button>
          <button>Contractors</button>
          <button>Dashboard</button>
        </div>
      </main>
    </div>
  );
}

export default App;
