import { ChevronRight } from "lucide-react";
import { useProgress } from "../../hooks/useProgress";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProgressSection.scss";
const ProgressSection = ({ userId }: { userId: string }) => {
  const { progress, isLoading } = useProgress(userId);
  const [progressCategories, setProgressCategories] = useState<
    { name: string; score: number }[]
  >([]);

  useEffect(() => {
    if (!progress) return;
    setProgressCategories([
      { name: "Clarity", score: progress.clarity },
      { name: "Empathy", score: progress.empathy },
      { name: "assertiveness", score: progress.assertiveness },
      { name: "Self-advocacy", score: progress.self_advocacy },
    ]);
  }, [progress]);
  return (
    <div>
      <div className="section-header">
        <h2>Your Progress</h2>
        <Link to="/progress" className="section-action">
          View Details <ChevronRight size={16} />
        </Link>
      </div>
      <div className="section-content">
       {isLoading ? <>Loading</> :  <div className="progress-categories">
          {progressCategories.map((category) => (
            <div key={category.name} className="category-item">
              <div className="category-header">
                <span className="category-name">{category.name}</span>
                <span className="category-score">{category.score}%</span>
              </div>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{ width: `${(category.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
};

export default ProgressSection;
