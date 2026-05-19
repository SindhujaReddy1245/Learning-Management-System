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
          <div>
            <h3 style={{ textAlign: "left", fontSize: "1.25rem", marginBottom: "1rem", color: "var(--title)" }}>Platform Content Outline</h3>
            <div className="courses-grid-lms">
              {courses.map((c, index) => {
                const courseVideos = videos.filter((v) => v.courseId === c.id);
                const courseQuiz = quizzes.find((q) => q.courseId === c.id);
                const enrolledCount = enrolledStudents.filter((s) => s.courseId === c.id).length;

                return (
                  <article className="course-card-lms" key={c.id}>
                    <div className={`course-card-banner tone-${(index % 4) + 1}`}>
                      <span className="course-category-tag">{c.category}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{c.level}</span>
                    </div>
                    <div className="course-card-body">
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>

                      <div className="course-meta-row">
                        <div className="course-meta-item">
                          <Users size={14} />
                          <span>{enrolledCount} Students</span>
                        </div>
                        <div className="course-meta-item">
                          <Tv size={14} />
                          <span>{courseVideos.length} Videos</span>
                        </div>
                      </div>
                      <div className="course-meta-row" style={{ border: "none", paddingTop: "0.5rem", marginTop: 0 }}>
                        <div className="course-meta-item">
                          <ClipboardCheck size={14} />
                          <span>Quiz: {courseQuiz ? "Set Up" : "Not Set"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Fully implemented active instructor workspace action */}
                    <div className="course-card-footer" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                      <button
                        className="course-card-btn study"
                        type="button"
                        style={{ width: "100%", height: "2.6rem", background: "var(--purple)", color: "white", border: "none" }}
                        onClick={() => setInstructorSelectedCourseId(c.id)}
                      >
                        <span>Manage & View Course Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructor course specific details workspace */}
        {instructorTab === "manage-courses" && instructorSelectedCourseId && (
          renderInstructorCourseWorkspace()
        )}

        {/* Tab: Add Course */}
        {instructorTab === "add-course" && (
          <div className="form-dashboard-card">
            <h3>Create New Course</h3>
            <p>Add a structured course outline with visual banners instantly available for study.</p>

            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label" htmlFor="course-title">Course Title</label>
                <input
                  id="course-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Next.js Architecture"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course-desc">Detailed Description</label>
                <textarea
                  id="course-desc"
                  rows="3"
                  className="form-textarea"
                  placeholder="Provide a comprehensive summary of what student learns."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course-level">Course Level</label>
                  <select
                    id="course-level"
                    className="form-select"
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course-dur">Duration Estimate</label>
                  <input
                    id="course-dur"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 5 hours"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course-cat">Course Category</label>
                <select
                  id="course-cat"
                  className="form-select"
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                >
                  <option>Web Development</option>
                  <option>Artificial Intelligence</option>
                  <option>Design</option>
                  <option>Programming</option>
                  <option>Business</option>
                </select>
              </div>

              <button type="submit" className="submit-btn" style={{ background: "var(--purple)", color: "#fff", marginTop: "1rem" }}>
                <PlusCircle size={16} />
                <span>Create Course</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab: Add Video */}
        {instructorTab === "add-video" && (
          <div className="form-dashboard-card">
            <h3>Upload Video Lesson</h3>
            <p>Bind video files with specific course playlists instantly updated in classrooms.</p>

            {courses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <p style={{ color: "var(--orange)" }}>Please create a course outline first before adding lessons!</p>
                <button className="primary-button" type="button" onClick={() => setInstructorTab("add-course")}>Create Course</button>
              </div>
            ) : (
              <form onSubmit={handleCreateVideo}>
                <div className="form-group">
                  <label className="form-label" htmlFor="video-course">Select Destination Course</label>
                  <select
                    id="video-course"
                    className="form-select"
                    value={newVideoCourseId}
                    onChange={(e) => setNewVideoCourseId(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="video-title">Video Lesson Title</label>
                  <input
                    id="video-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Working with React Hooks"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="video-desc">Short description</label>
                  <textarea
                    id="video-desc"
                    rows="2"
                    className="form-textarea"
                    placeholder="e.g. In this video, we explain useEffect hooks dependency arrays."
                    value={newVideoDesc}
                    onChange={(e) => setNewVideoDesc(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="video-dur">Lesson Duration</label>
                    <input
                      id="video-dur"
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10:45"
                      value={newVideoDuration}
                      onChange={(e) => setNewVideoDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="video-url">Video Source URL (dummy MP4)</label>
                    <input
                      id="video-url"
                      type="text"
                      className="form-input"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ background: "var(--purple)", color: "#fff", marginTop: "1rem" }}>
                  <Tv size={16} />
                  <span>Upload Lesson Video</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab: Add Quiz */}
        {instructorTab === "add-quiz" && (
          <div className="form-dashboard-card" style={{ maxWidth: "42rem" }}>
            <h3>Set Course Challenge Quiz</h3>
            <p>Setup standard challenge questions with score evaluations for enrolled learners.</p>

            {courses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <p style={{ color: "var(--orange)" }}>Create at least one course structure first!</p>
                <button className="primary-button" type="button" onClick={() => setInstructorTab("add-course")}>Create Course</button>
              </div>
            ) : (
              <form onSubmit={handleCreateQuiz}>
                <div className="form-group">
                  <label className="form-label" htmlFor="quiz-course">Select Destination Course</label>
                  <select
                    id="quiz-course"
                    className="form-select"
                    value={newQuizCourseId}
                    onChange={(e) => setNewQuizCourseId(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="quiz-title">Quiz Challenge Title</label>
                  <input
                    id="quiz-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Quiz Session"
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Question 1 Builder */}
                <div className="questions-builder-container">
                  <div className="questions-builder-header">Question Item 1 (Required)</div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Question content text"
                      value={quizQuestion1}
                      onChange={(e) => setQuizQuestion1(e.target.value)}
                      required
                    />
                  </div>
                  <div className="options-builder-grid">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option A"
                      value={quizQ1Opt1}
                      onChange={(e) => setQuizQ1Opt1(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option B"
                      value={quizQ1Opt2}
                      onChange={(e) => setQuizQ1Opt2(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option C"
                      value={quizQ1Opt3}
                      onChange={(e) => setQuizQ1Opt3(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option D"
                      value={quizQ1Opt4}
                      onChange={(e) => setQuizQ1Opt4(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="q1-correct">Correct Option index</label>
                    <select
                      id="q1-correct"
                      className="form-select"
                      value={quizQ1Correct}
                      onChange={(e) => setQuizQ1Correct(parseInt(e.target.value))}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>

                {/* Question 2 Builder */}
                <div className="questions-builder-container">
                  <div className="questions-builder-header">Question Item 2 (Optional)</div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Question content text"
                      value={quizQuestion2}
                      onChange={(e) => setQuizQuestion2(e.target.value)}
                    />
                  </div>
                  <div className="options-builder-grid">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option A"
                      value={quizQ2Opt1}
                      onChange={(e) => setQuizQ2Opt1(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option B"
                      value={quizQ2Opt2}
                      onChange={(e) => setQuizQ2Opt2(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option C"
                      value={quizQ2Opt3}
                      onChange={(e) => setQuizQ2Opt3(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Option D"
                      value={quizQ2Opt4}
                      onChange={(e) => setQuizQ2Opt4(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="q2-correct">Correct Option index</label>
                    <select
                      id="q2-correct"
                      className="form-select"
                      value={quizQ2Correct}
                      onChange={(e) => setQuizQ2Correct(parseInt(e.target.value))}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="submit-btn" style={{ background: "var(--purple)", color: "#fff", marginTop: "1rem" }}>
                  <ClipboardCheck size={16} />
                  <span>Generate Course Quiz</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab: Enrolled Students List */}
        {instructorTab === "students" && (
          <div className="enrolled-students-card">
            <h3>Global Enrolled Learners List</h3>

            <div className="table-responsive">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>Learner Details</th>
                    <th>Enrolled Course</th>
                    <th>Learning progress</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((s, idx) => {
                    const courseObj = courses.find((c) => c.id === s.courseId);
                    return (
                      <tr key={idx}>
                        <td>
                          <div className="student-row-info">
                            <div className="student-small-avatar">
                              {s.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="student-row-details">
                              <strong>{s.name}</strong>
                              <span>{s.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: "0.9rem", color: "var(--title)" }}>
                            {courseObj ? courseObj.title : "React Fundamentals"}
                          </strong>
                        </td>
                        <td>
                          <div style={{ width: "130px" }}>
                            <div className="progress-track-lms">
                              <div className="progress-fill-lms" style={{ width: `${s.progress}%` }}></div>
                            </div>
                            <span className="progress-cell-text">{s.progress}% Finished</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-lms ${s.progress === 100 ? "completed" : "active"}`}>
                            {s.progress === 100 ? "Completed" : "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default InstructorDashboard;
