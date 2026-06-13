import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <NavLink to="/dashboard" className="logo">EH Brewing</NavLink>

        <nav className="nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/tanks">Tanques</NavLink>
          <NavLink to="/batches">Lotes</NavLink>
          <NavLink to="/test-bench">Testes</NavLink>
        </nav>
      </div>
    </header>
  );
}
