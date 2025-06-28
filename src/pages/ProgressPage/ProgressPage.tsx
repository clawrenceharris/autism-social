import { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Award,
  BarChart2,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  Frown,
  HelpCircle,
  Play,
} from "lucide-react";
import "./ProgressPage.scss";
import { useProgressStore } from "../../store/useProgressStore";
import { ProgressIndicator, RankDisplay } from "../../components";
import { Link } from "react-router-dom";
import { useScoreCategoryStore } from "../../store/useScoreCategoryStore";
import { useAchievements } from "../../hooks";
import { formatCategoryName, getCategoryIcon } from "../../utils/categoryUtils";
import useStreakStore from "../../store/useStreakStore";
import type { AuthContextType } from "../../components/routes/";

const ProgressPage = () => {
  const { user } = useOutletContext<AuthContextType>();

  const {
    progress,
    loading: progressLoading,
    error: progressError,
    fetchProgress,
    totalPoints: totalPoints,
    calcCategoryScores,
    calcTotalPoints,
    categoryScores,
  } = useProgressStore();

  const { streakData, fetchStreak } = useStreakStore();

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useScoreCategoryStore();
  const { achievements, earnedAchievements } = useAchievements();

  useEffect(() => {
    fetchCategories();
    calcTotalPoints();
    calcCategoryScores();
  }, [fetchCategories, calcTotalPoints, calcCategoryScores]);

  useEffect(() => {
    fetchProgress(user.id);
    fetchStreak(user.id);
  }, [fetchProgress, fetchStreak, user.id]);

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
          <Link to="/scenarios" className="btn btn-primary">
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
          <div className="card-section rank">
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
                  <Flame size={20} />
                </div>
                <div className="stat-value">
                  {streakData?.currentStreak || 0}
                </div>
                <div className="stat-label">Streak</div>
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
                <div className="stat-value">{earnedAchievements.length}</div>
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
                  <div className={`skill-score`}>
                    {categoryScores[category.name] || 0}
                    <span>pts</span>
                  </div>
                </div>

                <p className="description">{category.description}</p>
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
    </div>
  );
};

export default ProgressPage;
