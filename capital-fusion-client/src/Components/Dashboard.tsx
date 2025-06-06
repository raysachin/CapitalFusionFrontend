import React from "react";
import { benefits } from "../constants/index";
import bgimg from "../Components/assets/card-1.svg";
import bgcard from "../Components/assets/cardbg.jpg";
import { GradientLight } from "./design/Gradient";
import cardimg from "../Components/assets/daily.png";
import './Dashboard.css';

const Dashboard = () => {
  return (
    <React.Fragment>
      <div className="features-section">
        <div className="container">
          <div className="features-list">
            {benefits.map((item) => (
              <div className="feature-card" key={item.id}>
                {/* Background image (optional) */}
                {/* <img src={bgimg} alt="cardround" className="feature-background-img" /> */}

                <div className="feature-content">
                  <h2 className="feature-title">{item.title}</h2>
                  <img
                    src={item.img}
                    alt="cardimage"
                    width={230}
                    height={230}
                    className="cardimage rounded"
                  />
                </div>

                <div className="overlay">
                  <p className="feature-overlay-text">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
