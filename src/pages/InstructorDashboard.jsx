import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Play,
  Users,
  Tv,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Zap,
  Lightbulb,
  Moon,
  LogOut,
  Star,
  GraduationCap
} from "lucide-react";

const InstructorDashboard = ({
  user,
  courses,
  setCourses,
  videos,
  setVideos,
  quizzes,
  setQuizzes,
  enrolledStudents,
  setEnrolledStudents,
  showToast,
  handleLogout,
  isDark,
  toggleTheme,
  goHome,
}) => {
  // Local UI states
  const [instructorTab, setInstructorTab] = useState("manage-courses"); // 'manage-courses', 'add-course', 'add-video', 'add-quiz', 'students'
  const [instructorSelectedCourseId, setInstructorSelectedCourseId] = useState(null);

  // Form states - Add Course
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseLevel, setNewCourseLevel] = useState("Beginner");
  const [newCourseCategory, setNewCourseCategory] = useState("Web Development");
  const [newCourseDuration, setNewCourseDuration] = useState("5 hours");

  // Form states - Add Video
  const [newVideoCourseId, setNewVideoCourseId] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoDuration, setNewVideoDuration] = useState("8:00");
  const [newVideoUrl, setNewVideoUrl] = useState("https://www.w3schools.com/html/mov_bbb.mp4");

  // Form states - Add Quiz
  const [newQuizCourseId, setNewQuizCourseId] = useState("");
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [quizQuestion1, setQuizQuestion1] = useState("");
  const [quizQ1Opt1, setQuizQ1Opt1] = useState("");
  const [quizQ1Opt2, setQuizQ1Opt2] = useState("");
  const [quizQ1Opt3, setQuizQ1Opt3] = useState("");
  const [quizQ1Opt4, setQuizQ1Opt4] = useState("");
  const [quizQ1Correct, setQuizQ1Correct] = useState(0);

  const [quizQuestion2, setQuizQuestion2] = useState("");
  const [quizQ2Opt1, setQuizQ2Opt1] = useState("");
  const [quizQ2Opt2, setQuizQ2Opt2] = useState("");
  const [quizQ2Opt3, setQuizQ2Opt3] = useState("");
  const [quizQ2Opt4, setQuizQ2Opt4] = useState("");
  const [quizQ2Correct, setQuizQ2Correct] = useState(0);

  // Set default course options in instructor dropdowns when course list changes
  useEffect(() => {
    if (courses.length > 0) {
      if (!newVideoCourseId) setNewVideoCourseId(courses[0].id);
      if (!newQuizCourseId) setNewQuizCourseId(courses[0].id);
    }
  }, [courses]);

  // Helper stats calculation
  const getInstructorStats = () => {
    const totalCourses = courses.length;
    const totalVideos = videos.length;
    const totalQuizzes = quizzes.length;
    const totalEnrolls = enrolledStudents.length;

    return {
      totalCourses,
      totalVideos,
      totalQuizzes,
      totalEnrolls,
    };
  };

  // Instructor Add Course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newCourseDesc.trim()) {
      showToast("Please fill all fields", "success");
      return;
    }

    const newId = "c_" + Date.now();
    const newCourseObj = {
      id: newId,
      title: newCourseTitle,
      description: newCourseDesc,
      level: newCourseLevel,
      instructor: "Instructor (instructor@gmail.com)",
      category: newCourseCategory,
      duration: newCourseDuration,
      lessonsCount: 0,
      rating: "5.0",
      learnersCount: 0,
    };

    setCourses((prev) => [...prev, newCourseObj]);

    // Reset inputs
    setNewCourseTitle("");
    setNewCourseDesc("");
    setNewCourseLevel("Beginner");
    setNewCourseDuration("5 hours");

    showToast("Course created successfully!", "success");
    setInstructorTab("manage-courses");
  };

  // Instructor Add Video
  const handleCreateVideo = (e) => {
    e.preventDefault();
    if (!newVideoCourseId || !newVideoTitle.trim() || !newVideoDesc.trim()) {
      showToast("Please fill all fields", "success");
      return;
    }

    const newId = "v_" + Date.now();
    const newVideoObj = {
      id: newId,
      courseId: newVideoCourseId,
      title: newVideoTitle,
      description: newVideoDesc,
      videoUrl: newVideoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: newVideoDuration || "8:00",
    };

    setVideos((prev) => [...prev, newVideoObj]);

    // Update course video counts
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === newVideoCourseId) {
          return { ...c, lessonsCount: (c.lessonsCount || 0) + 1 };
        }
        return c;
      })
    );

    // Reset inputs
    setNewVideoTitle("");
    setNewVideoDesc("");
    setNewVideoDuration("8:00");

    showToast("Video lesson added to course!", "success");
    setInstructorTab("manage-courses");
  };

  // Instructor Add Quiz
  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newQuizCourseId || !newQuizTitle.trim() || !quizQuestion1.trim()) {
      showToast("Please specify a quiz title and at least Question 1", "success");
      return;
    }

    const newQuizQuestions = [
      {
        question: quizQuestion1,
        options: [quizQ1Opt1 || "Option A", quizQ1Opt2 || "Option B", quizQ1Opt3 || "Option C", quizQ1Opt4 || "Option D"],
        correctAnswer: parseInt(quizQ1Correct),
      },
    ];

    if (quizQuestion2.trim()) {
      newQuizQuestions.push({
        question: quizQuestion2,
        options: [quizQ2Opt1 || "Option A", quizQ2Opt2 || "Option B", quizQ2Opt3 || "Option C", quizQ2Opt4 || "Option D"],
        correctAnswer: parseInt(quizQ2Correct),
      });
    }

    const existingIndex = quizzes.findIndex((q) => q.courseId === newQuizCourseId);

    if (existingIndex >= 0) {
      setQuizzes((prev) => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          title: newQuizTitle,
          questions: newQuizQuestions,
        };
        return copy;
      });
    } else {
      const newQuizObj = {
        id: "q_" + Date.now(),
        courseId: newQuizCourseId,
        title: newQuizTitle,
        questions: newQuizQuestions,
      };
      setQuizzes((prev) => [...prev, newQuizObj]);
    }

    // Reset inputs
    setNewQuizTitle("");
    setQuizQuestion1("");
    setQuizQ1Opt1("");
    setQuizQ1Opt2("");
    setQuizQ1Opt3("");
    setQuizQ1Opt4("");
    setQuizQ1Correct(0);
    setQuizQuestion2("");
    setQuizQ2Opt1("");
    setQuizQ2Opt2("");
    setQuizQ2Opt3("");
    setQuizQ2Opt4("");
    setQuizQ2Correct(0);

    showToast("Quiz successfully set up for course!", "success");
    setInstructorTab("manage-courses");
  };

  // Header render
  const renderHeader = () => {
    return (
      <header className="site-header">
        <div className="brand" onClick={goHome} style={{ cursor: "pointer" }}>
          <span className="brand-icon">
            <Zap size={20} fill="currentColor" />
          </span>
          <span>LearnFlow LMS</span>
        </div>

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

          <button className="theme-button" type="button" onClick={handleLogout} style={{ gap: "0.4rem" }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
    );
  };

  // Instructor specific course details workspace
  const renderInstructorCourseWorkspace = () => {
    const courseObj = courses.find((c) => c.id === instructorSelectedCourseId);
    if (!courseObj) return null;

    const courseVideos = videos.filter((v) => v.courseId === instructorSelectedCourseId);
    const courseQuiz = quizzes.find((q) => q.courseId === instructorSelectedCourseId);
    const courseEnrolls = enrolledStudents.filter((s) => s.courseId === instructorSelectedCourseId);

    return (
      <div>
        <div className="classroom-header">
          <button
            className="classroom-back-btn"
            type="button"
            onClick={() => setInstructorSelectedCourseId(null)}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="classroom-title-area">
            <h2>{courseObj.title} Details Workspace</h2>
            <span>Instructor workstation overview for specific courses</span>
          </div>
        </div>

        <div className="instructor-detail-grid">
          {/* Videos List Box */}
          <div className="instructor-detail-card">
            <h4>Playlist Video Lessons ({courseVideos.length})</h4>
            {courseVideos.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>No lessons uploaded.</span>
            ) : (
              <div className="instructor-detail-list">
                {courseVideos.map((v, idx) => (
                  <div key={v.id} className="instructor-detail-item">
                    <span>{idx + 1}. {v.title}</span>
                    <strong>{v.duration}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz Box */}
          <div className="instructor-detail-card">
            <h4>Quiz Setting</h4>
            {courseQuiz ? (
              <div className="instructor-detail-list">
                <div className="instructor-detail-item" style={{ marginBottom: "0.5rem" }}>
                  <span>Quiz Title:</span>
                  <strong>{courseQuiz.title}</strong>
                </div>
                {courseQuiz.questions.map((q, idx) => (
                  <div key={idx} style={{ fontSize: "0.82rem", borderTop: "1px solid var(--line)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                    <div style={{ color: "var(--title)", fontWeight: 700 }}>Q{idx + 1}: {q.question}</div>
                    <div style={{ color: "var(--muted)", marginTop: "0.15rem" }}>Options: {q.options.join(" | ")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>No challenge quiz configured yet.</span>
            )}
          </div>

          {/* Enrolled Students Specific to Course */}
          <div className="instructor-detail-card">
            <h4>Active Course Learners ({courseEnrolls.length})</h4>
            {courseEnrolls.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>No learners enrolled in this course catalog yet.</span>
            ) : (
              <div className="instructor-detail-list">
                {courseEnrolls.map((s, idx) => (
                  <div key={idx} className="instructor-detail-item">
                    <span>{s.name} ({s.email})</span>
                    <strong>{s.progress}%</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = getInstructorStats();

  return (
    <main className="page-shell">
      {renderHeader()}

      <div className="dashboard-wrapper">
        {/* Page Section Title */}
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--title)", marginBottom: "1.5rem", textAlign: "left", letterSpacing: "-0.02em" }}>
          Instructor Workstation
        </h1>

        {/* Top Navbar */}
        <div className="dashboard-nav-bar" style={{ marginTop: 0 }}>
          <div className="dashboard-user-info">
            <div className="user-avatar instructor-avatar">I</div>
            <div className="user-details">
              <h2>Welcome Back, Instructor</h2>
              <span>Logged in as: {user.email} (Instructor)</span>
            </div>
          </div>

          <div className="dashboard-tabs-container">
            <button
              className={`dashboard-tab-btn ${instructorTab === "manage-courses" ? "active" : ""}`}
              onClick={() => {
                setInstructorTab("manage-courses");
                setInstructorSelectedCourseId(null);
              }}
            >
              <BookOpen size={16} />
              Manage Courses
            </button>

            <button
              className={`dashboard-tab-btn ${instructorTab === "add-course" ? "active" : ""}`}
              onClick={() => setInstructorTab("add-course")}
            >
              <PlusCircle size={16} />
              Add Course
            </button>

            <button
              className={`dashboard-tab-btn ${instructorTab === "add-video" ? "active" : ""}`}
              onClick={() => setInstructorTab("add-video")}
            >
              <Tv size={16} />
              Add Video
            </button>

            <button
              className={`dashboard-tab-btn ${instructorTab === "add-quiz" ? "active" : ""}`}
              onClick={() => setInstructorTab("add-quiz")}
            >
              <ClipboardCheck size={16} />
              Add Quiz
            </button>

            <button
              className={`dashboard-tab-btn ${instructorTab === "students" ? "active" : ""}`}
              onClick={() => setInstructorTab("students")}
            >
              <Users size={16} />
              Enrolled Students
            </button>
          </div>
        </div>

        {/* Metric cards */}
        {instructorTab === "manage-courses" && !instructorSelectedCourseId && (
          <div className="metrics-row">
            <div className="metric-card-lms">
              <div className="metric-icon-lms">
                <BookOpen size={24} />
              </div>
              <div className="metric-info-lms">
                <strong>{stats.totalCourses}</strong>
                <span>Active Courses</span>
              </div>
            </div>

            <div className="metric-card-lms">
              <div className="metric-icon-lms">
                <Play size={24} />
              </div>
              <div className="metric-info-lms">
                <strong>{stats.totalVideos}</strong>
                <span>Video Lessons</span>
              </div>
            </div>

            <div className="metric-card-lms">
              <div className="metric-icon-lms">
                <ClipboardCheck size={24} />
              </div>
              <div className="metric-info-lms">
                <strong>{stats.totalQuizzes}</strong>
                <span>Assessments Set</span>
              </div>
            </div>

            <div className="metric-card-lms">
              <div className="metric-icon-lms">
                <Users size={24} />
              </div>
              <div className="metric-info-lms">
                <strong>{stats.totalEnrolls}</strong>
                <span>Active Learners</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Course list */}
        {instructorTab === "manage-courses" && !instructorSelectedCourseId && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: "1rem" }}>
            Empty
          </div>
        )}

        {/* Instructor course specific details workspace */}
        {instructorTab === "manage-courses" && instructorSelectedCourseId && (
          renderInstructorCourseWorkspace()
        )}

        {/* Tab: Add Course */}
        {instructorTab === "add-course" && (
          <div className="form-dashboard-card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", border: "1px dashed var(--line)" }}>
            Empty
          </div>
        )}

        {/* Tab: Add Video */}
        {instructorTab === "add-video" && (
          <div className="form-dashboard-card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", border: "1px dashed var(--line)" }}>
            Empty
          </div>
        )}

        {/* Tab: Add Quiz */}
        {instructorTab === "add-quiz" && (
          <div className="form-dashboard-card" style={{ maxWidth: "42rem", textAlign: "center", padding: "3rem", color: "var(--muted)", border: "1px dashed var(--line)" }}>
            Empty
          </div>
        )}

        {/* Tab: Enrolled Students List */}
        {instructorTab === "students" && (
          <div className="enrolled-students-card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", border: "1px dashed var(--line)" }}>
            Empty
          </div>
        )}
      </div>
    </main>
  );
};

export default InstructorDashboard;
