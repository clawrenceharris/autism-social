import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navigation.css";
import { assets } from "../../constants/assets";
import { ProfileButton } from "../";

const Navigation = () => {
  return (
    <nav id="nav">
      <div className="nav-top">
        <Link to="/">
          <img
            width={198}
            height={198}
            className="logo"
            src={assets.logo}
            alt="Logo"
          />
        </Link>
        <div>
          <ProfileButton />
          <h2>You</h2>
        </div>
      </div>

      <ul>
        <li>
          <NavLink to="/">
            {({ isActive }) => (
              <span className={isActive ? "active" : ""}>Dashboard</span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink to="/scenarios">
            {({ isActive }) => (
              <span className={isActive ? "active" : ""}>Scenarios</span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink to="/progress">
            {({ isActive }) => (
              <span className={isActive ? "active" : ""}>Progress</span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink to={"/customize"}>
            {({ isActive }) => (
              <span className={isActive ? "active" : ""}>Customize</span>
            )}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
