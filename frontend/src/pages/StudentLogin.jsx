import React, { useState, useEffect } from "react";
import {
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { ArrowLeft, LogIn, Sparkles, Zap, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebaseConfig";
import { loginInvitedStudent } from "../api";

const StudentLogin = ({ setUser, showToast }) => {
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
        if (role === "student") {
          setUser({ uid, name: docSnap.data().name, email: docSnap.data().email, role: "student" });
          showToast("Logged in successfully as Student!", "success");
          navigate("/student-dashboard");
        } else {
          setError("This is the Student Login Portal. Instructors, please use the Instructor Portal.");
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

          if (role === "student") {
            // Write a new document for this new UID so they match and load instantly next time
            await setDoc(doc(db, "users", uid), {
              uid: uid,
              name: matchedData.name,
              email: matchedData.email,
              role: matchedData.role,
            });

            setUser({ uid, name: matchedData.name, email: matchedData.email, role: "student" });
            showToast("Logged in successfully (Account automatically linked)!", "success");
            navigate("/student-dashboard");
            return;
          } else {
            setError("This is the Student Login Portal. Instructors, please use the Instructor Portal.");
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
    if (localUser.role === "student") {
      setUser({ uid: localUser.uid, name: localUser.name, email: localUser.email, role: "student" });
      showToast("Logged in successfully (Offline Local Cache)!", "success");
      navigate("/student-dashboard");
    } else {
      setError("This is the Student Login Portal. Instructors, please use the Instructor Portal.");
    }
  };

  const loginWithInvitedCredentials = async (emailValue, passwordValue) => {
    try {
      const invitedStudent = await loginInvitedStudent({
        email: emailValue,
        password: passwordValue,
      });
      setUser({ uid: invitedStudent.uid, name: invitedStudent.name, email: invitedStudent.email, role: "student" });
      showToast("Logged in successfully as invited student!", "success");
      navigate("/student-dashboard");
      return true;
    } catch (backendError) {
      console.warn("Invited student backend login failed:", backendError);
    }

    const localUsers = JSON.parse(localStorage.getItem("local_users") || "[]");
    const localUser = localUsers.find(
      (u) => u.email?.toLowerCase() === emailValue && u.password === passwordValue
    );

    if (localUser) {
      handleLocalRoleCheck(localUser);
      return true;
    }

    return false;
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
      const invitedLoginWorked = await loginWithInvitedCredentials(emailValue, password);
      if (!invitedLoginWorked) {
        setError(`${err.code || "auth/error"}: Check your email and password, then try again.`);
      }
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
          <div className="login-logo student-portal-logo" style={{ color: "var(--purple)" }}>
            <span className="brand-icon">
              <GraduationCap size={22} />
            </span>
            <span>Student Portal</span>
          </div>

          <h2 id="login-title">Student Login</h2>
          <p>Access your enrolled courses, quizzes, and learning path.</p>

          {error && (
            <div className="login-error-alert">
              <Sparkles size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Student Email Address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="student@gmail.com"
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

            <button className="submit-btn student-theme-btn" type="submit" disabled={loading} style={{ background: "var(--purple)", color: "white" }}>
              <LogIn size={17} />
              <span>{loading ? "Logging in..." : "Login to Student Portal"}</span>
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="submit-btn google-auth-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
            Login with Google
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create a Student account</Link>
          </p>

          <p className="auth-switch" style={{ fontSize: "0.82rem", opacity: 0.85 }}>
            Are you an Instructor? <Link to="/instructor-login" style={{ color: "var(--purple)" }}>Instructor Portal</Link>
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

export default StudentLogin;
