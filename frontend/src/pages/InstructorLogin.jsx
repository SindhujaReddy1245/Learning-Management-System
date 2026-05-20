import React, { useState, useEffect } from "react";
import {
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { ArrowLeft, LogIn, Sparkles, Zap, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebaseConfig";

const InstructorLogin = ({ setUser, showToast }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthErrorMessage = (err) => {
    if (err.code === "auth/operation-not-allowed") {
      return "Google sign-in is not enabled in Firebase. Enable Google under Authentication > Sign-in method.";
    }
    if (err.code === "auth/unauthorized-domain") {
      return "This domain is not authorized in Firebase. Add localhost under Authentication > Settings > Authorized domains.";
    }
    if (err.code === "permission-denied") {
      return "Login worked, but Firestore blocked reading your role. Check Firestore rules for the users collection.";
    }
    if (err.code === "auth/popup-closed-by-user") {
      return "Google popup was closed before login finished.";
    }
    return `${err.code || "auth/error"}: ${err.message || "Google login failed."}`;
  };

  const loadRoleAndNavigate = async (uid, userEmail) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === "instructor") {
          setUser({ uid, email: docSnap.data().email, role: "instructor" });
          showToast("Logged in successfully as Instructor!", "success");
          navigate("/instructor-dashboard");
        } else {
          setError("This is the Instructor Login Portal. Students, please use the Student Portal.");
        }
        return;
      }

      // If document with UID doesn't exist, search Firestore by Email to auto-merge credentials!
      if (userEmail) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail.trim().toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const matchedDoc = querySnapshot.docs[0];
          const matchedData = matchedDoc.data();
          const role = matchedData.role;

          if (role === "instructor") {
            // Write a new document for this new UID so they match and load instantly next time
            await setDoc(doc(db, "users", uid), {
              uid: uid,
              name: matchedData.name,
              email: matchedData.email,
              role: matchedData.role,
            });

            setUser({ uid, email: matchedData.email, role: "instructor" });
            showToast("Logged in successfully (Account automatically linked)!", "success");
            navigate("/instructor-dashboard");
            return;
          } else {
            setError("This is the Instructor Login Portal. Students, please use the Student Portal.");
            return;
          }
        }
      }

      // Fallback check before register redirect
      const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
      const localUser = localUsers.find((u) => u.uid === uid || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
      if (localUser) {
        handleLocalRoleCheck(localUser);
        return;
      }
      navigate("/register");
    } catch (err) {
      console.warn("Firestore database error:", err);
      const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
      const localUser = localUsers.find((u) => u.uid === uid || (userEmail && u.email.toLowerCase() === userEmail.toLowerCase()));
      if (localUser) {
        handleLocalRoleCheck(localUser);
      } else {
        setError(`Database connection error (${err.code || "unknown"}): ${err.message || err}. Please ensure your Firestore Database is set to "Start in test mode" in your console.`);
      }
    }
  };

  const handleLocalRoleCheck = (localUser) => {
    if (localUser.role === "instructor") {
      setUser({ uid: localUser.uid, email: localUser.email, role: "instructor" });
      showToast("Logged in successfully (Offline Local Cache)!", "success");
      navigate("/instructor-dashboard");
    } else {
      setError("This is the Instructor Login Portal. Students, please use the Student Portal.");
    }
  };

  useEffect(() => {
    let ignore = false;

    async function finishRedirectLogin() {
      try {
        const result = await getRedirectResult(auth);
        if (!ignore && result?.user) {
          await loadRoleAndNavigate(result.user.uid, result.user.email);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError(getAuthErrorMessage(err));
      }
    }

    finishRedirectLogin();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const emailValue = email.trim().toLowerCase();

    try {
      const result = await signInWithEmailAndPassword(auth, emailValue, password);
      await loadRoleAndNavigate(result.user.uid, emailValue);
    } catch (err) {
      console.error(err);
      setError(`${err.code || "auth/error"}: Check your email and password, then try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      await loadRoleAndNavigate(result.user.uid, result.user.email);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
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
        <section className="login-card auth-card" aria-labelledby="login-title">
          <div className="login-logo instructor-portal-logo" style={{ color: "var(--orange)" }}>
            <span className="brand-icon">
              <Palette size={22} />
            </span>
            <span>Instructor workstation</span>
          </div>

          <h2 id="login-title">Instructor Login</h2>
          <p>Access your workstation to build courses, quizzes, and track learners.</p>

          {error && (
            <div className="login-error-alert">
              <Sparkles size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Instructor Email Address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="instructor@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>

            <button className="submit-btn instructor-theme-btn" type="submit" disabled={loading} style={{ background: "var(--orange)", color: "white" }}>
              <LogIn size={17} />
              <span>{loading ? "Logging in..." : "Login to Workstation"}</span>
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="submit-btn google-auth-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
            Login with Google
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an Instructor account</Link>
          </p>

          <p className="auth-switch" style={{ fontSize: "0.82rem", opacity: 0.85 }}>
            Are you a Student? <Link to="/student-login" style={{ color: "var(--orange)" }}>Student Portal</Link>
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

export default InstructorLogin;
