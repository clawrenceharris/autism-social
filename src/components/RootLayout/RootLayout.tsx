import React from "react";
import "./RootLayout.css";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Navigation from "../Navigation";
const RootLayout = () => {
  return (
    <div>
      <main>
        <Navigation />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
