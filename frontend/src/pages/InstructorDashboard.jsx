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
import { createCourse } from "../api";

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
  const [newCourseDetails, setNewCourseDetails] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

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
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newCourseDesc.trim() || !newCourseCategory.trim() || !newCourseDuration.trim() || !newCourseDetails.trim()) {
      showToast("Please fill all course fields", "success");
      return;
    }

    const coursePayload = {
      title: newCourseTitle,
      description: newCourseDesc,
      level: newCourseLevel,
      instructorId: user.uid,
      instructor: user.email,
      category: newCourseCategory,
      duration: newCourseDuration,
      details: newCourseDetails,
    };

    const fallbackCourse = {
      ...coursePayload,
      id: "c_" + Date.now(),
      lessonsCount: 0,
      rating: "5.0",
      learnersCount: 0,
    };

    try {
      setIsCreatingCourse(true);
      const savedCourse = await createCourse(coursePayload);
      setCourses((prev) => [...prev, savedCourse]);
    } catch (error) {
      console.error(error);
      setCourses((prev) => [...prev, fallbackCourse]);
      showToast("Backend is offline, course saved locally for now.", "success");
    } finally {
      setIsCreatingCourse(false);
    }

    // Reset inputs
    setNewCourseTitle("");
    setNewCourseDesc("");
    setNewCourseLevel("Beginner");
    setNewCourseCategory("Web Development");
    setNewCourseDuration("5 hours");
    setNewCourseDetails("");

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
          courses.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: "1rem" }}>
              No courses created yet.
            </div>
          ) : (
            <div className="courses-grid-lms">
              {courses.map((course, index) => (
                <article className="course-card-lms" key={course.id}>
                  <div className={`course-card-banner tone-${(index % 4) + 1}`}>
                    <span className="course-category-tag">{course.category}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{course.level}</span>
                  </div>
                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    {course.details && (
                      <p style={{ WebkitLineClamp: 3, marginTop: 0 }}>{course.details}</p>
                    )}
                    <div className="course-meta-row">
                      <div className="course-meta-item">
                        <BookOpen size={14} />
                        <span>{course.duration}</span>
                      </div>
                      <div className="course-meta-item">
                        <Star size={14} />
                        <span>{course.rating || "5.0"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="course-card-footer">
                    <button
                      className="course-card-btn study"
                      type="button"
                      onClick={() => setInstructorSelectedCourseId(course.id)}
                    >
                      <GraduationCap size={14} />
                      View Course Workspace
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {/* Instructor course specific details workspace */}
        {instructorTab === "manage-courses" && instructorSelectedCourseId && (
          renderInstructorCourseWorkspace()
        )}

        {/* Tab: Add Course */}
        {instructorTab === "add-course" && (
          <form className="form-dashboard-card" onSubmit={handleCreateCourse}>
            <h3>Create a Course</h3>
            <p>Add the course details students will see in the catalog.</p>

            <div className="form-group">
              <label className="form-label" htmlFor="course-title">Course Name</label>
              <input
                id="course-title"
                className="form-input"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Example: Full Stack React with FastAPI"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-description">Course Description</label>
              <textarea
                id="course-description"
                className="form-textarea"
                rows="4"
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                placeholder="Short summary of what students will learn"
              />
            </div>

            <div className="form-grid-two">
              <div className="form-group">
                <label className="form-label" htmlFor="course-category">Category</label>
                <input
                  id="course-category"
                  className="form-input"
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value)}
                  placeholder="Web Development"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="course-level">Level</label>
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
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-duration">Duration</label>
              <input
                id="course-duration"
                className="form-input"
                value={newCourseDuration}
                onChange={(e) => setNewCourseDuration(e.target.value)}
                placeholder="Example: 6 hours"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-details">More Details About Course</label>
              <textarea
                id="course-details"
                className="form-textarea"
                rows="5"
                value={newCourseDetails}
                onChange={(e) => setNewCourseDetails(e.target.value)}
                placeholder="Add syllabus, outcomes, prerequisites, projects, or other notes"
              />
            </div>

            <button className="submit-btn" type="submit" disabled={isCreatingCourse}>
              <PlusCircle size={17} />
              {isCreatingCourse ? "Creating..." : "Create Course"}
            </button>
          </form>
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
