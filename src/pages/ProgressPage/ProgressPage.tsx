import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Award,
  BarChart2,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Frown,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Play,
  Target,
  Zap,
} from "lucide-react";
import "./ProgressPage.scss";
import type { AuthContextType, ScoreSummary } from "../../types";
import { useProgressStore } from "../../store/useProgressStore";
import { useScenarioStore } from "../../store/useScenarioStore";
import { ProgressIndicator } from "../../components";
import { Link } from "react-router-dom";

// Types for achievement data
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "milestone" | "skill" | "streak" | "mastery";
  earned: boolean;
  earnedDate?: string;
}

const ProgressPage = () => {
  const { user } = useOutletContext<AuthContextType>();
  const {
    progress,
    loading: progressLoading,
    error: progressError,

    setScores,
    fetchProgress,
    calcAverageScore,
  } = useProgressStore();
  const { fetchScenarios, loading: scenariosLoading } = useScenarioStore();
  const [socialScore, setSocialScore] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const scores = useMemo(() => {
    return (
      progress?.reduce<ScoreSummary>(
        (acc, p) => ({
          assertiveness: p.assertiveness + acc.assertiveness,
          clarity: p.clarity + acc.clarity,
          empathy: p.empathy + acc.empathy,
          social_awareness: p.social_awareness + acc.social_awareness,
          self_advocacy: p.self_advocacy + acc.self_advocacy,
        }),
        {
          assertiveness: 0,
          clarity: 0,
          empathy: 0,
          social_awareness: 0,
          self_advocacy: 0,
        }
      ) || {
        assertiveness: 0,
        clarity: 0,
        empathy: 0,
        social_awareness: 0,
        self_advocacy: 0,
      }
    );
  }, [progress]);
  useEffect(() => {
    fetchProgress(user.id);
    fetchScenarios();
    setScores();
  }, [fetchProgress, fetchScenarios, setScores, user.id]);
  console.log({ scores });

  // Calculate social score when progress data changes
  useEffect(() => {
    if (progress) {
      // Calculate average of all progress categories
      console.log({ progress });
      setSocialScore(Math.round(calcAverageScore(progress)));
    }
  }, [calcAverageScore, progress]);

  // Mock achievements data
  useEffect(() => {
    // In a real app, this would come from an API call
    setAchievements([
      {
        id: "1",
        name: "First Dialogue Completed",
        description: "Successfully completed your first dialogue scenario",
        icon: <MessageSquare />,
        category: "milestone",
        earned: true,
        earnedDate: "May 15, 2025",
      },
      {
        id: "2",
        name: "Empathy Expert",
        description: "Achieved a score of 80+ in Empathy",
        icon: <Heart />,
        category: "skill",
        earned: scores.empathy >= 80,
        earnedDate: scores.empathy >= 80 ? "May 18, 2025" : undefined,
      },
      {
        id: "3",
        name: "3-Day Streak",
        description: "Practiced for 3 consecutive days",
        icon: <Calendar />,
        category: "streak",
        earned: true,
        earnedDate: "May 20, 2025",
      },
      {
        id: "4",
        name: "Clarity Champion",
        description: "Achieved a score of 80+ in Clarity",
        icon: <Lightbulb />,
        category: "skill",
        earned: scores.clarity >= 80,
        earnedDate: scores.clarity >= 80 ? "May 22, 2025" : undefined,
      },
      {
        id: "5",
        name: "Social Butterfly",
        description: "Completed 10 different dialogue scenarios",
        icon: <Zap />,
        category: "milestone",
        earned: false,
      },
      {
        id: "6",
        name: "Assertiveness Ace",
        description: "Achieved a score of 80+ in Assertiveness",
        icon: <Target />,
        category: "skill",
        earned: scores.assertiveness >= 80,
        earnedDate: scores.assertiveness >= 80 ? "May 25, 2025" : undefined,
      },
      {
        id: "7",
        name: "Social Awareness Master",
        description: "Achieved a score of 90+ in Social Awareness",
        icon: <Brain />,
        category: "mastery",
        earned: scores.social_awareness >= 90,
        earnedDate: scores.social_awareness >= 90 ? "May 28, 2025" : undefined,
      },
      {
        id: "8",
        name: "Self-Advocacy Star",
        description: "Achieved a score of 80+ in Self-Advocacy",
        icon: <Award />,
        category: "skill",
        earned: scores.self_advocacy >= 80,
        earnedDate: scores.self_advocacy >= 80 ? "May 30, 2025" : undefined,
      },
    ]);
  }, [progress, scores]);

  const getScoreLevel = (score: number): "poor" | "good" | "excellent" => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    return "poor";
  };

  const getImprovementTip = (category: string, score: number): string => {
    if (score >= 80) {
      return "You're doing great! Keep practicing to maintain your skills.";
    }

    if (score >= 60) {
      switch (category) {
        case "clarity":
          return "Try to be more specific and concise in your responses.";
        case "empathy":
          return "Practice recognizing others' emotions and responding appropriately.";
        case "assertiveness":
          return "Work on expressing your needs while respecting others.";
        case "social_awareness":
          return "Pay attention to social cues and context in conversations.";
        case "self_advocacy":
          return "Continue practicing how to stand up for yourself respectfully.";
        default:
          return "Keep practicing to improve your skills further.";
      }
    }

    switch (category) {
      case "clarity":
        return "Focus on organizing your thoughts before speaking and use clear language.";
      case "empathy":
        return "Try to understand others' perspectives and validate their feelings.";
      case "assertiveness":
        return "Practice expressing your opinions and needs without being aggressive or passive.";
      case "social_awareness":
        return "Work on recognizing social norms and reading non-verbal cues.";
      case "self_advocacy":
        return "Learn to identify your needs and communicate them effectively.";
      default:
        return "Regular practice will help you improve in this area.";
    }
  };

  // const getCategoryIcon = (category: string) => {
  //   switch (category) {
  //     case "clarity":
  //       return <Lightbulb />;
  //     case "empathy":
  //       return <Heart />;
  //     case "assertiveness":
  //       return <Target />;
  //     case "social_awareness":
  //       return <Brain />;
  //     case "self_advocacy":
  //       return <MessageSquare />;
  //     default:
  //       return <HelpCircle />;
  //   }
  // };

  // const formatCategoryName = (category: string): string => {
  //   return category
  //     .split("_")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // };

  // Calculate stats
  const totalPoints =
    scores.clarity +
    scores.empathy +
    scores.assertiveness +
    scores.social_awareness +
    scores.self_advocacy;
  const earnedAchievements = achievements.filter((a) => a.earned).length;
  const completedScenarios = useMemo(
    () => progress?.filter((p) => p.user_id === user.id).length,
    [progress, user.id]
  );

  if (progressLoading || scenariosLoading) {
    return (
      <div className="progress-page">
        <div className="loading-state">
          <ProgressIndicator size={60} />
          <p className="loading-text">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="progress-page">
        <div className="error-state">
          <Frown className="error-icon" />
          <h2 className="error-title">Unable to Load Progress</h2>
          <p className="error-message">
            We encountered an error while loading your progress data. Please try
            again later.
          </p>
          <button
            onClick={() => fetchProgress(user.id)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="progress-page">
        <div className="error-state">
          <HelpCircle className="error-icon" />
          <h2 className="error-title">No Progress Data Found</h2>
          <p className="error-message">
            We couldn't find any progress data for your account. Start
            practicing with some scenarios to build your progress!
          </p>
          <Link to="/explore" className="btn btn-primary">
            <Play size={20} />
            Explore Scenarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>Your Progress</h1>
        <p className="description">
          Track your social skills development and achievements
        </p>
      </div>

      <section className="hero-section">
        <div className="hero-content">
          <div className="social-score">
            <div className="score-circle">
              <div className="score-value">{socialScore}</div>
              <div className="score-label">Social Score</div>
            </div>
            <h2 className="score-title">Social Confidence Score</h2>
            <p className="score-description">
              Your overall social interaction proficiency based on all skill
              categories
            </p>
          </div>

          <div className="quick-stats">
            <h3 className="stats-title">Your Progress at a Glance</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <BarChart2 size={20} />
                </div>
                <div className="stat-value">{totalPoints}</div>
                <div className="stat-label">Total Points</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-value">{calcAverageScore(progress)}</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={20} />
                </div>
                <div className="stat-value">{completedScenarios}</div>
                <div className="stat-label">Scenarios Completed</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-value">{earnedAchievements}</div>
                <div className="stat-label">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="progress-grid">
        <section className="skills-section card-section">
          <div className="section-header">
            <h2>
              <Brain className="section-icon" size={24} />
              Skill Categories
            </h2>
          </div>

          <div className="skills-grid">
            {/* Clarity */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="skill-info">
                  <div className="skill-icon">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="skill-name">Clarity</h3>
                </div>
                <div className={`skill-score ${getScoreLevel(scores.clarity)}`}>
                  {scores.clarity}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(scores.clarity)}`}
                  style={{ width: `${scores.clarity}%` }}
                ></div>
              </div>

              <p className="skill-description">
                Clarity measures how well you communicate your thoughts and
                ideas in a clear, concise, and understandable manner.
              </p>

              <div className="improvement-tips">
                <h4 className="tips-title">
                  <Zap className="tips-icon" size={16} />
                  Improvement Tips
                </h4>
                <p className="tips-content">
                  {getImprovementTip("clarity", scores.clarity)}
                </p>
              </div>
            </div>

            {/* Empathy */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="skill-info">
                  <div className="skill-icon">
                    <Heart size={20} />
                  </div>
                  <h3 className="skill-name">Empathy</h3>
                </div>
                <div className={`skill-score ${getScoreLevel(scores.empathy)}`}>
                  {scores.empathy}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(scores.empathy)}`}
                  style={{ width: `${scores.empathy}%` }}
                ></div>
              </div>

              <p className="skill-description">
                Empathy reflects your ability to understand and share the
                feelings of others, responding with appropriate emotional
                support.
              </p>

              <div className="improvement-tips">
                <h4 className="tips-title">
                  <Zap className="tips-icon" size={16} />
                  Improvement Tips
                </h4>
                <p className="tips-content">
                  {getImprovementTip("empathy", scores.empathy)}
                </p>
              </div>
            </div>

            {/* Assertiveness */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="skill-info">
                  <div className="skill-icon">
                    <Target size={20} />
                  </div>
                  <h3 className="skill-name">Assertiveness</h3>
                </div>
                <div
                  className={`skill-score ${getScoreLevel(
                    scores.assertiveness
                  )}`}
                >
                  {scores.assertiveness}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(
                    scores.assertiveness
                  )}`}
                  style={{ width: `${scores.assertiveness}%` }}
                ></div>
              </div>

              <p className="skill-description">
                Assertiveness measures your ability to express your opinions,
                needs, and boundaries confidently while respecting others.
              </p>

              <div className="improvement-tips">
                <h4 className="tips-title">
                  <Zap className="tips-icon" size={16} />
                  Improvement Tips
                </h4>
                <p className="tips-content">
                  {getImprovementTip("assertiveness", scores.assertiveness)}
                </p>
              </div>
            </div>

            {/* Social Awareness */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="skill-info">
                  <div className="skill-icon">
                    <Brain size={20} />
                  </div>
                  <h3 className="skill-name">Social Awareness</h3>
                </div>
                <div
                  className={`skill-score ${getScoreLevel(
                    scores.social_awareness
                  )}`}
                >
                  {scores.social_awareness}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(
                    scores.social_awareness
                  )}`}
                  style={{ width: `${scores.social_awareness}%` }}
                ></div>
              </div>

              <p className="skill-description">
                Social awareness reflects your ability to understand social
                contexts, read social cues, and navigate social situations
                appropriately.
              </p>

              <div className="improvement-tips">
                <h4 className="tips-title">
                  <Zap className="tips-icon" size={16} />
                  Improvement Tips
                </h4>
                <p className="tips-content">
                  {getImprovementTip(
                    "social_awareness",
                    scores.social_awareness
                  )}
                </p>
              </div>
            </div>

            {/* Self Advocacy */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="skill-info">
                  <div className="skill-icon">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="skill-name">Self Advocacy</h3>
                </div>
                <div
                  className={`skill-score ${getScoreLevel(
                    scores.self_advocacy
                  )}`}
                >
                  {scores.self_advocacy}%
                </div>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar ${getScoreLevel(
                    scores.self_advocacy
                  )}`}
                  style={{ width: `${scores.self_advocacy}%` }}
                ></div>
              </div>

              <p className="skill-description">
                Self advocacy measures your ability to speak up for yourself and
                your needs in various social situations.
              </p>

              <div className="improvement-tips">
                <h4 className="tips-title">
                  <Zap className="tips-icon" size={16} />
                  Improvement Tips
                </h4>
                <p className="tips-content">
                  {getImprovementTip("self_advocacy", scores.self_advocacy)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="achievements-section card-section">
          <div className="section-header">
            <h2>
              <Award className="section-icon" size={24} />
              Achievements
            </h2>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${
                  !achievement.earned ? "locked" : ""
                }`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h3 className="achievement-name">{achievement.name}</h3>
                  <p className="achievement-description">
                    {achievement.description}
                  </p>
                  <div className="achievement-meta">
                    <span className={`category-badge ${achievement.category}`}>
                      {achievement.category.charAt(0).toUpperCase() +
                        achievement.category.slice(1)}
                    </span>
                    {achievement.earned && achievement.earnedDate && (
                      <span className="earned-date">
                        <Clock size={12} style={{ marginRight: "4px" }} />
                        {achievement.earnedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="cta-section">
        <h2 className="cta-message">Ready to improve your social skills?</h2>
        <p className="cta-description">
          Continue practicing with more scenarios to build your skills and earn
          achievements. The more you practice, the more confident you'll become
          in social situations.
        </p>
        <div className="cta-buttons">
          <Link to="/explore" className="btn btn-primary">
            <Play size={20} />
            Practice Scenarios
          </Link>
          <Link to="/daily-challenges" className="btn btn-secondary">
            <Calendar size={20} />
            Daily Challenges
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProgressPage;
