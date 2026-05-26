import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Play,
  Trophy,
  Users,
  Tv,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Zap,
  Lightbulb,
  Moon,
  LogOut,
  Star,
  GraduationCap,
  Search,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import {
  getCourseModules,
  getCoursePdfDownloadUrl,
  getCoursePdfPreviewUrl,
  getModulePdfDownloadUrl,
  getModulePdfPreviewUrl,
  getModulePdfs,
  getModuleQuiz,
  getModuleQuizAttempts,
  submitModuleQuizAttempt,
} from "../api";

const StudentDashboard = ({
  user,
  courses,
  videos,
  quizzes,
  enrollments,
  setEnrollments,
  enrolledStudents,
  setEnrolledStudents,
  progress,
  setProgress,
  coursePdfs,
  showToast,
  handleLogout,
  isDark,
  toggleTheme,
  goHome,
}) => {
  // Local UI states
  const [studentTab, setStudentTab] = useState("my-courses"); // 'my-courses', 'browse'
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [expandedVideosCourseId, setExpandedVideosCourseId] = useState(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: optionIndex }
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseModules, setCourseModules] = useState({});
  const [modulePdfs, setModulePdfs] = useState({});
  const [moduleQuizzes, setModuleQuizzes] = useState({});
  const [moduleAttempts, setModuleAttempts] = useState({});
  const [activeModuleQuizId, setActiveModuleQuizId] = useState(null);
  const [moduleQuizAnswers, setModuleQuizAnswers] = useState({});

  useEffect(() => {
    const enrolledCourseIds = enrollments
      .filter((enrollment) => enrollment.studentEmail === user.email)
      .map((enrollment) => enrollment.courseId);

    enrolledCourseIds.forEach((courseId) => {
      getCourseModules(courseId)
        .then((mods) => {
          setCourseModules((prev) => ({ ...prev, [courseId]: mods }));
        })
        .catch(() => {
          setCourseModules((prev) => ({ ...prev, [courseId]: prev[courseId] || [] }));
        });
    });
  }, [enrollments, user.email]);

  useEffect(() => {
    const modules = Object.values(courseModules).flat();
    modules.forEach((mod) => {
      getModulePdfs(mod.id)
        .then((pdfs) => {
          setModulePdfs((prev) => ({ ...prev, [mod.id]: pdfs }));
        })
        .catch(() => {
          setModulePdfs((prev) => ({ ...prev, [mod.id]: prev[mod.id] || [] }));
        });

      getModuleQuiz(mod.id)
        .then((quiz) => {
          setModuleQuizzes((prev) => ({ ...prev, [mod.id]: quiz }));
        })
        .catch(() => {
          setModuleQuizzes((prev) => ({ ...prev, [mod.id]: null }));
        });

      getModuleQuizAttempts(mod.id, user.email)
        .then((attempts) => {
          setModuleAttempts((prev) => ({ ...prev, [mod.id]: attempts }));
        })
        .catch(() => {
          setModuleAttempts((prev) => ({ ...prev, [mod.id]: prev[mod.id] || [] }));
        });
    });
  }, [courseModules, user.email]);

  // Helper functions
  const getCourseProgress = (studentEmail, courseId) => {
    const courseVideos = videos.filter((v) => v.courseId === courseId);
    const totalVideos = courseVideos.length;
    const studentCourseProgress = progress[studentEmail]?.[courseId];
    const watchedVideoIds = new Set(studentCourseProgress?.watchedVideos || []);
    const watchedCount = courseVideos.filter((video) => watchedVideoIds.has(video.id)).length;
    const modules = courseModules[courseId] || [];
    const modulePdfCount = modules.reduce((count, mod) => count + (modulePdfs[mod.id]?.length || 0), 0);
    const viewedModulePdfIds = new Set(studentCourseProgress?.viewedModulePdfs || []);
    const viewedModulePdfCount = modules.reduce(
      (count, mod) => count + (modulePdfs[mod.id] || []).filter((pdf) => viewedModulePdfIds.has(pdf.id)).length,
      0
    );
    const moduleQuizCount = modules.filter((mod) => moduleQuizzes[mod.id]).length;
    const moduleQuizScores = studentCourseProgress?.moduleQuizScores || {};
    const completedModuleQuizCount = modules.filter((mod) => moduleQuizzes[mod.id] && moduleQuizScores[mod.id] !== undefined).length;

    const courseQuiz = quizzes.find((q) => q.courseId === courseId);
    const hasQuiz = !!courseQuiz;
    const quizScore = studentCourseProgress?.quizScore;
    const quizCompleted = quizScore !== null && quizScore !== undefined;

    const totalItems = totalVideos + modulePdfCount + moduleQuizCount + (hasQuiz ? 1 : 0);
    if (totalItems === 0) return 0;

    const completedItems = watchedCount + viewedModulePdfCount + completedModuleQuizCount + (quizCompleted ? 1 : 0);
    return Math.min(100, Math.max(0, Math.round((completedItems / totalItems) * 100)));
  };

  const getStudentProgressStats = () => {
    const studentEnrs = enrollments.filter((e) => e.studentEmail === user.email);
    const totalEnrolled = studentEnrs.length;

    let completedQuizzes = 0;
    let watchedCount = 0;

    studentEnrs.forEach((e) => {
      const prog = progress[user.email]?.[e.courseId];
      if (prog) {
        if (prog.quizScore !== null) completedQuizzes += 1;
        completedQuizzes += Object.keys(prog.moduleQuizScores || {}).length;
        watchedCount += prog.watchedVideos?.length || 0;
      }
    });

    let sumProgress = 0;
    studentEnrs.forEach((e) => {
      sumProgress += getCourseProgress(user.email, e.courseId);
    });
    const avgProgress = totalEnrolled > 0 ? Math.min(100, Math.round(sumProgress / totalEnrolled)) : 0;

    return {
      totalEnrolled,
      completedQuizzes,
      watchedCount,
      avgProgress,
    };
  };

  const enrollInCourse = (courseId) => {
    const exists = enrollments.some(
      (e) => e.courseId === courseId && e.studentEmail === user.email
    );

    if (exists) {
      showToast("Already enrolled in this course!", "success");
      return;
    }

    const newEnrollment = { courseId, studentEmail: user.email };
    setEnrollments((prev) => [...prev, newEnrollment]);

    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[user.email]) copy[user.email] = {};
      if (!copy[user.email][courseId]) {
        copy[user.email][courseId] = { watchedVideos: [], quizScore: null, viewedModulePdfs: [], moduleQuizScores: {} };
      }
      return copy;
    });

    const studentInfo = {
      name: "Sindhuja Reddy (You)",
      email: user.email,
      courseId: courseId,
      progress: 0,
    };
    setEnrolledStudents((prev) => [...prev, studentInfo]);

    showToast("Enrolled successfully! Happy learning!", "success");
  };

  const markVideoAsWatched = (courseId, videoId) => {
    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[user.email]) copy[user.email] = {};
      if (!copy[user.email][courseId]) {
        copy[user.email][courseId] = { watchedVideos: [], quizScore: null, viewedModulePdfs: [], moduleQuizScores: {} };
      }

      const watched = copy[user.email][courseId].watchedVideos || [];
      if (!watched.includes(videoId)) {
        copy[user.email][courseId].watchedVideos = [...watched, videoId];
      }
      return copy;
    });

    setTimeout(() => {
      setEnrolledStudents((prev) =>
        prev.map((s) => {
          if (s.email === user.email && s.courseId === courseId) {
            return { ...s, progress: getCourseProgress(user.email, courseId) };
          }
          return s;
        })
      );
    }, 50);

    showToast("Lesson completed! Progress updated.", "success");
  };

  const markModulePdfViewed = (courseId, pdfId) => {
    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[user.email]) copy[user.email] = {};
      if (!copy[user.email][courseId]) {
        copy[user.email][courseId] = { watchedVideos: [], quizScore: null, viewedModulePdfs: [], moduleQuizScores: {} };
      }

      const viewed = copy[user.email][courseId].viewedModulePdfs || [];
      if (!viewed.includes(pdfId)) {
        copy[user.email][courseId].viewedModulePdfs = [...viewed, pdfId];
      }
      return copy;
    });

    setTimeout(() => {
      setEnrolledStudents((prev) =>
        prev.map((s) => {
          if (s.email === user.email && s.courseId === courseId) {
            return { ...s, progress: getCourseProgress(user.email, courseId) };
          }
          return s;
        })
      );
    }, 50);
  };

  const startModuleQuiz = (moduleId) => {
    const quiz = moduleQuizzes[moduleId];
    if (!quiz || quiz.questions.length === 0) {
      showToast("No quiz available for this module yet.", "error");
      return;
    }
    setActiveModuleQuizId(moduleId);
    setModuleQuizAnswers({});
  };

  const submitModuleQuiz = async (courseId, moduleId) => {
    const quiz = moduleQuizzes[moduleId];
    if (!quiz) return;

    const answers = quiz.questions.map((_, index) => moduleQuizAnswers[index]);
    if (answers.some((answer) => answer === undefined)) {
      showToast("Please answer all module quiz questions.", "error");
      return;
    }

    try {
      const attempt = await submitModuleQuizAttempt(moduleId, {
        studentId: user.email,
        answers,
      });
      setModuleAttempts((prev) => ({
        ...prev,
        [moduleId]: [attempt, ...(prev[moduleId] || [])],
      }));
      setProgress((prev) => {
        const copy = { ...prev };
        if (!copy[user.email]) copy[user.email] = {};
        if (!copy[user.email][courseId]) {
          copy[user.email][courseId] = { watchedVideos: [], quizScore: null, viewedModulePdfs: [], moduleQuizScores: {} };
        }
        copy[user.email][courseId].moduleQuizScores = {
          ...(copy[user.email][courseId].moduleQuizScores || {}),
          [moduleId]: attempt.score,
        };
        return copy;
      });

      setTimeout(() => {
        setEnrolledStudents((prev) =>
          prev.map((s) => {
            if (s.email === user.email && s.courseId === courseId) {
              return { ...s, progress: getCourseProgress(user.email, courseId) };
            }
            return s;
          })
        );
      }, 50);

      setActiveModuleQuizId(null);
      setModuleQuizAnswers({});
      showToast(`Module quiz completed! Score: ${attempt.score}%`, "success");
    } catch (error) {
      console.error(error);
      showToast(`Module quiz submit failed: ${error.message}`, "error");
    }
  };

  const startQuiz = (courseId) => {
    const quiz = quizzes.find((q) => q.courseId === courseId);
    if (!quiz || quiz.questions.length === 0) {
      showToast("No quiz available for this course yet.", "success");
      return;
    }
    setQuizAnswers({});
    setCurrentQuizQuestion(0);
    setQuizActive(true);
    setQuizFinished(false);
  };

  const submitQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const finishQuiz = (courseId) => {
    const quiz = quizzes.find((q) => q.courseId === courseId);
    if (!quiz) return;

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });

    setProgress((prev) => {
      const copy = { ...prev };
      if (!copy[user.email]) copy[user.email] = {};
      if (!copy[user.email][courseId]) {
        copy[user.email][courseId] = { watchedVideos: [], quizScore: null, viewedModulePdfs: [], moduleQuizScores: {} };
      }
      copy[user.email][courseId].quizScore = score;
      return copy;
    });

    setTimeout(() => {
      setEnrolledStudents((prev) =>
        prev.map((s) => {
          if (s.email === user.email && s.courseId === courseId) {
            return { ...s, progress: getCourseProgress(user.email, courseId) };
          }
          return s;
        })
      );
    }, 50);

    setQuizFinished(true);
    showToast(`Quiz completed! You scored ${score} out of ${quiz.questions.length}`, "success");
  };

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

  const renderQuizSolver = (quiz) => {
    if (!quiz) return null;
    const questions = quiz.questions;
    const isLast = currentQuizQuestion === questions.length - 1;
    const currentQ = questions[currentQuizQuestion];

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    return (
      <div className="quiz-container-lms">
        {quizFinished ? (
          <div className="quiz-results-card">
            <div className="quiz-results-score">
              {correctCount} / {questions.length}
            </div>
            <div className="quiz-results-title">Quiz Session Completed!</div>
            <p className="quiz-results-text">
              Great effort! Your score has been submitted, recorded, and added to your total course completion rate.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                className="submit-btn"
                type="button"
                style={{ width: "fit-content", padding: "0.75rem 1.5rem", background: "var(--panel-soft)", color: "var(--text)", border: "1px solid var(--line)" }}
                onClick={() => {
                  setQuizActive(false);
                  setQuizFinished(false);
                }}
              >
                Back to Lessons
              </button>
              <button
                className="submit-btn"
                type="button"
                style={{ width: "fit-content", padding: "0.75rem 1.5rem", background: "var(--purple)", color: "white" }}
                onClick={() => startQuiz(activeCourseId)}
              >
                Retake Session
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="quiz-header-box">
              <h3>{quiz.title}</h3>
              <span>Question {currentQuizQuestion + 1} of {questions.length}</span>
            </div>

            <div className="quiz-question-box">
              <div className="quiz-question-text">{currentQ.question}</div>
              <div className="quiz-options-list">
                {currentQ.options.map((option, oIdx) => {
                  const isSelected = quizAnswers[currentQuizQuestion] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className={`quiz-option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => submitQuizAnswer(currentQuizQuestion, oIdx)}
                    >
                      <div className="quiz-option-badge">
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="quiz-navigation">
              <button
                className="prev"
                type="button"
                disabled={currentQuizQuestion === 0}
                onClick={() => setCurrentQuizQuestion((prev) => prev - 1)}
                style={{ opacity: currentQuizQuestion === 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {isLast ? (
                <button
                  className="submit"
                  type="button"
                  onClick={() => finishQuiz(activeCourseId)}
                  disabled={quizAnswers[currentQuizQuestion] === undefined}
                  style={{ opacity: quizAnswers[currentQuizQuestion] === undefined ? 0.5 : 1 }}
                >
                  <Check size={16} />
                  Submit Quiz
                </button>
              ) : (
                <button
                  className="next"
                  type="button"
                  onClick={() => setCurrentQuizQuestion((prev) => prev + 1)}
                  disabled={quizAnswers[currentQuizQuestion] === undefined}
                  style={{ opacity: quizAnswers[currentQuizQuestion] === undefined ? 0.5 : 1 }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const stats = getStudentProgressStats();
  const studentEnrs = enrollments.filter((e) => e.studentEmail === user.email);
  const studentEnrolledCourses = courses.filter((c) =>
    studentEnrs.some((e) => e.courseId === c.id)
  );
  const normalizedSearch = courseSearch.trim().toLowerCase();
  const browsedCourses = courses.filter((course) => {
    if (!normalizedSearch) return true;
    return [course.title, course.description, course.category, course.details]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return (
    <main className="page-shell">
      {renderHeader()}

      <div className="dashboard-wrapper">
        {/* Page Section Title */}
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--title)", marginBottom: "1.5rem", textAlign: "left" }}>
          Student Dashboard
        </h1>

        {/* Top Info Bar */}
        <div className="dashboard-nav-bar" style={{ marginTop: 0 }}>
          <div className="dashboard-user-info">
            <div className="user-avatar">S</div>
            <div className="user-details">
              <h2>Welcome Back, Sindhuja</h2>
              <span>Logged in as: {user.email} (Student)</span>
            </div>
          </div>

          <div className="dashboard-tabs-container">
            <button
              className={`dashboard-tab-btn ${studentTab === "my-courses" && !activeCourseId ? "active" : ""}`}
              onClick={() => {
                setActiveCourseId(null);
                setStudentTab("my-courses");
              }}
            >
              <BookOpen size={16} />
              My Courses
            </button>
            <button
              className={`dashboard-tab-btn ${studentTab === "browse" && !activeCourseId ? "active" : ""}`}
              onClick={() => {
                setActiveCourseId(null);
                setStudentTab("browse");
              }}
            >
              <Users size={16} />
              Browse & Enroll
            </button>
          </div>
        </div>

        {/* Classroom Sub-View */}
        {activeCourseId ? (
          <div style={{ alignSelf: "start", width: "100%" }}>
            <div className="classroom-header" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--line)", paddingBottom: "1rem" }}>
              <button
                className="classroom-back-btn"
                type="button"
                onClick={() => setActiveCourseId(null)}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--line)",
                  borderRadius: "50%",
                  width: "2.5rem",
                  height: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text)"
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="classroom-title-area" style={{ display: "flex", flexDirection: "column", gap: "0.2rem", textAlign: "left" }}>
                <h2 style={{ fontSize: "1.25rem", color: "var(--title)", margin: 0 }}>
                  Quiz Challenge: {courses.find((c) => c.id === activeCourseId)?.title}
                </h2>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Answer all the challenge questions to log completion progress.
                </span>
              </div>
            </div>
            {renderQuizSolver(quizzes.find((q) => q.courseId === activeCourseId))}
          </div>
        ) : (
          <>
            {/* General Metrics Overview */}
            <div className="metrics-row">
              <div className="metric-card-lms">
                <div className="metric-icon-lms">
                  <BookOpen size={24} />
                </div>
                <div className="metric-info-lms">
                  <strong>{stats.totalEnrolled}</strong>
                  <span>Enrolled Courses</span>
                </div>
              </div>

              <div className="metric-card-lms">
                <div className="metric-icon-lms">
                  <Play size={24} />
                </div>
                <div className="metric-info-lms">
                  <strong>{stats.watchedCount}</strong>
                  <span>Lessons Completed</span>
                </div>
              </div>

              <div className="metric-card-lms">
                <div className="metric-icon-lms">
                  <ClipboardCheck size={24} />
                </div>
                <div className="metric-info-lms">
                  <strong>{stats.completedQuizzes}</strong>
                  <span>Quizzes Finished</span>
                </div>
              </div>

              <div className="metric-card-lms">
                <div className="metric-icon-lms">
                  <Trophy size={24} fill="currentColor" />
                </div>
                <div className="metric-info-lms">
                  <strong>{stats.avgProgress}%</strong>
                  <span>Overall Progress</span>
                </div>
              </div>
            </div>

            {/* Tab: My Enrolled Courses */}
            {studentTab === "my-courses" && (
              <div>
                <h3 style={{ textAlign: "left", fontSize: "1.25rem", marginBottom: "1rem", color: "var(--title)" }}>My learning Path</h3>
                {studentEnrolledCourses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--line)", borderRadius: "1rem", background: "var(--panel)" }}>
                    <GraduationCap size={48} style={{ color: "var(--muted)", marginBottom: "1rem" }} />
                    <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--title)" }}>No enrolled courses found</h4>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0.25rem 0 1.5rem" }}>Browse our catalog and enroll in one click to get started.</p>
                    <button className="primary-button" type="button" onClick={() => setStudentTab("browse")} style={{ minWidth: "10rem", height: "2.6rem" }}>Browse Courses</button>
                  </div>
                ) : (
                  <div className="courses-grid-lms">
                    {studentEnrolledCourses.map((c, index) => {
                      const courseProg = getCourseProgress(user.email, c.id);
                      const pdfs = coursePdfs[c.id] || [];
                      return (
                        <article className="course-card-lms" key={c.id}>
                          <div className={`course-card-banner tone-${(index % 4) + 1}`}>
                            <span className="course-category-tag">{c.category}</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{c.level}</span>
                          </div>
                          <div className="course-card-body">
                            <h3>{c.title}</h3>
                            <p>{c.description}</p>

                            <div className="course-progress-box">
                              <div className="course-progress-header">
                                <span>Course Progress</span>
                                <span>{courseProg}%</span>
                              </div>
                              <div className="progress-track-lms">
                                <div className="progress-fill-lms" style={{ width: `${courseProg}%` }}></div>
                              </div>
                            </div>

                            <div className="course-meta-row">
                              <div className="course-meta-item">
                                <Tv size={14} />
                                <span>{videos.filter(v => v.courseId === c.id).length} Videos</span>
                              </div>
                              <div className="course-meta-item">
                                <Award size={14} />
                                <span>{quizzes.some(q => q.courseId === c.id) ? "1 Quiz" : "No Quiz"}</span>
                              </div>
                            </div>

                            <div className="expanded-videos-list" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                              <h4 style={{ fontSize: "0.88rem", color: "var(--title)", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
                                <BookOpen size={14} />
                                <span>Course Modules</span>
                              </h4>
                              {(courseModules[c.id] || []).length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No modules added yet.</span>
                              ) : (
                                (courseModules[c.id] || []).map((mod, moduleIndex) => {
                                  const modulePdfList = modulePdfs[mod.id] || [];
                                  const moduleQuiz = moduleQuizzes[mod.id];
                                  const latestAttempt = moduleAttempts[mod.id]?.[0];
                                  const studentCourseProgress = progress[user.email]?.[c.id];
                                  const viewedPdfs = studentCourseProgress?.viewedModulePdfs || [];
                                  const savedModuleScore = studentCourseProgress?.moduleQuizScores?.[mod.id];
                                  const showQuiz = activeModuleQuizId === mod.id && moduleQuiz;

                                  return (
                                    <div key={mod.id} style={{ background: "var(--panel-soft)", border: "1px solid var(--line)", borderRadius: "0.5rem", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
                                        <div style={{ textAlign: "left", minWidth: 0 }}>
                                          <strong style={{ color: "var(--title)", fontSize: "0.86rem" }}>{moduleIndex + 1}. {mod.title}</strong>
                                          <p style={{ margin: "0.15rem 0 0", color: "var(--muted)", fontSize: "0.76rem", WebkitLineClamp: 2 }}>{mod.description}</p>
                                        </div>
                                        {savedModuleScore !== undefined || latestAttempt ? (
                                          <span style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.76rem", fontWeight: 800 }}>
                                            <CheckCircle2 size={13} />
                                            Quiz {savedModuleScore ?? latestAttempt.score}%
                                          </span>
                                        ) : null}
                                      </div>

                                      {modulePdfList.length === 0 ? (
                                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>No PDFs for this module yet.</span>
                                      ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                                          {modulePdfList.map((pdf) => {
                                            const viewed = viewedPdfs.includes(pdf.id);
                                            return (
                                              <div key={pdf.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.55rem", fontSize: "0.8rem" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0, color: "var(--title)", fontWeight: 700 }}>
                                                  {viewed ? <CheckCircle2 size={13} /> : <FileText size={13} />}
                                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.filename}</span>
                                                </span>
                                                <span style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                                                  <a
                                                    className="course-pdf-link"
                                                    href={getModulePdfPreviewUrl(mod.id, pdf.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={() => markModulePdfViewed(c.id, pdf.id)}
                                                  >
                                                    <Eye size={13} />
                                                    View
                                                  </a>
                                                  <a className="course-pdf-link" href={getModulePdfDownloadUrl(mod.id, pdf.id)} onClick={() => markModulePdfViewed(c.id, pdf.id)}>
                                                    <Download size={13} />
                                                    Download
                                                  </a>
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                      {moduleQuiz ? (
                                        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.6rem" }}>
                                          {!showQuiz ? (
                                            <button
                                              className="course-card-btn enroll"
                                              type="button"
                                              onClick={() => startModuleQuiz(mod.id)}
                                              style={{ width: "100%", height: "2.35rem", background: "var(--panel)", border: "1px solid var(--line)", color: "var(--text)" }}
                                            >
                                              <ClipboardCheck size={14} />
                                              {latestAttempt || savedModuleScore !== undefined ? "Retake Module Quiz" : "Take Module Quiz"}
                                            </button>
                                          ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", textAlign: "left" }}>
                                              <strong style={{ color: "var(--title)", fontSize: "0.84rem" }}>{moduleQuiz.title}</strong>
                                              {moduleQuiz.questions.map((question, questionIndex) => (
                                                <div key={questionIndex} style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                                                  <span style={{ color: "var(--title)", fontSize: "0.82rem", fontWeight: 700 }}>{question.question}</span>
                                                  {question.options.map((option, optionIndex) => (
                                                    <button
                                                      key={optionIndex}
                                                      type="button"
                                                      className={`quiz-option-btn ${moduleQuizAnswers[questionIndex] === optionIndex ? "selected" : ""}`}
                                                      onClick={() => setModuleQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))}
                                                    >
                                                      <div className="quiz-option-badge">{String.fromCharCode(65 + optionIndex)}</div>
                                                      <span>{option}</span>
                                                    </button>
                                                  ))}
                                                </div>
                                              ))}
                                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="submit-btn" type="button" onClick={() => submitModuleQuiz(c.id, mod.id)}>
                                                  Submit Module Quiz
                                                </button>
                                                <button className="course-pdf-link" type="button" onClick={() => setActiveModuleQuizId(null)}>
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>No quiz for this module yet.</span>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="expanded-videos-list" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
                              <h4 style={{ fontSize: "0.88rem", color: "var(--title)", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
                                <FileText size={14} />
                                <span>Course PDFs</span>
                              </h4>
                              {pdfs.length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No PDF materials uploaded yet.</span>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                  {pdfs.map((pdf) => (
                                    <div
                                      key={pdf.id}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "0.65rem",
                                        background: "var(--panel-soft)",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid var(--line)",
                                        width: "100%",
                                        boxSizing: "border-box"
                                      }}
                                    >
                                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0, fontSize: "0.82rem", color: "var(--title)", fontWeight: 700 }}>
                                        <FileText size={14} />
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.filename}</span>
                                      </span>
                                      <span style={{ display: "flex", gap: "0.45rem", flexShrink: 0 }}>
                                        <a className="course-pdf-link" href={getCoursePdfPreviewUrl(c.id, pdf.id)} target="_blank" rel="noreferrer">
                                          <Eye size={14} />
                                          Preview
                                        </a>
                                        <a className="course-pdf-link" href={getCoursePdfDownloadUrl(c.id, pdf.id)}>
                                          <Download size={14} />
                                          Download
                                        </a>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Standard lessons playlist (still accessible directly on card in dashboard per user design) */}
                            <div className="expanded-videos-list" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
                              <h4 style={{ fontSize: "0.88rem", color: "var(--title)", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, margin: "0 0 0.25rem" }}>
                                <Tv size={14} />
                                <span>Lesson Playlist</span>
                              </h4>
                              {videos.filter(v => v.courseId === c.id).length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No videos added yet.</span>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                                  {videos.filter(v => v.courseId === c.id).map((v) => {
                                    const studentCourseProgress = progress[user.email]?.[c.id];
                                    const watchedList = studentCourseProgress?.watchedVideos || [];
                                    const isWatched = watchedList.includes(v.id);
                                    return (
                                      <div
                                        key={v.id}
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          background: "var(--panel-soft)",
                                          padding: "0.6rem 0.8rem",
                                          borderRadius: "0.5rem",
                                          border: "1px solid var(--line)",
                                          width: "100%",
                                          boxSizing: "border-box"
                                        }}
                                      >
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", maxWidth: "65%", textAlign: "left" }}>
                                          <span style={{ fontSize: "0.82rem", color: "var(--title)", fontWeight: 700, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                            {v.title}
                                          </span>
                                          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>Duration: {v.duration}</span>
                                        </div>

                                        {isWatched ? (
                                          <span style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.78rem", fontWeight: 800 }}>
                                            <CheckCircle2 size={13} />
                                            Done
                                          </span>
                                        ) : (
                                          <button
                                            type="button"
                                            style={{
                                              background: "var(--purple)",
                                              color: "#fff",
                                              border: "none",
                                              padding: "0.35rem 0.65rem",
                                              borderRadius: "0.4rem",
                                              fontSize: "0.72rem",
                                              fontWeight: 800,
                                              cursor: "pointer",
                                              transition: "opacity 0.2s"
                                            }}
                                            onClick={() => markVideoAsWatched(c.id, v.id)}
                                          >
                                            Complete
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* As per previous instruction, card footer navigation buttons themselves are disabled */}
                          <div className="course-card-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                            <button
                              className="course-card-btn study"
                              type="button"
                              disabled
                              style={{ width: "100%", height: "2.5rem", opacity: 0.6, cursor: "not-allowed" }}
                            >
                              <Play size={14} fill="currentColor" />
                              View the Videos
                            </button>

                            <button
                              className="course-card-btn enroll"
                              type="button"
                              onClick={() => {
                                const quiz = quizzes.find((q) => q.courseId === c.id);
                                if (!quiz || quiz.questions.length === 0) {
                                  showToast("No quiz available for this course yet.", "success");
                                  return;
                                }
                                setActiveCourseId(c.id);
                                startQuiz(c.id);
                              }}
                              style={{ width: "100%", height: "2.5rem", background: "var(--panel-soft)", border: "1px solid var(--line)", color: "var(--text)", cursor: "pointer" }}
                            >
                              <ClipboardCheck size={14} />
                              Take Quiz
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Browse Courses catalog */}
            {studentTab === "browse" && (
              <div>
                <div className="catalog-toolbar">
                  <div>
                    <h3>Browse Course Catalog</h3>
                    <span>Search by course name, description, category, or details.</span>
                  </div>
                  <label className="catalog-search" htmlFor="course-search">
                    <Search size={18} />
                    <input
                      id="course-search"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search courses"
                    />
                  </label>
                </div>

                {browsedCourses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--line)", borderRadius: "1rem", background: "var(--panel)" }}>
                    <BookOpen size={44} style={{ color: "var(--muted)", marginBottom: "1rem" }} />
                    <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--title)" }}>No matching courses</h4>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0.25rem 0 0" }}>Try searching with another course name or topic.</p>
                  </div>
                ) : (
                  <div className="courses-grid-lms">
                    {browsedCourses.map((c, index) => {
                      const isEnrolled = enrollments.some(
                        (e) => e.courseId === c.id && e.studentEmail === user.email
                      );
                      return (
                        <article className="course-card-lms" key={c.id}>
                          <div className={`course-card-banner tone-${(index % 4) + 1}`}>
                            <span className="course-category-tag">{c.category}</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{c.level}</span>
                          </div>
                          <div className="course-card-body">
                            <h3>{c.title}</h3>
                            <p>{c.description}</p>
                            {c.details && (
                              <p style={{ WebkitLineClamp: 3, marginTop: 0 }}>{c.details}</p>
                            )}
                            <div className="course-meta-row">
                              <div className="course-meta-item">
                                <Tv size={14} />
                                <span>{c.lessonsCount || videos.filter(v => v.courseId === c.id).length} Lessons</span>
                              </div>
                              <div className="course-meta-item">
                                <Star size={14} />
                                <span>{c.rating || "5.0"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="course-card-footer">
                            <button
                              className={`course-card-btn ${isEnrolled ? "enrolled-badge" : "enroll"}`}
                              type="button"
                              disabled={isEnrolled}
                              onClick={() => enrollInCourse(c.id)}
                            >
                              {isEnrolled ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                              {isEnrolled ? "Already Enrolled" : "Enroll in Course"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default StudentDashboard;
