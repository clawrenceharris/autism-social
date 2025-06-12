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
import { useRecommendationsStore } from "../../store/useRecommendations";
import { useDailyChallengeStore } from "../../store/useDailyChallengeStore";
import { useEffect } from "react";

const DashboardPage = () => {
  const { user, profile } = useOutletContext<AuthContextType>();
  const {
    fetchRecommendedDialogues,
    recommendedDialogues: recommendations = [],
    loading: recommendationsLoading,
  } = useRecommendationsStore();

  const {
    loading: challengesLoading,
    fetchDailyChallenges,
    getDayChallenge,
  } = useDailyChallengeStore();

  useEffect(() => {
    fetchRecommendedDialogues(user.id);
    fetchDailyChallenges();
  }, [fetchRecommendedDialogues, fetchDailyChallenges, user.id]);

  // Mock data - replace with real data from your services
  const mockStats = {
    scenariosCompleted: 12,
    currentStreak: 5,
    totalScore: 847,
    averageScore: 78,
  };

  const mockCurrentScenario = {
    id: "1",
    title: "Meeting a New Colleague",
    progress: 65,
    step: "3 of 5",
  };

  const mockRecentActivity = [
    {
      id: "1",
      text: "Completed 'Job Interview Practice'",
      time: "2 hours ago",
      icon: Award,
    },
    {
      id: "2",
      text: "Started 'Meeting a New Colleague'",
      time: "1 day ago",
      icon: Play,
    },
    {
      id: "3",
      text: "Achieved 5-day practice streak!",
      time: "2 days ago",
      icon: Target,
    },
  ];

  // Get user's display name from profile or fallback to email
  const getUserDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split("@")[0];
    }
    return "User";
  };

  // Get today's challenge
  const todayChallenge = getDayChallenge(new Date().getDay());

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-message">Hi, {getUserDisplayName()}! 👋</h1>
          <p className="description">
            Ready to continue building your social confidence? Let's practice
            some conversations today.
          </p>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-number">{mockStats.scenariosCompleted}</div>
            <div className="stat-label">Scenarios Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{mockStats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{mockStats.totalScore}</div>
            <div className="stat-label">Total Points</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{mockStats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          {/* Daily Challenge Call to Action */}
          <div className="card-section">
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
                  <div className="scenario-title">
                    {todayChallenge.dialogue?.title || "Daily Challenge"}
                  </div>
                  <div className="scenario-progress">
                    <div className="progress-text">
                      <Flame
                        size={16}
                        style={{ marginRight: "0.5rem", color: "#f59e0b" }}
                      />
                      Keep your streak alive! • Day {mockStats.currentStreak}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="challenge-info">
                  <div className="scenario-title">No Challenge Today</div>
                  <div className="scenario-progress">
                    <div className="progress-text">
                      Check back tomorrow for a new challenge!
                    </div>
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
                <div className="scenario-list">
                  {recommendations.map((dialogue) => (
                    <DialogueItem
                      badgeIcon={<Star size={14} />}
                      badgeTitle="Suggested"
                      key={dialogue.id}
                      dialogue={dialogue}
                    />
                  ))}
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
              {mockRecentActivity.length > 0 ? (
                <div className="activity-list">
                  {mockRecentActivity.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          <IconComponent size={16} />
                        </div>
                        <div className="activity-details">
                          <div className="activity-text">{activity.text}</div>
                          <div className="activity-time">{activity.time}</div>
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
