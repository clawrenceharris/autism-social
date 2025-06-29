import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Star,
  Users,
  Award,
} from "lucide-react";
import "./ScenariosPage.scss";
import { useScenarioStore } from "../../store/useScenarioStore";
import { ProgressIndicator, ScenarioCard } from "../../components";
import {
  useRecommendationsStore,
  useProgressStore,
  useDialogueStore,
} from "../../store";

type FilterType = "all" | "completed" | "trending" | "recommended";

const ScenariosPage = () => {
  const {
    scenarios,

    loading: scenariosLoading,
    fetchScenarios,
  } = useScenarioStore();
  const { fetchDialogues, loading: dialoguesLoading } = useDialogueStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { progress } = useProgressStore();
  const { recommendedDialogues } = useRecommendationsStore();

  useEffect(() => {
    fetchScenarios();
    fetchDialogues();
  }, [fetchScenarios, fetchDialogues]);

  // Filter scenarios based on search and active filter
  const filteredScenarios = useMemo(() => {
    let filtered = Object.values(scenarios).filter(Boolean);

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
    if (activeFilter === "all") {
      filtered = filtered.filter(() => true);
    } else if (activeFilter === "completed") {
      filtered = filtered.filter(
        (scenario) =>
          scenario.dialogues.length &&
          scenario.dialogues.every((d) =>
            progress.map((p) => p.dialogue_id).includes(d.id)
          )
      );
    } else if (activeFilter === "recommended") {
      filtered = filtered.filter((scenario) =>
        recommendedDialogues.map((d) => d.scenario_id).includes(scenario.id)
      );
    }
    return filtered;
  }, [activeFilter, progress, recommendedDialogues, scenarios, searchQuery]);

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
        return <Star className="section-icon" size={24} />;
      default:
        return <BookOpen className="section-icon" size={24} />;
    }
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
        action: null,
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
      <div className="loading-state">
        <ProgressIndicator />
      </div>
    );
  }

  return (
    <div className="scenarios-container">
      <div className="page-header">
        <div>
          <h1>Scenarios</h1>
          <p className="description">
            Explore, practice, and track your progress through interactive
            social scenarios
          </p>{" "}
        </div>

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
            {filteredScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default ScenariosPage;
