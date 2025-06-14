import { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, Lock, Play, Target, X } from "lucide-react";
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
  const [showChallengeDetail, setShowChallengeDetail] = useState(false);

  useEffect(() => {
    fetchDailyChallenges();
  }, [fetchDailyChallenges]);

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

  const handleChallengeClick = (dayIndex: number) => {
    const challenge = getDayChallenge(dayIndex);
    if (challenge && getNodeStatus(dayIndex) !== "locked") {
      setSelectedDay(dayIndex);
      setShowChallengeDetail(true);
    }
  };

  const handleCloseChallengeDetail = () => {
    setShowChallengeDetail(false);
    setSelectedDay(null);
  };

  const selectedChallenge = selectedDay !== null ? getDayChallenge(selectedDay) : null;
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
          Complete one dialogue challenge each day to increase your Social Score
          and maintain your practice streak. Complete all dialogues to win a
          prize at the end of the week!
        </p>
      </div>

      <div className="challenges-content">
        {/* Timeline Section */}
        <div className={`timeline-section ${showChallengeDetail ? 'hidden' : ''}`}>
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

                return (
                  <div
                    key={index}
                    className={`challenge-node ${status}`}
                    onClick={() => handleChallengeClick(index)}
                  >
                    <div className={`node-circle ${status}`}>
                      {getNodeIcon(status)}
                    </div>
                    <div className="node-info">
                      <div className="day-name">{dayName.slice(0, 3)}</div>
                      {challenge && (
                        <div
                          className={`difficulty-badge ${
                            challenge.dialogue?.difficulty || "easy"
                          }`}
                        >
                          {challenge.dialogue?.difficulty || "Easy"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Challenge Detail Section */}
        <div className={`challenge-detail-section ${showChallengeDetail ? 'visible' : ''}`}>
          <div className="challenge-detail-header">
            <h2>
              {selectedDay !== null ? DAYS_OF_WEEK[selectedDay] : ''} Challenge
            </h2>
            <button 
              className="close-button"
              onClick={handleCloseChallengeDetail}
              aria-label="Close challenge details"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="challenge-detail-content">
            {selectedChallenge ? (
              <div className="selected-challenge">
                {selectedChallenge.dialogue && (
                  <DialogueItem
                    badgeTitle="Challenge"
                    badgeIcon={<Target />}
                    dialogue={selectedChallenge.dialogue}
                  />
                )}
              </div>
            ) : (
              <div className="no-challenge">
                <Clock className="empty-icon" />
                <div className="empty-message">No Challenge Available</div>
                <div className="empty-description">
                  This challenge is not yet available or has been completed.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengesPage;