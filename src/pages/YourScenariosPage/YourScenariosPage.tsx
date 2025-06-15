import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Play,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Star,
  Users,
  Award,
  Zap,
} from "lucide-react";
import "./YourScenariosPage.scss";
import { useScenarioStore } from "../../store/useScenarioStore";
import { ProgressIndicator } from "../../components";
import type { ScenarioWithDialogues } from "../../types";
import { useRecommendationsStore } from "../../store";

type FilterType = "all" | "completed" | "trending" | "recommended";

const YourScenariosPage = () => {
  const {
    scenarios,
    scenarioIds,
    completedDialogueIds,
    dialoguesByScenario,
    dialoguesLoading,
    fetchDialogues,
    scenariosLoading: scenariosLoading,
    fetchScenarios,
  } = useScenarioStore();
  const { recommendedDialogues } = useRecommendationsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  useEffect(() => {
    fetchScenarios();
    fetchDialogues();
  }, [fetchScenarios, fetchDialogues]);

  // Combine scenarios with their dialogues and metadata
  const scenariosWithDialogues: ScenarioWithDialogues[] = useMemo(() => {
    return scenarioIds.map((id) => {
      const scenario = scenarios[id];

      const dialogues = Object.values(dialoguesByScenario).flatMap(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value
      );
      console.log({ scenario });
      const totalDialogues = Object.keys(dialoguesByScenario).length;
      return {
        ...scenario,
        dialogues,
        completedCount: dialogues.filter((d) =>
          completedDialogueIds.includes(d.id)
        ).length,
        totalDialogues,
        isCompleted:
          completedDialogueIds?.length > 0 &&
          dialogues.every((d) => completedDialogueIds.includes(d.id)),
        isTrending: false,
        isRecommended:
          Object.values(recommendedDialogues).filter(
            (d) => d.scenario_id === id
          ).length > 0,
        lastPlayed: Math.random() > 0.5 ? "2 days ago" : undefined,
      };
    });
  }, [
    scenarioIds,
    scenarios,
    dialoguesByScenario,
    completedDialogueIds,
    recommendedDialogues,
  ]);

  // Filter scenarios based on search and active filter
  const filteredScenarios = useMemo(() => {
    let filtered = scenariosWithDialogues.filter(Boolean);
    if (!searchQuery) {
      return filtered;
    }
    // Apply search filter
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered.filter(
        (scenario) =>
          scenario.title.toLowerCase().includes(query) ||
          scenario.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case "completed":
        filtered = filtered.filter((scenario) => scenario.isCompleted);
        break;
      case "trending":
        filtered = filtered.filter((scenario) => scenario.isTrending);
        break;
      case "recommended":
        filtered = filtered.filter((scenario) => scenario.isRecommended);
        break;
      default:
        break;
    }

    return filtered;
  }, [scenariosWithDialogues, searchQuery, activeFilter]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case "completed":
        return <CheckCircle size={16} />;
      case "trending":
        return <TrendingUp size={16} />;
      case "recommended":
        return <Star size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case "completed":
        return "Completed";
      case "trending":
        return "Trending";
      case "recommended":
        return "Recommended";
      default:
        return "All Scenarios";
    }
  };

  const getSectionTitle = () => {
    switch (activeFilter) {
      case "completed":
        return "Completed Scenarios";
      case "trending":
        return "Trending Scenarios";
      case "recommended":
        return "Recommended for You";
      default:
        return "All Scenarios";
    }
  };

  const getSectionIcon = () => {
    switch (activeFilter) {
      case "completed":
        return <Award className="section-icon" size={24} />;
      case "trending":
        return <TrendingUp className="section-icon" size={24} />;
      case "recommended":
        return <Zap className="section-icon" size={24} />;
      default:
        return <BookOpen className="section-icon" size={24} />;
    }
  };

  const renderScenarioCard = (scenario: ScenarioWithDialogues) => {
    const progressPercentage =
      scenario.totalDialogues > 0
        ? Math.round((scenario.completedCount / scenario.totalDialogues) * 100)
        : 0;

    return (
      <div
        key={scenario.id}
        className={`scenario-card ${scenario.isCompleted ? "completed" : ""} ${
          scenario.isTrending ? "trending" : ""
        }`}
      >
        <div className="card-header">
          <h3 className="scenario-title">{scenario.title}</h3>
          <div className="badges">
            {scenario.isCompleted && (
              <span className="badge completion-badge">Completed</span>
            )}
            {scenario.isTrending && (
              <span className="badge trending-badge">Trending</span>
            )}
          </div>
        </div>

        <p className="scenario-description">{scenario.description}</p>

        <div className="scenario-meta">
          <div className="meta-item">
            <span className="meta-value">{scenario.totalDialogues}</span>
            <span className="meta-label">Dialogues</span>
          </div>
          <div className="meta-item">
            <span className="meta-value">{progressPercentage}%</span>
            <span className="meta-label">Complete</span>
          </div>
          <div className="meta-item">
            <span className="meta-value">{scenario.completedCount}</span>
            <span className="meta-label">Finished</span>
          </div>
        </div>

        <div className="scenario-actions">
          {scenario.isCompleted ? (
            <>
              <Link to={`/scenario/${scenario.id}`} className="action-btn">
                <Award size={16} />
                Review
              </Link>
              <Link
                to={`/scenario/${scenario.id}`}
                className="action-btn primary"
              >
                <Play size={16} />
                Replay
              </Link>
            </>
          ) : (
            <Link
              to={`/scenario/${scenario.id}`}
              className="action-btn primary"
            >
              <Play size={16} />
              {scenario.completedCount > 0 ? "Continue" : "Start"}
            </Link>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    const emptyStates = {
      all: {
        icon: <BookOpen className="empty-icon" />,
        title: "No Scenarios Available",
        description:
          "There are no scenarios to display at the moment. Check back later for new content!",
        action: null,
      },
      completed: {
        icon: <CheckCircle className="empty-icon" />,
        title: "No Completed Scenarios",
        description:
          "You haven't completed any scenarios yet. Start practicing to see your progress here!",
        action: (
          <Link to="/explore" className="empty-action">
            <Play size={20} />
            Explore Scenarios
          </Link>
        ),
      },
      trending: {
        icon: <TrendingUp className="empty-icon" />,
        title: "No Trending Scenarios",
        description:
          "There are no trending scenarios at the moment. Check back later to see what's popular!",
        action: null,
      },
      recommended: {
        icon: <Star className="empty-icon" />,
        title: "No Recommendations",
        description:
          "Complete your profile and practice more scenarios to get personalized recommendations.",
        action: (
          <Link to="/settings" className="empty-action">
            <Users size={20} />
            Complete Profile
          </Link>
        ),
      },
    };

    const state = emptyStates[activeFilter];

    return (
      <div className="empty-state">
        {state.icon}
        <h3 className="empty-title">{state.title}</h3>
        <p className="empty-description">{state.description}</p>
        {state.action}
      </div>
    );
  };

  if (scenariosLoading || dialoguesLoading) {
    return (
      <div className="scenarios-page">
        <div className="scenarios-content">
          <div className="loading-state">
            <ProgressIndicator />
            <p className="loading-text">Loading scenarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scenarios-page">
      <div className="page-header">
        <h1>Your Scenarios</h1>
        <p className="description">
          Explore, practice, and track your progress through interactive social
          scenarios
        </p>

        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="form-input"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={handleClearSearch} className="clear-search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {(
              ["all", "completed", "trending", "recommended"] as FilterType[]
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-tab ${
                  activeFilter === filter ? "active" : ""
                }`}
              >
                {getFilterIcon(filter)}
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="scenarios-content">
        <div className="section-header">
          <h2>
            {getSectionIcon()}
            {getSectionTitle()}
            {searchQuery && (
              <span
                style={{ fontWeight: "normal", color: "var(--color-gray-500)" }}
              >
                {" "}
                for "{searchQuery}"
              </span>
            )}
          </h2>
        </div>

        {filteredScenarios.length > 0 ? (
          <div className="scenarios-grid">
            {filteredScenarios.map(renderScenarioCard)}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default YourScenariosPage;
