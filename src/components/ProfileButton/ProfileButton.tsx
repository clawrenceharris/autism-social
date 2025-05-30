import React from "react";
import "./ProfileButton.css";
import { assets } from "../../constants/assets";
import { Link } from "react-router-dom";
const ProfileButton = () => {
  return (
    <Link to={"/profile"} className="profile-button">
      <img width={512} height={512} src={assets.profile} alt="Profile" />
    </Link>
  );
};

export default ProfileButton;
