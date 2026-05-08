import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="navbar">
      <h2> DashBoard </h2>

      <div className="nav-links">
        <Link to="/cilindros">Cilindros</Link>
        <Link to="/">Dashboard</Link>
        <Link to="/admin">Admin</Link>
      </div>
    </nav>
  );
}