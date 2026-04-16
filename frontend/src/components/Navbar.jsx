import { CircleDot, Sun, Moon, LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./navbar.css";
import { useTheme } from "../hooks/useTheme";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo">
            <CircleDot size={20} strokeWidth={1.5} />
            <span>habit circle</span>
          </div>
        </Link>

        <div className="navbar-right">
          <div className="navbar-user">
            <User size={14} />
            <span>{user?.username}</span>
          </div>

          <button
            className="navbar-icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="navbar-icon-btn" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
}
