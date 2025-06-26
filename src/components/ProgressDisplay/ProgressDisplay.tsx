import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./ProgressDisplay.scss";
import { useProgressStore } from "../../store/useProgressStore";
import { useScoreCategoryStore } from "../../store/useScoreCategoryStore";
import { formatCategoryName, getCategoryIcon } from "../../utils/categoryUtils";

const ProgressDisplay = ({ userId }: { userId: string }) => {
  const { fetchProgress, loading, categoryScores, error } = useProgressStore();
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
                  <p className="category-text">
                    {categoryScores[category.name]} <span>pts</span>
                  </p>
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
