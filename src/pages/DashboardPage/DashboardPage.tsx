import { Link, useOutletContext } from "react-router-dom";
import {
  BookOpen,
  Award,
  Play,
  ChevronRight,
  Calendar,
  Flame,
  Star,
} from "lucide-react";
import "./DashboardPage.scss";
import {
  ProgressDisplay,
  DialogueItem,
  RankDisplay,
  ProgressIndicator,
} from "../../components";
import { useDailyChallengeStore } from "../../store/useDailyChallengeStore";
import { useEffect } from "react";
import { useRecommendationsStore } from "../../store";
import { useProgressStore } from "../../store/useProgressStore";
import { useStreakStore } from "../../store/useStreakStore";
import type { AuthContextType } from "../../components/routes";
import { useAchievements } from "../../hooks";

const DashboardPage = () => {
  const { user, profile } = useOutletContext<AuthContextType>();

  const { earnedAchievements } = useAchievements();

  const {
    fetchRecommendedDialogues,
    recommendedDialogues: recommendations = [],
    loading: recommendationsLoading,
  } = useRecommendationsStore();
  const { progress, fetchProgress, totalPoints } = useProgressStore();
  const {
    loading: challengesLoading,
    fetchDailyChallenges,
    getDayChallenge,
  } = useDailyChallengeStore();
  const {
    streakData,
    fetchStreak,
    checkAndUpdateStreak,
    loading: streakLoading,
  } = useStreakStore();
  useEffect(() => {
    fetchDailyChallenges();
  }, [fetchDailyChallenges]);
  useEffect(() => {
    if (user.id) {
      fetchRecommendedDialogues(user.id);
      fetchStreak(user.id);
      fetchProgress(user.id);

      // Check if streak needs to be updated
      checkAndUpdateStreak(user.id);
    }
  }, [
    fetchRecommendedDialogues,
    fetchDailyChallenges,
    fetchStreak,
    checkAndUpdateStreak,
    user.id,
    fetchProgress,
  ]);

  // Get today's challenge
  const todayChallenge = getDayChallenge(new Date().getDay());

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-message">Hi, {profile.first_name}! 👋</h1>
          <p className="description">
            Ready to continue building your social confidence? Let's practice
            some conversations today.
          </p>
        </div>

        <div className="quick-stats">
          <Link to="/progress" className="stat-item">
            <div className="stat-number">{progress.length}</div>
            <div className="stat-label">Scenarios Completed</div>
          </Link>
          <Link to="/progress" className="stat-item">
            <div className="stat-number">
              {streakLoading ? <ProgressIndicator /> : totalPoints}
            </div>
            <div className="stat-label">Total Points</div>
          </Link>
          <Link to="/progress" className="stat-item">
            <div className="stat-number">
              {streakLoading ? (
                <ProgressIndicator />
              ) : (
                streakData?.currentStreak || 0
              )}
            </div>
            <div className="stat-label">Daily Streak</div>
          </Link>
          <Link to="/progress" className="stat-item">
            <div className="stat-number">
              {streakLoading ? (
                <ProgressIndicator />
              ) : (
                earnedAchievements.length
              )}
            </div>
            <div className="stat-label">Achievements</div>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          {/* User Rank Display */}
          <div className="card-section rank-section">
            <div className="section-header">
              <h2>
                <Award className="section-icon" size={20} />
                Your Rank
              </h2>
              <Link to="/progress" className="section-action">
                View Details <ChevronRight size={16} />
              </Link>
            </div>
            <div className="section-content rank-display-container">
              <RankDisplay totalPoints={totalPoints} size="medium" />
            </div>
          </div>

          {/* Daily Challenge*/}
          <div className="card-section challenge-section">
            <div className="section-header">
              <h2>
                <Calendar className="section-icon" size={20} />
                Today's Challenge
              </h2>
              <Link to="/daily-challenges" className="section-action">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="section-content">
              {challengesLoading ? (
                <div className="loading-state">
                  <p>Loading today's challenge...</p>
                </div>
              ) : todayChallenge ? (
                <div className="challenge-info">
                  <div className="scenario-progress">
                    <div className="progress-text">
                      <p>
                        <Flame
                          size={16}
                          style={{ marginRight: "0.5rem", color: "#f59e0b" }}
                        />
                        Keep your streak alive! • Day{" "}
                        {streakLoading ? "..." : streakData?.currentStreak || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="scenario-progress">
                  <div className="progress-text">
                    Check back tomorrow for a new challenge!
                  </div>
                </div>
              )}

              {todayChallenge ? (
                <Link
                  to={`/scenario/${todayChallenge.dialogue?.scenario_id}/dialogue/${todayChallenge.dialogue_id}`}
                  className="btn btn-primary"
                >
                  <Play size={20} />
                  Start Today's Challenge
                </Link>
              ) : (
                <Link to="/daily-challenges" className="btn btn-primary">
                  <Calendar size={20} />
                  View Weekly Challenges
                </Link>
              )}
            </div>
          </div>

          {/* Recommended Scenarios */}
          <div className="card-section">
            <div className="section-header">
              <h2>
                <Star className="section-icon" />
                Recommended for You
              </h2>
              <Link to="/explore" className="section-action">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="section-content">
              {recommendationsLoading ? (
                <div className="loading-state">
                  <p>Loading personalized recommendations...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="dialogue-list">
                  {recommendations.map((dialogue, index) => {
                    if (index < 2)
                      return (
                        <DialogueItem
                          badgeIcon={<Star size={14} />}
                          badgeTitle="Suggested"
                          key={dialogue.id}
                          dialogue={dialogue}
                        />
                      );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-message">
                    No personalized recommendations yet
                  </div>
                  <div className="empty-description">
                    Complete your profile to get personalized scenario
                    recommendations
                  </div>
                  <Link
                    to="/settings"
                    className="btn btn-primary"
                    style={{ marginTop: "1rem" }}
                  >
                    Complete Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Progress Overview */}
          <div className="card-section progress-overview">
            <ProgressDisplay userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
