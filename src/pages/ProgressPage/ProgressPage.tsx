import { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Award,
  BarChart2,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Frown,
  HelpCircle,
  Play,
} from "lucide-react";
import "./ProgressPage.scss";
import type { AuthContextType } from "../../types";
import { useProgressStore } from "../../store/useProgressStore";
import { ProgressIndicator, RankDisplay } from "../../components";
import { Link } from "react-router-dom";
import { useScoreCategoryStore } from "../../store/useScoreCategoryStore";
import useAchievements from "../../hooks/useAchievements";
import { formatCategoryName, getCategoryIcon } from "../../utils/categoryUtils";

const ProgressPage = () => {
  const { user } = useOutletContext<AuthContextType>();
  const {
    progress,
    loading: progressLoading,
    error: progressError,
    fetchProgress,
    calcAverageScore,
    averageScore,
    totalPoints: totalPoints,
    calcCategoryScores,
    calcTotalPoints,
    categoryScores,
  } = useProgressStore();
  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useScoreCategoryStore();
  const { achievements } = useAchievements();
  useEffect(() => {
    fetchProgress(user.id);
    fetchCategories();
    calcTotalPoints();
    calcCategoryScores();
    calcAverageScore();
  }, [
    fetchCategories,
    calcTotalPoints,
    fetchProgress,
    user.id,
    calcAverageScore,
    calcCategoryScores,
  ]);

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

  const earnedAchievements = useMemo(
    () => achievements.filter((a) => a.earned).length,
    [achievements]
  );
  const completedScenarios = useMemo(
    () => progress?.filter((p) => p.user_id === user.id).length,
    [progress, user.id]
  );

  if (progressLoading || categoriesLoading) {
    return (
      <div className="loading-state">
        <ProgressIndicator />
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
            <RankDisplay
              totalPoints={totalPoints}
              previousPoints={2}
              size="large"
            />
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
                <div className="stat-value">{averageScore}%</div>
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
            {categories.map((category) => (
              <div className="skill-card">
                <div className="skill-header">
                  <div className="skill-info">
                    <div className="skill-icon">
                      {getCategoryIcon(category.name)}
                    </div>
                    <h3 className="skill-name">
                      {formatCategoryName(category.name)}
                    </h3>
                  </div>
                  <div
                    className={`skill-score ${getScoreLevel(
                      categoryScores[category.name] || 0
                    )}`}
                  >
                    {categoryScores[category.name] || 0}
                    <span>pts</span>
                  </div>
                </div>

                <p className="description">{category.description}</p>

                <div className="improvement-tips">
                  <h4 className="tips-title">Improvement Tips</h4>
                  <p className="tips-content">
                    {getImprovementTip(
                      category.name,
                      categoryScores[category.name] || 0
                    )}
                  </p>
                </div>
              </div>
            ))}
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
                  <p className="description">{achievement.description}</p>
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
