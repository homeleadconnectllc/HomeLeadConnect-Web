import { Link } from "react-router-dom";

export default function NotFound() {
  return <main style={{ width: "min(700px, calc(100% - 32px))", margin: "80px auto", textAlign: "center" }}>
    <h1>Page not found</h1>
    <p>The page you requested does not exist.</p>
    <Link to="/">Return home</Link>
  </main>;
}
