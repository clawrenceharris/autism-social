import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  Play,
  Star,
  Target,
} from "lucide-react";
import "./DailyChallengesPage.scss";
import { useDailyChallengeStore } from "../../store/useDailyChallengeStore";
import { DialogueItem, ProgressIndicator } from "../../components";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
type Status = "completed" | "locked" | "current";
const DailyChallengesPage = () => {
  const { challenges, loading, error, fetchDailyChallenges, getDayChallenge } =
    useDailyChallengeStore();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchDailyChallenges();
  }, [fetchDailyChallenges]);

  // Set current day as selected by default
  useEffect(() => {
    if (challenges.length > 0 && selectedDay === null) {
      const today = new Date().getDay();
      setSelectedDay(today);
    }
  }, [challenges, selectedDay]);

  const getWeekDateRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      start: weekStart.toLocaleDateString(),
      end: weekEnd.toLocaleDateString(),
    };
  };

  const getNodeStatus = (dayIndex: number): Status => {
    const today = new Date().getDay();
    const challenge = getDayChallenge(dayIndex);

    if (!challenge) return "locked";
    if (dayIndex < today) return "completed"; // Assume past days are completed
    if (dayIndex === today) return "current";
    return "locked";
  };

  const getNodeIcon = (status: Status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="node-icon" />;
      case "current":
        return <Play className="node-icon" />;
      case "locked":
        return <Lock className="node-icon" />;
      default:
        return <Calendar className="node-icon" />;
    }
  };

  const selectedChallenge =
    selectedDay !== null ? getDayChallenge(selectedDay) : null;
  const weekRange = getWeekDateRange();
  const completedCount = challenges.filter(
    (_, index) => getNodeStatus(index) === "completed"
  ).length;
  if (loading) {
    return (
      <div className="daily-challenges-container">
        <div className="loading-state">
          <ProgressIndicator />
          <p>Loading your daily challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-challenges-container">
        <div className="error-state">
          <h2>Unable to Load Challenges</h2>
          <p>{error}</p>
          <button
            onClick={fetchDailyChallenges}
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-challenges-container">
      <div className="challenges-header">
        <h1>Daily Challenges</h1>
        <p className="description">
          Complete one dialogue challenge each day to increase your Social
          Score, maintain your practice streak. Complete all challenges to earn
          a pize at the end of the week!
        </p>
      </div>

      <div className="week-progress">
        <div className="week-info">
          <div className="week-dates">
            Week of {weekRange.start} - {weekRange.end}
          </div>

          <div className="completion-stats">
            <div className="stat-item">
              <div className="stat-number">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{7 - completedCount}</div>
              <div className="stat-label">Remaining</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {Math.round((completedCount / 7) * 100)}%
              </div>
              <div className="stat-label">Progress</div>
            </div>
          </div>
        </div>

        <div className="challenge-timeline">
          {DAYS_OF_WEEK.map((dayName, index) => {
            const challenge = getDayChallenge(index);
            const status = getNodeStatus(index);
            const isSelected = selectedDay === index;

            return (
              <div
                key={index}
                className={`challenge-node ${status} ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => setSelectedDay(index)}
              >
                <div className={`node-circle ${status}`}>
                  {getNodeIcon(status)}
                </div>
                <div className="node-info">
                  <div className="day-name">{dayName.slice(0, 3)}</div>
                  {challenge && (
                    <>
                      <div className="challenge-title">
                        {challenge.dialogue?.title || "Challenge"}
                      </div>
                      <div
                        className={`difficulty-badge ${
                          challenge.dialogue?.difficulty || "easy"
                        }`}
                      >
                        {challenge.dialogue?.difficulty || "Easy"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="challenge-details">
        {selectedChallenge ? (
          <div className="selected-challenge">
            <div className="section-header">
              <h2>
                <Target size={20} style={{ marginRight: "0.5rem" }} />
                {DAYS_OF_WEEK[selectedDay!]} Challenge
              </h2>
            </div>
            <div className="section-content">
              {selectedChallenge.dialogue && (
                <DialogueItem dialogue={selectedChallenge.dialogue} />
              )}

              <div className="challenge-actions">
                {getNodeStatus(selectedDay!) === "current" ? (
                  <Link
                    to={`/scenario/${selectedChallenge.dialogue?.scenario_id}/dialogue/${selectedChallenge.dialogue_id}`}
                    className="btn btn-primary"
                  >
                    <Play size={20} />
                    Start Challenge
                  </Link>
                ) : getNodeStatus(selectedDay!) === "completed" ? (
                  <Link
                    to={`/scenario/${selectedChallenge.dialogue?.scenario_id}/dialogue/${selectedChallenge.dialogue_id}`}
                    className="btn"
                  >
                    <Star size={20} />
                    Replay Challenge
                  </Link>
                ) : (
                  <button className="btn" disabled>
                    <Lock size={20} />
                    Locked
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-challenge">
            <Clock className="empty-icon" />
            <div className="empty-message">No Challenge Available</div>
            <div className="empty-description">
              Select a day from the timeline above to view its challenge.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengesPage;
