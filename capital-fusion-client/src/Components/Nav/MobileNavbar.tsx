import React from "react";
import NavbarList from "./NavbarList";

interface MobileNavbarProps {
  nav: boolean;
  screenWidth: number;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ nav, screenWidth }) => {
  const isVisible = nav && screenWidth <= 1000;

  return (
    <React.Fragment>
      <div
        className={`text-white d-md-none ${isVisible ? "d-block" : "d-none"}`}
        style={{ backgroundColor: "black" }}
      >
        <div className="container py-3">
          <NavbarList ulstyles="list-unstyled" listyles="py-2" />
        </div>
      </div>
    </React.Fragment>
  );
};

export default MobileNavbar;
