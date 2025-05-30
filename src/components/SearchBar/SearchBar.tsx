import { HTMLAttributes, useState } from "react";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";
import { assets } from "../../constants/assets";
const SearchBar = (props: HTMLAttributes<HTMLInputElement>) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };
  return (
    <form className="searchbar-container">
      <input
        onChange={onChange}
        className="input searchbar"
        type="text"
        placeholder="Search"
        {...props}
      />
      <button
        type="submit"
        aria-label="Search"
        disabled={!query}
        className="search-btn"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/search?query=${query}`);
        }}
      >
        <img src={assets.search} alt="Search" />
      </button>
    </form>
  );
};

export default SearchBar;
