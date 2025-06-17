import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./ProgressSection.scss";
import { useProgressStore } from "../../store/useProgressStore";
import { useScoreCategoryStore } from "../../store/useScoreCategoryStore";

const ProgressSection = ({ userId }: { userId: string }) => {
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
    <div>
      <div className="section-header">
        <h2>Your Progress</h2>
        <Link to="/progress" className="section-action">
          View Details <ChevronRight size={16} />
        </Link>
      </div>
      <div className="section-content">
        {loading ? (
          <>Loading your progress...</>
        ) : (
          <div className="progress-categories">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className="category-score">
                    {scores[category.name]}%
                  </span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${scores[category.name]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSection;
