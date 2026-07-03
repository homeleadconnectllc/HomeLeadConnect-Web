import "./App.css";

function App() {
  return (
    <>
      <nav className="navbar">
        <h2>🏠 HomeLead Connect</h2>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">Contractors</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      <section className="hero">
        <h1>One Platform. Every Home Service.</h1>

        <p>
          Connecting homeowners, contractors,
          subcontractors and businesses.
        </p>

        <div className="buttons">
          <button>Get Started</button>
          <button className="secondary">Sign In</button>
        </div>
      </section>

      <section className="cards">
        <div className="card">
          <h3>🏡 Homeowners</h3>
          <p>Find trusted professionals.</p>
        </div>

        <div className="card">
          <h3>🛠 Contractors</h3>
          <p>Grow your business.</p>
        </div>

        <div className="card">
          <h3>🏢 Businesses</h3>
          <p>Manage properties and projects.</p>
        </div>

        <div className="card">
          <h3>👷 Subcontractors</h3>
          <p>Receive jobs instantly.</p>
        </div>
      </section>
    </>
  );
}

export default App;
