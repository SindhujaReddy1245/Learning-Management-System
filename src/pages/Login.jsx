import React from "react";
import { ArrowLeft, GraduationCap, Palette, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <main className="page-shell auth-page-shell" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--body-bg)" }}>
      {/* Premium Top Navigation Bar */}
      <header style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem 2rem",
        borderBottom: "1px solid var(--line)"
      }}>
        <div className="login-logo" style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="brand-icon">
            <Zap size={18} fill="currentColor" />
          </span>
          <span style={{ fontWeight: 800, color: "var(--title)" }}>LearnFlow LMS</span>
        </div>
        
        <Link className="back-link" to="/" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "3rem 2rem",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "3rem", maxWidth: "600px" }}>
          <span className="pill-label" style={{ marginBottom: "1rem" }}>LMS Entry Portal</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.1, marginBottom: "0.8rem", color: "var(--title)", fontWeight: 900 }}>
            Select Your Portal
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Access your personalized learning environment or log in to your instructor workstation.
          </p>
        </div>

        {/* Side-by-Side Large Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2.5rem",
            width: "100%",
            maxWidth: "960px",
            margin: "0 auto 2rem auto"
          }}
        >
          {/* Student Portal Card */}
          <div
            className="portal-selection-card"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--line)",
              borderRadius: "1.5rem",
              padding: "3rem 2.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s"
            }}
            onClick={() => navigate("/student-login")}
          >
            <div
              style={{
                background: "rgba(112, 72, 245, 0.1)",
                color: "var(--purple)",
                width: "4.5rem",
                height: "4.5rem",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <GraduationCap size={40} />
            </div>
            <h3 style={{ fontSize: "1.6rem", color: "var(--title)", margin: 0, fontWeight: 800 }}>Student Portal</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Access your enrolled courses, complete lesson modules, take structural quizzes, and view your personal progress statistics.
            </p>
            <button
              className="submit-btn"
              type="button"
              style={{
                background: "var(--purple)",
                color: "white",
                marginTop: "auto",
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                fontSize: "0.95rem"
              }}
            >
              Enter Student Portal
            </button>
          </div>

          {/* Instructor Workstation Card */}
          <div
            className="portal-selection-card"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--line)",
              borderRadius: "1.5rem",
              padding: "3rem 2.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s"
            }}
            onClick={() => navigate("/instructor-login")}
          >
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "var(--orange)",
                width: "4.5rem",
                height: "4.5rem",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Palette size={40} />
            </div>
            <h3 style={{ fontSize: "1.6rem", color: "var(--title)", margin: 0, fontWeight: 800 }}>Instructor Workstation</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Build premium courses, create rich assessments & assessments generators, upload lessons, and evaluate global learner analytics.
            </p>
            <button
              className="submit-btn"
              type="button"
              style={{
                background: "var(--orange)",
                color: "white",
                marginTop: "auto",
                width: "100%",
                padding: "1rem",
                borderRadius: "0.75rem",
                fontSize: "0.95rem"
              }}
            >
              Enter Workstation
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
