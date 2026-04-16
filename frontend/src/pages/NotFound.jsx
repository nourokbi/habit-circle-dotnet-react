import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./notfound.css";
import WaveCanvas from "../components/WaveCanvas";

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="page nfPage">
      <WaveCanvas />
      <div className="card cardTall nfCard">
        {/* 404 Title */}
        <div className="nfHeader">
          <h1 className="nfCode">404</h1>
          <p className="nfTitle">Page not found</p>
        </div>

        {/* Description */}
        <p className="nfText">
          The page you’re looking for doesn’t exist, was removed, or the URL is
          incorrect.
        </p>

        {/* Actions */}
        <div className="nfActions">
          <Link to={user ? "/" : "/login"} className="submitBtn">
            {user ? "Go to Home" : "Go to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
