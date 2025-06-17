import { Link, useOutletContext } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  ChevronRight,
  Target,
  Zap,
  Calendar,
  Flame,
  Star,
} from "lucide-react";
import "./DashboardPage.scss";
import { ProgressSection, DialogueItem } from "../../components";
import type { AuthContextType } from "../../types";
import { useDailyChallengeStore } from "../../store/useDailyChallengeStore";
import { useEffect } from "react";
import { useRecommendationsStore } from "../../store";
import { useProgressStore } from "../../store/useProgressStore";
import { useStreakStore } from "../../store/useStreakStore";

const DashboardPage = () => {
  const { user, profile } = useOutletContext<AuthContextType>();
  const {
    fetchRecommendedDialogues,
    recommendedDialogues: recommendations = [],
    loading: recommendationsLoading,
  } = useRecommendationsStore();
  const { progress } = useProgressStore();
  const {
    loading: challengesLoading,
    fetchDailyChallenges,
    getDayChallenge,
  } = useDailyChallengeStore();
  const { 
    streakData, 
    fetchStreak, 
    checkAndUpdateStreak, 
    loading: streakLoading 
  } = useStreakStore();

  useEffect(() => {
    fetchRecommendedDialogues(user.id);
    fetchDailyChallenges();
    fetchStreak(user.id);
    
    // Check if streak needs to be updated (e.g., if user missed a day)
    checkAndUpdateStreak(user.id);
  }, [
    fetchRecommendedDialogues, 
    fetchDailyChallenges, 
    fetchStreak, 
    checkAndUpdateStreak, 
    user.id
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
          <div className="stat-item">
            <div className="stat-number">{progress.length}</div>
            <div className="stat-label">Scenarios Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{streakLoading ? '...' : streakData?.currentStreak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{streakLoading ? '...' : streakData?.longestStreak || 0}</div>
            <div className="stat-label">Best Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{progress.length > 0 ? Math.round((progress.reduce((acc, p) => acc + p.clarity + p.empathy + p.assertiveness + p.social_awareness + p.self_advocacy, 0) / (progress.length * 5))) : 0}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          {/* Daily Challenge Call to Action */}
          <div className="card-section challenge-section">
            <div className="section-header">
              <h2>
                <Calendar size={20} style={{ marginRight: "0.5rem" }} />
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
                        Keep your streak alive! • Day {streakLoading ? '...' : streakData?.currentStreak || 0}
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
                <Zap size={20} style={{ marginRight: "0.5rem" }} />
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
                  <BookOpen className="empty-icon" />
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
            <ProgressSection userId={user.id} />
          </div>

          {/* Recent Activity */}
          <div className="card-section recent-activity">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <Link to="/your-scenarios" className="section-action">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="section-content">
              {progress.length > 0 ? (
                <div className="activity-list">
                  {progress.slice(0, 3).map((activity, index) => {
                    const IconComponent = index === 0 ? Award : (index === 1 ? Play : Target);
                    return (
                      <div key={activity.dialogue_id} className="activity-item">
                        <div className="activity-icon">
                          <IconComponent size={16} />
                        </div>
                        <div className="activity-details">
                          <div className="activity-text">Completed dialogue</div>
                          <div className="activity-time">{new Date(activity.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <Clock className="empty-icon" />
                  <div className="empty-message">No recent activity</div>
                  <div className="empty-description">
                    Start a scenario to see your activity here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;