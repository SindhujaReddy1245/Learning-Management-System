import React, { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Bot,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Lightbulb,
  Moon,
  Palette,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
  Play,
  CheckCircle2,
  PlusCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User,
  Tv,
  Award,
  Plus,
  Check,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { getCourses, getCoursePdfs } from "./api";

// Standalone pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentLogin from "./pages/StudentLogin";
import InstructorLogin from "./pages/InstructorLogin";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";

// ==========================================
// MOCK DATA INITIALIZATION
// ==========================================

const defaultCourses = [
  {
    id: "c1",
    title: "React Fundamentals",
    description: "Learn the core concepts of React, including components, virtual DOM, props, hooks, and local state management.",
    level: "Beginner",
    instructor: "Jane Doe",
    category: "Web Development",
    duration: "6 hours",
    details: "Covers JSX, components, hooks, state, props, and small projects for beginners.",
    lessonsCount: 3,
    rating: "4.8",
    learnersCount: 42,
  },
  {
    id: "c2",
    title: "AI & Prompt Engineering",
    description: "Master the art of crafting highly effective prompts and integrating LLM models into your daily development workflows.",
    level: "Intermediate",
    instructor: "Alex Smith",
    category: "Artificial Intelligence",
    duration: "4 hours",
    details: "Practice prompt patterns, role prompting, few-shot examples, and real workflow integrations.",
    lessonsCount: 2,
    rating: "4.9",
    learnersCount: 28,
  },
  {
    id: "c3",
    title: "Advanced UI/UX Principles",
    description: "Dive deep into user psychology, modern UI design systems, glassmorphism, accessibility standards, and color theory.",
    level: "Advanced",
    instructor: "Sarah Connor",
    category: "Design",
    duration: "8 hours",
    details: "Explore accessibility, design systems, visual hierarchy, and modern product UI patterns.",
    lessonsCount: 2,
    rating: "4.7",
    learnersCount: 15,
  }
];

const defaultVideos = [
  {
    id: "v1",
    courseId: "c1",
    title: "Introduction to React & Virtual DOM",
    description: "Welcome to React! In this video, we cover the virtual DOM concept, high-performance updates, and setting up a clean developer workspace.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "5:12"
  },
  {
    id: "v2",
    courseId: "c1",
    title: "Understanding Components & JSX Syntax",
    description: "Learn how to write custom functional components, build visual hierarchies, and use JSX syntax to structure pages cleanly.",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "8:45"
  },
  {
    id: "v3",
    courseId: "c1",
    title: "State & Props: Managing Data Flow",
    description: "Deep dive into data management in React using the useState hook, props passing, and handling interactive user events.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "12:30"
  },
  {
    id: "v4",
    courseId: "c2",
    title: "What is Prompt Engineering?",
    description: "Introduction to Large Language Models, token sizes, system constraints, and how input instructions shape model responses.",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "6:15"
  },
  {
    id: "v5",
    courseId: "c2",
    title: "Zero-shot and Few-shot prompting techniques",
    description: "Learn the differences between giving no examples vs giving dynamic in-context examples to LLMs for robust schema outputs.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "10:05"
  },
  {
    id: "v6",
    courseId: "c3",
    title: "Understanding Modern Glassmorphism",
    description: "A structural study on visual weights, background blurs, borders, overlays, and shadows that form premium operating styles.",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    duration: "14:20"
  },
  {
    id: "v7",
    courseId: "c3",
    title: "Color Psychology & Contrast Ratios",
    description: "Learn how color impacts user mood, selecting cohesive palettes, and satisfying modern contrast ratio rules for global accessibility.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "11:15"
  }
];

const defaultQuizzes = [
  {
    id: "q1",
    courseId: "c1",
    title: "React Fundamentals Quiz",
    questions: [
      {
        question: "What is the Virtual DOM in React?",
        options: [
          "A direct representation of the actual HTML DOM",
          "A lightweight, in-memory copy of the real DOM used for fast diffing and rendering",
          "A browser extension for debugging React components",
          "A database query engine specifically optimized for JSON"
        ],
        correctAnswer: 1
      },
      {
        question: "How do you pass data from a parent component down to a child component?",
        options: [
          "Using state hooks exclusively",
          "Using Redux global state",
          "Using Props",
          "Using browser local storage"
        ],
        correctAnswer: 2
      },
      {
        question: "Which standard Hook is used to manage side effects in a functional component?",
        options: [
          "useState",
          "useContext",
          "useReducer",
          "useEffect"
        ],
        correctAnswer: 3
      }
    ]
  },
  {
    id: "q2",
    courseId: "c2",
    title: "Prompt Engineering Basics",
    questions: [
      {
        question: "What is Few-Shot Prompting?",
        options: [
          "Providing the model with zero examples and hoping for accurate formats",
          "Providing the model with a few concrete examples of inputs and desired outputs in the prompt",
          "Running the model multiple times in parallel to get the average response",
          "Writing a extremely short prompt containing under 5 words"
        ],
        correctAnswer: 1
      },
      {
        question: "What does system instruction or role prompting primarily achieve?",
        options: [
          "It decreases API response latency",
          "It guides the model's tone, character, rules, persona, and output style",
          "It encrypts query payloads automatically",
          "It reduces token consumption by 50%"
        ],
        correctAnswer: 1
      }
    ]
  }
];

const defaultEnrollments = [
  { courseId: "c1", studentEmail: "student@gmail.com" },
  { courseId: "c2", studentEmail: "student@gmail.com" },
];

const defaultEnrolledStudentsList = [
  { name: "John Doe", email: "john.doe@gmail.com", courseId: "c1", progress: 85 },
  { name: "Alice Smith", email: "alice.s@gmail.com", courseId: "c1", progress: 50 },
  { name: "Bob Carter", email: "bob@gmail.com", courseId: "c2", progress: 100 },
  { name: "Emma Watson", email: "emma@gmail.com", courseId: "c3", progress: 0 },
];

const products = [
  {
    title: "Course Builder",
    text: "Create structured courses, chapters, and lesson flows for every subject.",
    icon: BookOpen,
  },
  {
    title: "Quiz Studio",
    text: "Add topic-wise quizzes with quick scoring and clear learner feedback.",
    icon: ClipboardCheck,
  },
  {
    title: "AI Study Assistant",
    text: "Help students understand hard topics with hints, summaries, and guidance.",
    icon: Bot,
  },
];

const features = [
  "Courses and modules",
  "Quizzes",
  "AI tutor assistant",
  "Auto notes generation",
  "Progress analytics",
];

const overview = [
  { label: "Total Learners", value: "120+", icon: Users },
  { label: "Courses", value: "45+", icon: BookOpen },
  { label: "Quizzes", value: "150+", icon: ClipboardCheck },
  { label: "Average Rating", value: "4.8 / 5", icon: Star },
];

// ==========================================
// APP COMPONENT
// ==========================================

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // { email: '', role: '' }
  const [authReady, setAuthReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const isDark = theme === "dark";

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Core LMS states synchronized with local storage
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem("lms_courses");
    return saved ? JSON.parse(saved) : defaultCourses;
  });

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem("lms_videos");
    return saved ? JSON.parse(saved) : defaultVideos;
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem("lms_quizzes");
    return saved ? JSON.parse(saved) : defaultQuizzes;
  });

  const [enrollments, setEnrollments] = useState(() => {
    const saved = localStorage.getItem("lms_enrollments");
    return saved ? JSON.parse(saved) : defaultEnrollments;
  });

  const [enrolledStudents, setEnrolledStudents] = useState(() => {
    const saved = localStorage.getItem("lms_enrolled_students");
    return saved ? JSON.parse(saved) : defaultEnrolledStudentsList;
  });

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("lms_progress");
    return saved ? JSON.parse(saved) : {
      "student@gmail.com": {
        "c1": { watchedVideos: ["v1"], quizScore: null },
        "c2": { watchedVideos: [], quizScore: null }
      }
    };
  });

  const [coursePdfs, setCoursePdfs] = useState(() => {
    const saved = localStorage.getItem("lms_course_pdfs");
    return saved ? JSON.parse(saved) : {};
  });

  // ==========================================
  // SYNC PERSISTENCE EFFECTS
  // ==========================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userSnap.data().role,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    getCourses()
      .then((apiCourses) => {
        if (Array.isArray(apiCourses) && apiCourses.length > 0) {
          setCourses(apiCourses);
        }
      })
      .catch((error) => {
        console.info("Courses API unavailable, using local courses.", error);
      });
  }, []);

  useEffect(() => {
    const backendCourses = courses.filter((course) => !String(course.id).startsWith("c_") && !["c1", "c2", "c3"].includes(course.id));
    if (backendCourses.length === 0) return;

    Promise.all(
      backendCourses.map((course) =>
        getCoursePdfs(course.id)
          .then((pdfs) => [course.id, pdfs])
          .catch(() => [course.id, coursePdfs[course.id] || []])
      )
    ).then((entries) => {
      setCoursePdfs((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    });
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("lms_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("lms_videos", JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem("lms_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("lms_enrollments", JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem("lms_enrolled_students", JSON.stringify(enrolledStudents));
  }, [enrolledStudents]);

  useEffect(() => {
    localStorage.setItem("lms_progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("lms_course_pdfs", JSON.stringify(coursePdfs));
  }, [coursePdfs]);

  // ==========================================
  // CORE HANDLERS
  // ==========================================

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  function goHome() {
    navigate("/");
  }

  function goToLogin() {
    navigate("/login");
  }

  function showToast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handleLogout() {
    signOut(auth).catch(console.error);
    setUser(null);
    navigate("/");
    showToast("Logged out successfully.", "success");
  }

  // ==========================================
  // RENDER BLOCKS
  // ==========================================

  function renderHeader() {
    return (
      <header className="site-header">
        <div className="brand" onClick={goHome} style={{ cursor: "pointer" }}>
          <span className="brand-icon">
            <Zap size={20} fill="currentColor" />
          </span>
          <span>LearnFlow LMS</span>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <button
            className="theme-button"
            type="button"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            {isDark ? <Lightbulb size={17} /> : <Moon size={17} />}
            {isDark ? "Light" : "Dark"}
          </button>

          {user ? (
            <button className="theme-button" type="button" onClick={handleLogout} style={{ gap: "0.4rem" }}>
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <button className="start-button" type="button" onClick={goToLogin}>
              Start
            </button>
          )}
        </div>
      </header>
    );
  }

  function renderLandingPage() {
    return (
      <main className="page-shell" id="home">
        {renderHeader()}

        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-copy" style={{ textAlign: "left" }}>
            <p className="eyebrow">Smart Learning Management</p>
            <h1 id="hero-title">Simple learning tools for modern students.</h1>
            <p className="hero-text">
              Create courses, manage modules, run quizzes, generate notes, and track
              progress in one easy dashboard without extra clutter.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={goToLogin}>
                Start free
              </button>
              <a className="ghost-button" href="#features">
                Learn more
              </a>
            </div>

            <div className="trust-panel" aria-label="Platform highlights">
              <p>Trusted by learners and educators worldwide</p>
              <div className="trust-grid">
                <div>
                  <span><Users size={22} /></span>
                  <strong>30+</strong>
                  <small>Learners</small>
                </div>
                <div>
                  <span><GraduationCap size={22} /></span>
                  <strong>25+</strong>
                  <small>Instructors</small>
                </div>
                <div>
                  <span><Sparkles size={22} /></span>
                  <strong>10K+</strong>
                  <small>Sessions</small>
                </div>
              </div>
            </div>
          </div>

          <aside className="platform-card" aria-label="LMS platform overview">
            <div className="platform-heading">
              <strong>Platform Overview</strong>
              <span>LearnFlow LMS at a glance</span>
            </div>

            <div className="overview-grid">
              {overview.map(({ label, value, icon: Icon }) => (
                <article key={label}>
                  <span className="overview-icon"><Icon size={22} fill={label === "Average Rating" ? "currentColor" : "none"} /></span>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </article>
              ))}
            </div>

            <section className="dashboard-section">
              <div className="dashboard-section-head">
                <h3>Platform Previews</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--purple)", fontWeight: 800 }}>Vibrant UI</span>
              </div>
              <div className="course-table">
                {courses.slice(0, 3).map((item, index) => (
                  <article key={item.id} className={`course-row tone-${index + 1}`} style={{ cursor: "pointer" }} onClick={goToLogin}>
                    <span className="row-icon"><GraduationCap size={19} /></span>
                    <strong>{item.title}</strong>
                    <em>{item.level}</em>
                    <small>{item.category}</small>
                    <span className="rating"><Star size={15} fill="currentColor" /> {item.rating}</span>
                  </article>
                ))}
              </div>
            </section>

            <div className="join-banner">
              <span><Trophy size={24} fill="currentColor" /></span>
              <div>
                <strong>Empowering learners to achieve more every day.</strong>
                <small>Join LearnFlow and start your learning journey today!</small>
              </div>
              <button type="button" onClick={goToLogin} style={{ background: "var(--purple)", color: "#fff", border: "none", padding: "0.65rem 1rem", borderRadius: "0.5rem", fontWeight: 800, cursor: "pointer" }}>Join Now</button>
            </div>
          </aside>
        </section>

        <section className="products-section" id="products" aria-labelledby="products-title">
          <p className="pill-label">Our platform</p>
          <h2 id="products-title">Our Products</h2>
          <p className="section-subtitle">
            Three connected tools for course management, smart study support, and learner progress.
          </p>

          <div className="product-grid">
            {products.map(({ title, text, icon: Icon }) => (
              <article className="product-card" key={title}>
                <span className="product-icon">
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="features-section" id="features" aria-labelledby="features-title">
          <div style={{ textAlign: "left" }}>
            <p className="eyebrow">Features</p>
            <h2 id="features-title">Everything your LMS needs on day one.</h2>
          </div>
          <div className="feature-list">
            {features.map((feature) => (
              <div className="feature-item" key={feature}>
                <Sparkles size={18} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div style={{ textAlign: "left" }}>
            <p className="eyebrow">About</p>
            <h2>Designed for focused learning.</h2>
          </div>
          <p style={{ textAlign: "left" }}>
            LearnFlow keeps the first experience direct: students see what to study,
            practice with quizzes, track their progress, and enjoy a cohesive classroom player. Instructors get standard, rich creators for courses, videos, and quizzes.
          </p>
        </section>

        <section className="contact-section" id="contact">
          <div className="cta-card">
            <p className="eyebrow">Start learning smarter</p>
            <h2>Ready to launch your LMS?</h2>
            <p>
              Start learning smarter with AI-powered education tools built for courses,
              quizzes, notes, and progress tracking.
            </p>
            <div className="cta-actions">
              <button className="primary-button" type="button" onClick={goToLogin}>
                Get Started Free
              </button>
              <a className="ghost-button" href="mailto:hello@learnflow.example">
                Contact Us
              </a>
            </div>
            <div className="cta-features" aria-label="Key LMS features">
              <span><Bot size={16} /> AI Tutor</span>
              <span><FileText size={16} /> Smart Notes</span>
              <span><BarChart3 size={16} /> Analytics</span>
              <span><ClipboardCheck size={16} /> Quizzes</span>
            </div>
            <div className="cta-stats">
              500+ Learners • 40+ Courses • AI Tutor • 4.8 Rating
            </div>
          </div>
        </section>
      </main>
    );
  }

  function renderToasts() {
    return (
      <div className="toast-container-lms">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item-lms ${t.type}`}>
            <Sparkles size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    );
  }

  function renderLoadingPage() {
    return (
      <main className="page-shell">
        <div className="lms-login-container">
          <div className="login-card">
            <div className="login-logo">
              <span className="brand-icon">
                <Zap size={20} fill="currentColor" />
              </span>
              <span>LearnFlow LMS</span>
            </div>
            <h2>Loading dashboard</h2>
            <p>Checking your account role...</p>
          </div>
        </div>
      </main>
    );
  }

  function renderProtectedDashboard(role, renderDashboard) {
    if ((!authReady && !user) || (auth.currentUser && !user)) return renderLoadingPage();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role) {
      return <Navigate to={user.role === "instructor" ? "/instructor-dashboard" : "/student-dashboard"} replace />;
    }
    return renderDashboard();
  }

  // ==========================================
  // ROOT ROUTING DISPATCHER
  // ==========================================

  return (
    <>
      <Routes>
        <Route path="/" element={renderLandingPage()} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin setUser={setUser} showToast={showToast} />} />
        <Route path="/instructor-login" element={<InstructorLogin setUser={setUser} showToast={showToast} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/student-dashboard"
          element={renderProtectedDashboard(
            "student",
            () => (
              <StudentDashboard
                user={user}
                courses={courses}
                videos={videos}
                quizzes={quizzes}
                enrollments={enrollments}
                setEnrollments={setEnrollments}
                enrolledStudents={enrolledStudents}
                setEnrolledStudents={setEnrolledStudents}
                progress={progress}
                setProgress={setProgress}
                coursePdfs={coursePdfs}
                showToast={showToast}
                handleLogout={handleLogout}
                isDark={isDark}
                toggleTheme={toggleTheme}
                goHome={goHome}
              />
            )
          )}
        />
        <Route
          path="/instructor-dashboard"
          element={renderProtectedDashboard(
            "instructor",
            () => (
              <InstructorDashboard
                user={user}
                courses={courses}
                setCourses={setCourses}
                videos={videos}
                setVideos={setVideos}
                quizzes={quizzes}
                setQuizzes={setQuizzes}
                enrolledStudents={enrolledStudents}
                setEnrolledStudents={setEnrolledStudents}
                coursePdfs={coursePdfs}
                setCoursePdfs={setCoursePdfs}
                showToast={showToast}
                handleLogout={handleLogout}
                isDark={isDark}
                toggleTheme={toggleTheme}
                goHome={goHome}
              />
            )
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {renderToasts()}
    </>
  );
}

export default App;
