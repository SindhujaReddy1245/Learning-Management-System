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
} from 'lucide-react';
import { useEffect, useState } from 'react';

const products = [
  {
    title: 'Course Builder',
    text: 'Create structured courses, chapters, and lesson flows for every subject.',
    icon: BookOpen,
  },
  {
    title: 'Quiz Studio',
    text: 'Add topic-wise quizzes with quick scoring and clear learner feedback.',
    icon: ClipboardCheck,
  },
  {
    title: 'AI Study Assistant',
    text: 'Help students understand hard topics with hints, summaries, and guidance.',
    icon: Bot,
  },
];

const features = [
  'Courses and modules',
  'Quizzes',
  'AI tutor assistant',
  'Auto notes generation',
  'Progress analytics',
];

const overview = [
  { label: 'Total Learners', value: '120+', icon: Users },
  { label: 'Courses', value: '45+', icon: BookOpen },
  { label: 'Quizzes', value: '150+', icon: ClipboardCheck },
  { label: 'Average Rating', value: '4.8 / 5', icon: Star },
];

const topCourses = [
  { title: 'AI Fundamentals', level: 'Beginner', learners: '120 Learners', rating: '4.7', icon: Bot },
  { title: 'Web Development', level: 'Intermediate', learners: '95 Learners', rating: '4.8', icon: FileText },
  { title: 'Data Science Basics', level: 'Beginner', learners: '80 Learners', rating: '4.6', icon: BarChart3 },
  { title: 'UI/UX Design', level: 'Intermediate', learners: '60 Learners', rating: '4.9', icon: Palette },
];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }

  return (
    <main className="page-shell" id="home">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="LearnFlow home">
          <span className="brand-icon">
            <Zap size={20} fill="currentColor" />
          </span>
          <span>LearnFlow LMS</span>
        </a>

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
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
          >
            {isDark ? <Lightbulb size={17} /> : <Moon size={17} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
          <a className="start-button" href="#products">
            Start
          </a>
        </div>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Smart Learning Management</p>
          <h1 id="hero-title">Simple learning tools for modern students.</h1>
          <p className="hero-text">
            Create courses, manage modules, run quizzes, generate notes, and track
            progress in one easy dashboard without extra clutter.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#products">
              Start free
            </a>
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

        <PlatformOverview />
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
        <div>
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
        <div>
          <p className="eyebrow">About</p>
          <h2>Designed for focused learning.</h2>
        </div>
        <p>
          LearnFlow keeps the first experience direct: students see what to study,
          practice with quizzes, ask the AI tutor for help, and understand progress
          from the same landing flow.
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
            <a className="primary-button" href="#products">
              Get Started Free
            </a>
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

function PlatformOverview() {
  return (
    <aside className="platform-card" aria-label="LMS platform overview">
      <div className="platform-heading">
        <strong>Platform Overview</strong>
        <span>LearnFlow LMS at a glance</span>
      </div>

      <div className="overview-grid">
        {overview.map(({ label, value, icon: Icon }) => (
          <article key={label}>
            <span className="overview-icon"><Icon size={22} fill={label === 'Average Rating' ? 'currentColor' : 'none'} /></span>
            <strong>{value}</strong>
            <small>{label}</small>
          </article>
        ))}
      </div>

      <CourseList title="Top Courses" items={topCourses} />

      <div className="join-banner">
        <span><Trophy size={24} fill="currentColor" /></span>
        <div>
          <strong>Empowering learners to achieve more every day.</strong>
          <small>Join LearnFlow and start your learning journey today!</small>
        </div>
        <a href="#contact">Join Now</a>
      </div>
    </aside>
  );
}

function CourseList({ title, items }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-head">
        <h3>{title}</h3>
        <a href="#products">View all</a>
      </div>
      <div className="course-table">
        {items.map(({ title: itemTitle, level, learners, rating, icon: Icon }, index) => (
          <article key={itemTitle} className={`course-row tone-${index + 1}`}>
            <span className="row-icon"><Icon size={19} /></span>
            <strong>{itemTitle}</strong>
            <em>{level}</em>
            <small>{learners}</small>
            <span className="rating"><Star size={15} fill="currentColor" /> {rating}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
