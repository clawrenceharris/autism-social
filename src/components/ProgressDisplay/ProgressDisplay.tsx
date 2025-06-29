import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./ProgressDisplay.scss";
import { useProgressStore } from "../../store/useProgressStore";
import { formatCategoryName, getCategoryIcon } from "../../utils/categoryUtils";
import type { Category } from "../../services/scoring_categories";

const ProgressDisplay = ({ userId }: { userId: string }) => {
  const { fetchProgress, loading, categoryScores, error } = useProgressStore();
  const categories: Category[] = [
    { name: "clarity" },
    { name: "empathy" },
    { name: "engagement" },
    { name: "social_awareness" },
    { name: "self_advocacy" },
  ];
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
            {categories.map((category, index) => (
              <Link to={"/progress"} key={index} className="category-item">
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
                    {categoryScores[category.name] || 0} <span>pts</span>
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
