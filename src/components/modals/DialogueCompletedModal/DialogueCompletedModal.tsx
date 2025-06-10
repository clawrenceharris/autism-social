const DialogueCompletedModal = () =>{

  return (
     <div className={`results-card ${showResults ? "visible" : ""}`}>
          <div className="results-header">
            <div className="results-icon">
              <Award size={32} />
            </div>
            <h2>Great Job!</h2>
            <p>You've completed the dialogue. Here's how you performed:</p>
          </div>

          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">Clarity</div>
              <div className="score-value">{scores.clarity}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Empathy</div>
              <div className="score-value">{scores.empathy}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Assertiveness</div>
              <div className="score-value">{scores.assertiveness}</div>
            </div>
            <div className="score-item">
              <div className="score-label">Social Awareness</div>
              <div className="score-value">{scores.socialAwareness}</div>
            </div>
          </div>

          <div className="results-actions">
            <button onClick={onReplay} className="btn btn-primary">
              <RotateCcw size={20} />
              Try Again
            </button>
            <button onClick={onExit} className="btn">
              <Home size={20} />
              Dashboard
            </button>
          </div>
        </div>
  )
}