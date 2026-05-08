import { Link } from "react-router-dom";

export default function Header() {

  return (

    <header className="header">

      <div className="header-content">

        <h1 className="logo">
          Fermentação
        </h1>

        <nav className="nav">

          <Link to="/">
            Dashboard
          </Link>

          <Link to="/tanks">
            Tanques
          </Link>

          <Link to="/admin">
            Admin
          </Link>

        </nav>

      </div>

    </header>

  );
}