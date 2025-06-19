import React, { useEffect, useState, useRef, type JSX } from "react";
import "./RankDisplay.scss";
import { calculateRankProgress, hasRankedUp } from "../../utils/rankUtils";
import type { RankProgress, UserRank } from "../../types";
import { useProgressStore } from "../../store/useProgressStore";

interface RankDisplayProps {
  totalPoints: number;
  previousPoints?: number;
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  className?: string;
}

interface RankUpCelebrationProps {
  newRank: UserRank;
  onClose: () => void;
}

const RankUpCelebration: React.FC<RankUpCelebrationProps> = ({
  newRank,
  onClose,
}) => {
  const [confetti, setConfetti] = useState<JSX.Element[]>([]);
  useEffect(() => {
    // Create confetti elements
    const colors = ["#54cbe2", "#c893fb", "#f59e0b", "#16a34a", "#ec4899"];
    const confettiCount = 100;
    const newConfetti: JSX.Element[] = [];

    for (let i = 0; i < confettiCount; i++) {
      const left = `${Math.random() * 100}%`;
      const width = `${Math.random() * 10 + 5}px`;
      const height = `${Math.random() * 10 + 5}px`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animationDuration = `${Math.random() * 3 + 2}s`;
      const animationDelay = `${Math.random() * 2}s`;

      newConfetti.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left,
            top: "-20px",
            width,
            height,
            backgroundColor: color,
            borderRadius: "50%",
            animation: `confettiDrop ${animationDuration} ease-in ${animationDelay} forwards`,
          }}
        />
      );
    }

    setConfetti(newConfetti);
  }, []);

  return (
    <div className="rank-up-celebration">
      <div className="celebration-content">
        <div className="confetti">{confetti}</div>

        <div
          className="rank-badge"
          style={{ "--rank-color": newRank.color } as React.CSSProperties}
        >
          <span className="rank-icon">{newRank.icon}</span>
        </div>

        <h2
          className="celebration-title"
          style={{ "--rank-color": newRank.color } as React.CSSProperties}
        >
          Rank Up!
        </h2>

        <p className="celebration-message">
          Congratulations! Your social skills have improved and you've reached a
          new rank!
        </p>

        <div className="rank-details">
          <div className="new-rank" style={{ color: newRank.color }}>
            {newRank.icon} {newRank.title} (Rank {newRank.level})
          </div>
          <p className="rank-perks">
            Keep practicing to unlock more advanced scenarios and achievements!
          </p>
        </div>

        <div className="celebration-actions">
          <button onClick={onClose} className="btn btn-primary">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const RankDisplay: React.FC<RankDisplayProps> = ({
  totalPoints,
  previousPoints,
  size = "medium",
  showProgress = true,
  className = "",
}) => {
  const [progress, setProgress] = useState<RankProgress>(
    calculateRankProgress(totalPoints)
  );
  const [showRankUp, setShowRankUp] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const prevPointsRef = useRef(totalPoints);
  const { setRankReceived, rankReceived } = useProgressStore();

  // Check for rank up when points change
  useEffect(() => {
    if (
      previousPoints !== undefined &&
      hasRankedUp(previousPoints, totalPoints) &&
      !rankReceived
    ) {
      setShowRankUp(true);
    }

    // Update progress calculation
    setProgress(calculateRankProgress(totalPoints));

    // Trigger progress bar animation if points changed
    if (prevPointsRef.current !== totalPoints) {
      setAnimateProgress(true);
      prevPointsRef.current = totalPoints;
    }
  }, [totalPoints, previousPoints, rankReceived]);

  // Apply progress bar width after component mounts or when progress changes
  useEffect(() => {
    if (progressBarRef.current && animateProgress) {
      // First set width to 0 to ensure animation works even when decreasing
      progressBarRef.current.style.width = "0%";

      // Force a reflow to ensure the browser registers the change
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      progressBarRef.current.offsetWidth;

      // Then set to the actual percentage
      setTimeout(() => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progress.percentToNextRank}%`;
        }
        setAnimateProgress(false);
      }, 50);
    }
  }, [progress.percentToNextRank, animateProgress]);

  return (
    <>
      <div className={`rank-display ${size} ${className}`}>
        <div
          className="rank-badge"
          style={
            {
              "--rank-color": progress.currentRank.color,
            } as React.CSSProperties
          }
        >
          <div className="rank-icon">{progress.currentRank.icon}</div>
        </div>

        <div className="rank-info">
          <p className="description">Level {progress.currentRank.level}</p>

          <div
            className="rank-title"
            style={{ color: progress.currentRank.color }}
          >
            {progress.currentRank.title}
          </div>
        </div>

        {showProgress && progress.nextRank && (
          <div className="rank-progress">
            <div className="progress-header">
              <div className="current-points">
                {progress.currentPoints} points
              </div>
              <div className="next-rank">
                Next:{" "}
                <span
                  className="highlight"
                  style={{ color: progress.nextRank.color }}
                >
                  {progress.nextRank.title}
                </span>
              </div>
            </div>

            <div className="progress-bar-container">
              <div
                ref={progressBarRef}
                className="progress-bar"
                style={
                  {
                    "--rank-color": progress.currentRank.color,
                    width: `${progress.percentToNextRank}%`,
                  } as React.CSSProperties
                }
              ></div>
              <div className="progress-percentage">
                {progress.percentToNextRank}%
              </div>
            </div>

            <div className="progress-details">
              <div className="remaining-points">
                {progress.remainingPoints} points to next rank
              </div>
            </div>
          </div>
        )}
      </div>

      {showRankUp && (
        <RankUpCelebration
          newRank={progress.currentRank}
          onClose={() => {
            setRankReceived(true);
            setShowRankUp(false);
          }}
        />
      )}
    </>
  );
};

export default RankDisplay;
