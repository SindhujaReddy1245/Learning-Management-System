import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ArrowLeft, Sparkles, UserPlus, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebaseConfig";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthErrorMessage = (err) => {
    if (err.code === "auth/operation-not-allowed") {
      return "This sign-in method is not enabled in Firebase. Enable it under Authentication > Sign-in method.";
    }
    if (err.code === "auth/unauthorized-domain") {
      return "This domain is not authorized in Firebase. Add localhost under Authentication > Settings > Authorized domains.";
    }
    if (err.code === "permission-denied") {
      return "Authentication worked, but Firestore blocked saving your role. Check Firestore rules for the users collection.";
    }
    if (err.code === "auth/email-already-in-use") {
      return "This email is already registered. Go to login instead.";
    }
    if (err.code === "auth/popup-closed-by-user") {
      return "Google popup was closed before registration finished.";
    }
    return `${err.code || "auth/error"}: ${err.message || "Registration failed."}`;
  };

  const dashboardPath = (selectedRole) =>
    selectedRole === "student" ? "/student-dashboard" : "/instructor-dashboard";

  const saveUserProfile = async (user, selectedRole, displayName) => {
    const profile = {
      uid: user.uid,
      name: displayName || user.displayName || "LearnFlow User",
      email: user.email,
      role: selectedRole,
    };

    // Save to local storage cache so it always works offline
    const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
    if (!localUsers.some((u) => u.uid === user.uid)) {
      localUsers.push(profile);
      localStorage.setItem("local_users", JSON.stringify(localUsers));
    }

    try {
      await setDoc(doc(db, "users", user.uid), profile);
    } catch (err) {
      console.warn("Firestore offline, profile saved locally:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function finishRedirectRegister() {
      try {
        const result = await getRedirectResult(auth);
        const pendingRole = localStorage.getItem("pending_google_role") || role;
        if (!ignore && result?.user) {
          await saveUserProfile(result.user, pendingRole);
          localStorage.removeItem("pending_google_role");
          navigate(dashboardPath(pendingRole));
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError(getAuthErrorMessage(err));
      }
    }

    finishRedirectRegister();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEmailRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await saveUserProfile(result.user, role, name.trim());
      navigate(dashboardPath(role));
    } catch (err) {
      console.error(err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserProfile(result.user, role);
      navigate(dashboardPath(role));
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        localStorage.setItem("pending_google_role", role);
        await signInWithRedirect(auth, provider);
        return;
      }
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell auth-page-shell">
      <div className="lms-login-container auth-page-container">
        <section className="login-card auth-card" aria-labelledby="register-title">
          <div className="login-logo">
            <span className="brand-icon">
              <Zap size={20} fill="currentColor" />
            </span>
            <span>LearnFlow LMS</span>
          </div>

          <h2 id="register-title">Create Account</h2>
          <p>Choose a role, then register with email/password or Google.</p>

          {error && (
            <div className="login-error-alert">
              <Sparkles size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                className="form-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                className="form-input"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-role">Account Role</label>
              <select
                id="register-role"
                className="form-select"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              <UserPlus size={17} />
              <span>{loading ? "Creating account..." : "Register"}</span>
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="submit-btn google-auth-btn" type="button" onClick={handleGoogleRegister} disabled={loading}>
            Register with Google
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Login here</Link>
          </p>

          <Link className="back-link" to="/">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Register;
