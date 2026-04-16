// import "./dashboard.css";

export default function DashboardHeader({ username }) {
  return (
    <div className="dashboard-greeting">
      <h1>
        Good day, <span className="gold-text">{username}</span>
      </h1>
      <p>Here's how you're doing today.</p>
    </div>
  );
}
