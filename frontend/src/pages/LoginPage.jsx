import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, CircleDot } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import WaveCanvas from "../components/WaveCanvas";
import "./AuthPage.css";
import { GoogleIcon } from "../utils/GoogleIcon";
import { useGoogleLogin } from "@react-oauth/google";

// Call googleLogin() on button click instead of the alert

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (response) => {
      try {
        // response.access_token is what you send to your backend
        await loginWithGoogle(response.access_token);
        navigate("/dashboard");
      } catch (err) {
        setServerErr(
          err.response?.data?.message || "Google sign-in failed. Try again.",
        );
      }
    },
    onError: () => {
      setServerErr("Google sign-in was cancelled or failed.");
    },
  });

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (field) => (ev) => {
    setForm((p) => ({ ...p, [field]: ev.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    setServerErr("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    console.log("Submitting form with data:", form);
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await login(form);
      console.log("Login successful, navigating to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      setServerErr(err.response?.data?.message || "Invalid email or password.");
    } finally {
      console.log("Login attempt finished");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    googleLogin();
  };

  return (
    <div className="page">
      <WaveCanvas />

      <div className="card">
        <div className="logo">
          <CircleDot size={28} strokeWidth={1.5} />
          <span>habit circle</span>
        </div>

        <div className="header">
          <h1 className="title">Welcome back</h1>
          <p className="subtitle">Sign in to your circles</p>
        </div>

        {serverErr && (
          <div className="serverError">
            <span>{serverErr}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label">Email</label>
            <div className={`inputWrap ${errors.email ? "inputError" : ""}`}>
              <Mail size={16} className="inputIcon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className="input"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="errorMsg">{errors.email}</span>}
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className={`inputWrap ${errors.password ? "inputError" : ""}`}>
              <Lock size={16} className="inputIcon" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                className="input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowPass((p) => !p)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span className="errorMsg">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="googleBtn" onClick={handleGoogle} type="button">
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <p className="switchText">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
