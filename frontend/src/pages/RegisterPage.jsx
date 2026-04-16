import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  CircleDot,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import WaveCanvas from "../components/WaveCanvas";
import "./AuthPage.css";
import { GoogleIcon } from "../utils/GoogleIcon";
import { useGoogleLogin } from "@react-oauth/google";

const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [passHint, setPassHint] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email";
    if (!passwordRules.every((r) => r.test(form.password)))
      e.password = "Password does not meet requirements";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleChange = (field) => (ev) => {
    setForm((p) => ({ ...p, [field]: ev.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    setServerErr("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setServerErr(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (response) => {
      try {
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

  const handleGoogle = () => {
    googleLogin();
  };

  return (
    <div className="page">
      <WaveCanvas />

      <div className="card cardTall">
        <div className="logo">
          <CircleDot size={28} strokeWidth={1.5} />
          <span>habit circle</span>
        </div>

        <div className="header">
          <h1 className="title">Create account</h1>
          <p className="subtitle">Start building better habits together</p>
        </div>

        {serverErr && (
          <div className="serverError">
            <span>{serverErr}</span>
          </div>
        )}

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label">Username</label>
            <div className={`inputWrap ${errors.username ? "inputError" : ""}`}>
              <User size={16} className="inputIcon" />
              <input
                type="text"
                placeholder="yourname"
                value={form.username}
                onChange={handleChange("username")}
                className="input"
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <span className="errorMsg">{errors.username}</span>
            )}
          </div>

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
                onFocus={() => setPassHint(true)}
                className="input"
                autoComplete="new-password"
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

            {passHint && form.password && (
              <div className="passRules">
                {passwordRules.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <div
                      key={rule.label}
                      className={`ruleRow ${ok ? "ruleOk" : "ruleFail"}`}
                    >
                      {ok ? <Check size={11} /> : <X size={11} />}
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="field">
            <label className="label">Confirm password</label>
            <div className={`inputWrap ${errors.confirm ? "inputError" : ""}`}>
              <Lock size={16} className="inputIcon" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange("confirm")}
                className="input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowConfirm((p) => !p)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirm && (
              <span className="errorMsg">{errors.confirm}</span>
            )}
          </div>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create account</span>
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
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
