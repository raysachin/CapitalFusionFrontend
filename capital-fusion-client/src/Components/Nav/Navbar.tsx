import React, { useEffect, useState } from "react";
// import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Logoo from "../assets/logo_final.png";
import NavbarList from "./NavbarList";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const changeWidth = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", changeWidth);
    return () => {
      window.removeEventListener("resize", changeWidth);
    };
  }, []);

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <React.Fragment>
      <header style={{ height: "15vh", backgroundColor: "black" }}>
        <nav className="container d-flex justify-content-between align-items-center">
          <a href="/" className="navbar-brand mt-3 mb-2">
            <img src={Logoo} alt="Logo" height={70} width={75} />
          </a>

          <div className="d-none d-md-block">
            <NavbarList ulstyles="nav" listyles="nav-item px-3" />
          </div>

          {/* <div className="d-block d-md-none" onClick={handleNav} role="button">
            {nav ? (
              <span>
                <AiOutlineClose size={24}></AiOutlineClose>
              </span>
            ) : (
              <span>
                <AiOutlineMenu size={24}></AiOutlineMenu>
              </span>
            )}
          </div> */}
        </nav>

        <MobileNavbar nav={nav} screenWidth={screenWidth} />
      </header>
    </React.Fragment>
  );
};

export default Navbar;
