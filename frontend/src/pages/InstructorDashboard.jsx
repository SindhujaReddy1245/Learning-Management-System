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
  GraduationCap,
  FileText,
  Eye,
  Upload,
} from "lucide-react";
import {
  createCourse,
  getApiBaseUrl,
  getCoursePdfPreviewUrl,
  uploadCoursePdf,
  saveCourseQuiz,
  getCourseModules,
  createCourseModule,
  uploadModulePdf,
  getModulePdfs,
  createModuleQuiz,
  getModuleQuiz,
  getModulePdfPreviewUrl,
} from "../api";

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
  coursePdfs,
  setCoursePdfs,
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
  const [uploadingPdfCourseId, setUploadingPdfCourseId] = useState(null);
  const [modules, setModules] = useState([]);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModuleOrder, setNewModuleOrder] = useState(1);
  const [modulePdfs, setModulePdfs] = useState({});
  const [moduleQuizzes, setModuleQuizzes] = useState({});
  const [uploadingModulePdfId, setUploadingModulePdfId] = useState(null);
  const [activeModuleQuizId, setActiveModuleQuizId] = useState(null);
  const [moduleQuizTitle, setModuleQuizTitle] = useState("");
  const [moduleQuizQuestion, setModuleQuizQuestion] = useState("");
  const [moduleQuizOptions, setModuleQuizOptions] = useState(["", "", "", ""]);
  const [moduleQuizCorrect, setModuleQuizCorrect] = useState(0);
  const [newModuleCourseId, setNewModuleCourseId] = useState("");

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

  // Dynamic Quiz Creator States
  const [activeQuizCourse, setActiveQuizCourse] = useState(null);
  const [dynamicQuizTitle, setDynamicQuizTitle] = useState("");
  const [dynamicQuestions, setDynamicQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);

  // Set default course options in instructor dropdowns when course list changes
  useEffect(() => {
    if (courses.length > 0) {
      if (!newVideoCourseId) setNewVideoCourseId(courses[0].id);
      if (!newQuizCourseId) setNewQuizCourseId(courses[0].id);
    }
  }, [courses]);

  useEffect(() => {
    if (instructorSelectedCourseId) {
      getCourseModules(instructorSelectedCourseId)
        .then(setModules)
        .catch((err) => console.error("Failed to load modules", err));
    } else {
      setModules([]);
    }
  }, [instructorSelectedCourseId]);

  useEffect(() => {
    if (modules.length === 0) return;

    modules.forEach((mod) => {
      getModulePdfs(mod.id)
        .then((pdfs) => {
          setModulePdfs((prev) => ({ ...prev, [mod.id]: pdfs }));
        })
        .catch((err) => console.error("Failed to load module PDFs", err));

      getModuleQuiz(mod.id)
        .then((quiz) => {
          setModuleQuizzes((prev) => ({ ...prev, [mod.id]: quiz }));
        })
        .catch(() => {
          setModuleQuizzes((prev) => ({ ...prev, [mod.id]: null }));
        });
    });
  }, [modules]);

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

  // Instructor Create Module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleCourseId) {
      showToast("Select a course first", "error");
      return;
    }
    if (!newModuleTitle.trim()) {
      showToast("Module title required", "error");
      return;
    }
    if (!newModuleDesc.trim()) {
      showToast("Module description required", "error");
      return;
    }
    if (newModuleOrder < 1) {
      showToast("Module order must be 1 or higher", "error");
      return;
    }
    const payload = {
      title: newModuleTitle.trim(),
      description: newModuleDesc.trim(),
      order: newModuleOrder,
    };
    try {
      const saved = await createCourseModule(newModuleCourseId, payload);
      setModules((prev) => [...prev, saved]);
      showToast("Module created", "success");
      setNewModuleTitle("");
      setNewModuleDesc("");
      setNewModuleOrder(1);
      setNewModuleCourseId("");
      setInstructorTab("manage-courses");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to create module", "error");
    }
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
      showToast("Course created successfully!", "success");
    } catch (error) {
      console.error(error);
      setCourses((prev) => [...prev, fallbackCourse]);
      showToast(`Could not reach backend (${getApiBaseUrl()}). Course saved locally.`, "success");
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

  const handleSelectCourseForQuiz = (course) => {
    setActiveQuizCourse(course);
    const existing = quizzes.find(q => q.courseId === course.id);
    if (existing) {
      setDynamicQuizTitle(existing.title || "");
      setDynamicQuestions(existing.questions || [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    } else {
      setDynamicQuizTitle(course.title + " Quiz");
      setDynamicQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    }
  };

  const handleAddQuestion = () => {
    setDynamicQuestions(prev => [...prev, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    setDynamicQuestions(prev => prev.map((q, idx) => {
      if (idx === index) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setDynamicQuestions(prev => prev.map((q, idx) => {
      if (idx === qIndex) {
        const newOpts = [...q.options];
        newOpts[oIndex] = value;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (index) => {
    setDynamicQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveDynamicQuiz = async (e) => {
    e.preventDefault();
    if (!activeQuizCourse) return;
    if (!dynamicQuizTitle.trim()) {
      showToast("Please enter a quiz title", "success");
      return;
    }

    // Validate that questions are filled out
    for (let i = 0; i < dynamicQuestions.length; i++) {
      const q = dynamicQuestions[i];
      if (!q.question.trim()) {
        showToast(`Please enter question text for Question ${i + 1}`, "success");
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          showToast(`Please fill Option ${String.fromCharCode(65 + j)} for Question ${i + 1}`, "success");
          return;
        }
      }
    }

    const payload = {
      title: dynamicQuizTitle,
      questions: dynamicQuestions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        correctAnswer: parseInt(q.correctAnswer)
      }))
    };

    const isMockCourse = String(activeQuizCourse.id).startsWith("c_") || ["c1", "c2", "c3"].includes(activeQuizCourse.id);

    try {
      setIsSavingQuiz(true);
      let savedQuiz;
      if (isMockCourse) {
        savedQuiz = {
          id: "q_" + Date.now(),
          courseId: activeQuizCourse.id,
          ...payload
        };
        setQuizzes((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((q) => q.courseId === activeQuizCourse.id);
          if (idx >= 0) copy[idx] = savedQuiz;
          else copy.push(savedQuiz);
          return copy;
        });
        showToast("Quiz updated successfully in local session!", "success");
      } else {
        savedQuiz = await saveCourseQuiz(activeQuizCourse.id, payload);
        setQuizzes((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((q) => q.courseId === activeQuizCourse.id);
          if (idx >= 0) copy[idx] = savedQuiz;
          else copy.push(savedQuiz);
          return copy;
        });
        showToast("Quiz saved to database successfully!", "success");
      }
      setActiveQuizCourse(null);
    } catch (err) {
      console.error(err);
      showToast(`Failed to save quiz: ${err.message}`, "error");
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const handleUploadCoursePdf = async (courseId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file.", "success");
      return;
    }

    try {
      setUploadingPdfCourseId(courseId);
      const savedPdf = await uploadCoursePdf(courseId, file);
      setCoursePdfs((prev) => ({
        ...prev,
        [courseId]: [savedPdf, ...(prev[courseId] || [])],
      }));
      showToast("PDF uploaded successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast(`PDF upload failed: ${error.message}`, "error");
    } finally {
      setUploadingPdfCourseId(null);
    }
  };

  const handleUploadModulePdf = async (moduleId, file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file.", "error");
      return;
    }

    try {
      setUploadingModulePdfId(moduleId);
      const savedPdf = await uploadModulePdf(moduleId, file);
      setModulePdfs((prev) => ({
        ...prev,
        [moduleId]: [savedPdf, ...(prev[moduleId] || [])],
      }));
      showToast("Module PDF uploaded successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast(`Module PDF upload failed: ${error.message}`, "error");
    } finally {
      setUploadingModulePdfId(null);
    }
  };

  const startModuleQuizEditor = (moduleId) => {
    const existingQuiz = moduleQuizzes[moduleId];
    const firstQuestion = existingQuiz?.questions?.[0];
    setActiveModuleQuizId(moduleId);
    setModuleQuizTitle(existingQuiz?.title || "");
    setModuleQuizQuestion(firstQuestion?.question || "");
    setModuleQuizOptions(firstQuestion?.options || ["", "", "", ""]);
    setModuleQuizCorrect(firstQuestion?.correctAnswer || 0);
  };

  const handleSaveModuleQuiz = async (moduleId) => {
    if (!moduleQuizTitle.trim()) {
      showToast("Module quiz title required", "error");
      return;
    }
    if (!moduleQuizQuestion.trim()) {
      showToast("Module quiz question required", "error");
      return;
    }
    if (moduleQuizOptions.some((option) => !option.trim())) {
      showToast("Please fill all module quiz options", "error");
      return;
    }

    const payload = {
      title: moduleQuizTitle.trim(),
      questions: [
        {
          question: moduleQuizQuestion.trim(),
          options: moduleQuizOptions.map((option) => option.trim()),
          correctAnswer: Number(moduleQuizCorrect),
        },
      ],
    };

    try {
      const savedQuiz = await createModuleQuiz(moduleId, payload);
      setModuleQuizzes((prev) => ({ ...prev, [moduleId]: savedQuiz }));
      setActiveModuleQuizId(null);
      setModuleQuizTitle("");
      setModuleQuizQuestion("");
      setModuleQuizOptions(["", "", "", ""]);
      setModuleQuizCorrect(0);
      showToast("Module quiz saved successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast(`Module quiz save failed: ${error.message}`, "error");
    }
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
    // Module loading moved to top-level useEffect
    const courseQuiz = quizzes.find((q) => q.courseId === instructorSelectedCourseId);
    const courseEnrolls = enrolledStudents.filter((s) => s.courseId === instructorSelectedCourseId);
    const pdfs = coursePdfs[instructorSelectedCourseId] || [];

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
          {/* Modules List */}
          <div className="instructor-detail-card">
            <h4>Modules ({modules.length})</h4>
            {modules.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>No modules added yet.</span>
            ) : (
              <div className="instructor-detail-list" style={{ gap: "0.85rem" }}>
                {modules.map((mod, idx) => (
                  <div key={mod.id} className="instructor-detail-item" style={{ alignItems: "stretch", flexDirection: "column", gap: "0.7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
                      <span>{idx + 1}. {mod.title}</span>
                      <strong>Order {mod.order}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <label className="course-pdf-upload-btn" htmlFor={`module-pdf-${mod.id}`} style={{ width: "fit-content" }}>
                        <Upload size={14} />
                        {uploadingModulePdfId === mod.id ? "Uploading..." : "Upload PDF"}
                      </label>
                      <input
                        id={`module-pdf-${mod.id}`}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        disabled={uploadingModulePdfId === mod.id}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          handleUploadModulePdf(mod.id, file);
                          event.target.value = "";
                        }}
                      />
                      <button
                        className="course-pdf-link"
                        type="button"
                        onClick={() => startModuleQuizEditor(mod.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <ClipboardCheck size={14} />
                        {moduleQuizzes[mod.id] ? "Edit Quiz" : "Create Quiz"}
                      </button>
                    </div>

                    {(modulePdfs[mod.id] || []).length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                        {(modulePdfs[mod.id] || []).map((pdf) => (
                          <div key={pdf.id} style={{ display: "flex", justifyContent: "space-between", gap: "0.65rem", alignItems: "center", fontSize: "0.8rem" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0 }}>
                              <FileText size={13} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pdf.filename}</span>
                            </span>
                            <a className="course-pdf-link" href={getModulePdfPreviewUrl(mod.id, pdf.id)} target="_blank" rel="noreferrer">
                              <Eye size={13} />
                              Preview
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {moduleQuizzes[mod.id] && activeModuleQuizId !== mod.id && (
                      <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                        Quiz ready: {moduleQuizzes[mod.id].title}
                      </span>
                    )}

                    {activeModuleQuizId === mod.id && (
                      <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <input
                          className="form-input"
                          value={moduleQuizTitle}
                          onChange={(e) => setModuleQuizTitle(e.target.value)}
                          placeholder="Quiz title"
                        />
                        <input
                          className="form-input"
                          value={moduleQuizQuestion}
                          onChange={(e) => setModuleQuizQuestion(e.target.value)}
                          placeholder="Question"
                        />
                        {moduleQuizOptions.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            className="form-input"
                            value={option}
                            onChange={(e) => {
                              const nextOptions = [...moduleQuizOptions];
                              nextOptions[optionIndex] = e.target.value;
                              setModuleQuizOptions(nextOptions);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          />
                        ))}
                        <select
                          className="form-select"
                          value={moduleQuizCorrect}
                          onChange={(e) => setModuleQuizCorrect(Number(e.target.value))}
                        >
                          {moduleQuizOptions.map((_, optionIndex) => (
                            <option key={optionIndex} value={optionIndex}>
                              Correct: Option {String.fromCharCode(65 + optionIndex)}
                            </option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="form-submit-btn" type="button" onClick={() => handleSaveModuleQuiz(mod.id)}>
                            Save Module Quiz
                          </button>
                          <button className="course-pdf-link" type="button" onClick={() => setActiveModuleQuizId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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

          <div className="instructor-detail-card">
            <h4>Course PDF Materials ({pdfs.length})</h4>
            <label className="course-pdf-upload-btn" htmlFor={`course-pdf-${instructorSelectedCourseId}`}>
              <Upload size={15} />
              {uploadingPdfCourseId === instructorSelectedCourseId ? "Uploading..." : "Upload PDF"}
            </label>
            <input
              id={`course-pdf-${instructorSelectedCourseId}`}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              disabled={uploadingPdfCourseId === instructorSelectedCourseId}
              onChange={(event) => {
                const file = event.target.files?.[0];
                handleUploadCoursePdf(instructorSelectedCourseId, file);
                event.target.value = "";
              }}
            />

            {pdfs.length === 0 ? (
              <span style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.75rem", display: "block" }}>
                No PDF materials uploaded yet.
              </span>
            ) : (
              <div className="instructor-detail-list" style={{ marginTop: "0.75rem" }}>
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="instructor-detail-item">
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0 }}>
                      <FileText size={14} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pdf.filename}
                      </span>
                    </span>
                    <a
                      className="course-pdf-link"
                      href={getCoursePdfPreviewUrl(instructorSelectedCourseId, pdf.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye size={14} />
                      Preview
                    </a>
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
         {/* Nav: Add Module Tab */}
            <button
              className={`dashboard-tab-btn ${instructorTab === "add-module" ? "active" : ""}`}
              onClick={() => setInstructorTab("add-module")}
            >
              <PlusCircle size={16} />
              Add Module
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

        {/* Tab: Add Module */}
        {instructorTab === "add-module" && (
          <form className="form-dashboard-card" onSubmit={handleCreateModule}>
            <h3>Create a Module</h3>
            <p>Assign a module to a course.</p>

            <div className="form-group">
              <label className="form-label" htmlFor="module-course">Course</label>
              <select
                id="module-course"
                className="form-select"
                value={newModuleCourseId}
                onChange={(e) => setNewModuleCourseId(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="module-title">Module Title</label>
              <input
                id="module-title"
                className="form-input"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Module name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="module-desc">Description</label>
              <textarea
                id="module-desc"
                className="form-textarea"
                rows="3"
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                placeholder="Module description"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="module-order">Order</label>
              <input
                id="module-order"
                type="number"
                className="form-input"
                min="1"
                value={newModuleOrder}
                onChange={(e) => setNewModuleOrder(parseInt(e.target.value) || 0)}
                placeholder="1"
              />
            </div>

            <button className="form-submit-btn" type="submit">Create Module</button>
          </form>
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
          <div style={{ width: "100%" }}>
            {!activeQuizCourse ? (
              <div className="form-dashboard-card" style={{ maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Select Course to Add/Manage Quiz</h3>
                <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Select one of your courses below to configure its challenge assessment.</p>
                
                {courses.filter(c => c.instructorId === user.uid || c.instructor === user.email).length === 0 ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: "1rem" }}>
                    You have not added any courses yet. Please create a course first.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {courses.filter(c => c.instructorId === user.uid || c.instructor === user.email).map((course) => {
                      const hasQuiz = quizzes.some(q => q.courseId === course.id);
                      return (
                        <div key={course.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", border: "1px solid var(--line)", borderRadius: "0.75rem", background: "var(--panel-soft)" }}>
                          <div style={{ textAlign: "left" }}>
                            <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--title)" }}>{course.title}</h4>
                            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Category: {course.category} • Level: {course.level}</span>
                          </div>
                          <button
                            className="primary-button"
                            type="button"
                            onClick={() => handleSelectCourseForQuiz(course)}
                            style={{ minWidth: "8rem", padding: "0.6rem 1rem", fontSize: "0.85rem", height: "fit-content", background: hasQuiz ? "var(--panel)" : "var(--purple)", border: hasQuiz ? "1px solid var(--line)" : "none", color: hasQuiz ? "var(--text)" : "white" }}
                          >
                            {hasQuiz ? "Edit Quiz" : "Add Quiz"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <form className="form-dashboard-card" onSubmit={handleSaveDynamicQuiz} style={{ maxWidth: "46rem", margin: "0 auto", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setActiveQuizCourse(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 0 }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 style={{ margin: 0 }}>Configure Quiz for: {activeQuizCourse.title}</h3>
                </div>
                <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Specify the quiz name, add multiple-choice questions, options, and assign correct answers.</p>

                <div className="form-group">
                  <label className="form-label" htmlFor="quiz-title-input">Quiz Title</label>
                  <input
                    id="quiz-title-input"
                    className="form-input"
                    value={dynamicQuizTitle}
                    onChange={(e) => setDynamicQuizTitle(e.target.value)}
                    placeholder="Example: Final Course Assessment"
                  />
                </div>

                <div style={{ marginTop: "2rem" }}>
                  <h4 style={{ fontSize: "1.15rem", marginBottom: "1rem", color: "var(--title)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Questions ({dynamicQuestions.length})</span>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      style={{ background: "var(--purple)", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "0.4rem", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      + Add Question
                    </button>
                  </h4>

                  {dynamicQuestions.map((q, idx) => (
                    <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--line)", borderRadius: "0.75rem", background: "var(--panel-soft)", marginBottom: "1.5rem", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <span style={{ fontWeight: 800, color: "var(--purple)", fontSize: "0.95rem" }}>Question {idx + 1}</span>
                        {dynamicQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
                          >
                            Delete Question
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor={`q-text-${idx}`}>Question Text</label>
                        <input
                          id={`q-text-${idx}`}
                          className="form-input"
                          value={q.question}
                          onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                          placeholder="Example: Which of these is a standard React hook?"
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                        {q.options.map((opt, oIdx) => (
                          <div className="form-group" key={oIdx} style={{ margin: 0 }}>
                            <label className="form-label" htmlFor={`q-${idx}-opt-${oIdx}`}>Option {String.fromCharCode(65 + oIdx)}</label>
                            <input
                              id={`q-${idx}-opt-${oIdx}`}
                              className="form-input"
                              value={opt}
                              onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="form-group" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
                        <label className="form-label" htmlFor={`q-correct-${idx}`}>Select Correct Option</label>
                        <select
                          id={`q-correct-${idx}`}
                          className="form-select"
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(idx, "correctAnswer", parseInt(e.target.value))}
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                  <button
                    className="submit-btn"
                    type="submit"
                    disabled={isSavingQuiz}
                    style={{ margin: 0, flex: 1, background: "var(--purple)", color: "white" }}
                  >
                    {isSavingQuiz ? "Saving..." : "Save Quiz to Database"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveQuizCourse(null)}
                    style={{ flex: 1, background: "var(--panel-soft)", border: "1px solid var(--line)", color: "var(--text)", borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
