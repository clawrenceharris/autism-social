import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./ProgressDisplay.scss";
import { useProgressStore } from "../../store/useProgressStore";
import { useScoreCategoryStore } from "../../store/useScoreCategoryStore";
import { formatCategoryName, getCategoryIcon } from "../../utils/categoryUtils";

const ProgressDisplay = ({ userId }: { userId: string }) => {
  const {
    fetchProgress,
    loading,
    averageCategoryScores: scores,
    error,
  } = useProgressStore();
  const { categories } = useScoreCategoryStore();
  useEffect(() => {
    fetchProgress(userId);
  }, [fetchProgress, userId]);

  if (error) {
    return (
      <div className="center-absolute">
        <p className="danger"> {error}</p>
      </div>
    );
  }

  return (
    <div className="progress-section">
      <div className="section-header">
        <h2>Your Progress</h2>
        <Link to="/progress" className="section-action">
          View Details <ChevronRight size={16} />
        </Link>
      </div>
      <div className="section-content">
        {loading ? (
          <div className="content-centered">
            <p>Loading your progress...</p>
          </div>
        ) : (
          <div className="progress-categories">
            {categories.map((category) => (
              //  <div key={progress.dialogue_id} className="activity-item">
              //           <div className="activity-icon">
              //             <IconComponent size={16} />
              //           </div>
              //           <div className="activity-details">
              //             <div className="activity-text">
              //               Completed dialogue
              //             </div>
              //             <div className="activity-time">
              //               {new Date(
              //                 progress.created_at || Date.now()
              //               ).toLocaleDateString()}
              //             </div>
              //           </div>
              //         </div>
              <Link
                to={"/progress"}
                key={category.id}
                className="category-item"
              >
                <div className="category-header">
                  <div className="category-icon">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="category-name">
                    {formatCategoryName(category.name)}
                  </span>
                </div>
                <div className="category-details">
                  <span className="category-text">
                    {scores[category.name]}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDisplay;
