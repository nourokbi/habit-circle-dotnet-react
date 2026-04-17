import { useEffect, useRef, useState } from "react";
import {
  CircleDot,
  Sun,
  Moon,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

import "./navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function onMouseDown(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const initial = (user?.username || "U").slice(0, 1).toUpperCase();

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
          <button
            className="navbar-icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            type="button"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div className="navbar-profile" ref={menuRef}>
              <button
                type="button"
                className="navbar-profile-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Profile"
              >
                <span className="navbar-avatar" aria-hidden="true">
                  {initial}
                </span>
                <span className="navbar-username">{user.username}</span>
                <ChevronDown
                  size={14}
                  className={`navbar-chevron ${menuOpen ? "open" : ""}`}
                />
              </button>

              {menuOpen ? (
                <div className="navbar-dropdown" role="menu">
                  <Link
                    to="/settings"
                    role="menuitem"
                    className="navbar-menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    className="navbar-menu-item navbar-menu-item-signout"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
