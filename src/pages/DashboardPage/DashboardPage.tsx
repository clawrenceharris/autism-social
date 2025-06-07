import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useRecommendations } from "../../hooks/queries/useRecommendations";
import {
  BookOpen,
  Clock,
  Award,
  Play,
  ChevronRight,
  Target,
  Zap,
} from "lucide-react";
import "./DashboardPage.scss";
import { RecommendedDialogue } from "../../components";

const DashboardPage = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const { data: recommendations = [], isLoading: recommendationsLoading } = useRecommendations();

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

  const mockProgressCategories = [
    { name: "Clarity", score: 85, progress: 85 },
    { name: "Empathy", score: 72, progress: 72 },
    { name: "Assertiveness", score: 68, progress: 68 },
    { name: "Social Awareness", score: 91, progress: 91 },
    { name: "Self-Advocacy", score: 76, progress: 76 },
  ];

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
    if (profileLoading) return "...";
    if (profile?.name) return profile.name;
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-message">
            Welcome back, {getUserDisplayName()}! 👋
          </h1>
          <p className="welcome-subtitle">
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
          {/* Continue Current Scenario */}
          <div className="dashboard-section continue-scenario">
            <div className="section-header">
              <h2>Continue Your Journey</h2>
            </div>
            <div className="section-content">
              <div className="scenario-info">
                <div className="scenario-title">
                  {mockCurrentScenario.title}
                </div>
                <div className="scenario-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${mockCurrentScenario.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    Step {mockCurrentScenario.step} •{" "}
                    {mockCurrentScenario.progress}% complete
                  </span>
                </div>
              </div>
              {/* Updated to use the new user scenario playing route */}
              <Link
                to={`/play/${mockCurrentScenario.id}`}
                className="btn btn-primary"
              >
                <Play size={20} />
                Continue Scenario
              </Link>
            </div>
          </div>

          {/* Recommended Scenarios */}
          <div className="dashboard-section">
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
                  {recommendations.slice(0, 3).map((scenario) => (
                    <RecommendedDialogue key={scenario.id} scenario={scenario} />
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
          <div className="dashboard-section progress-overview">
            <div className="section-header">
              <h2>Your Progress</h2>
              <Link to="/progress" className="section-action">
                View Details <ChevronRight size={16} />
              </Link>
            </div>
            <div className="section-content">
              <div className="progress-categories">
                {mockProgressCategories.map((category) => (
                  <div key={category.name} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category.name}</span>
                      <span className="category-score">{category.score}%</span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-fill"
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section recent-activity">
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