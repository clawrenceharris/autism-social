import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProgressSection.scss";
import { useProgressStore } from "../../store/useProgressStore";

const ProgressSection = ({ userId }: { userId: string }) => {
  const { fetchProgress, loading, error } = useProgressStore();

  const [progressCategories] = useState<{ name: string; score: number }[]>([]);

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
            {progressCategories.map((category) => (
              <div key={category.name} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className="category-score">{category.score}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{ width: `${category.score}%` }}
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
