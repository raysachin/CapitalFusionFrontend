import React, { FC, useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

type Allocation = {
  Stocks: number;
  Bonds: number;
  RealEstate: number;
  Others: number;
};

const RebalancingRecommendation: FC = () => {
  const [target] = useState<Allocation>({ Stocks: 40, Bonds: 30, RealEstate: 20, Others: 10 });
  const [current, setCurrent] = useState<Allocation>({ Stocks: 0, Bonds: 0, RealEstate: 0, Others: 0 });
  const [adjustment, setAdjustment] = useState<Record<keyof Allocation, string>>({
    Stocks: "40",
    Bonds: "30",
    RealEstate: "20",
    Others: "10"
  });
  const [userResponse, setUserResponse] = useState<"accepted" | "declined" | "pending">("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssetsFromBackend();
  }, []);

  useEffect(() => {
    if (userResponse === "accepted") {
      const total = Object.values(getAdjustedValues()).reduce((acc, val) => acc + val, 0);
      if (total !== 100) {
        setError("Total allocation must be exactly 100%");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  }, [adjustment, userResponse]);

  const fetchAssetsFromBackend = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.get("http://localhost:8080/api/v1/asset/type-counts", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        }
      });

      const rawData = response.data;
      const newCurrent: Allocation = { Stocks: 0, Bonds: 0, RealEstate: 0, Others: 0 };

      Object.entries(rawData).forEach(([key, value]) => {
        switch (key.toLowerCase()) {
          case "stock":
            newCurrent.Stocks = Math.round(Number(value)) || 0;
            break;
          case "bond":
            newCurrent.Bonds = Math.round(Number(value)) || 0;
            break;
          case "realestate":
            newCurrent.RealEstate = Math.round(Number(value)) || 0;
            break;
          case "eta":
          case "ornaments":
            newCurrent.Others += Math.round(Number(value)) || 0;
            break;
        }
      });

      setCurrent(newCurrent);
    } catch (error) {
      console.error("Error fetching asset data:", error);
      setError("Failed to fetch asset data from backend.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || (/^\d{1,3}$/.test(value) && Number(value) <= 100)) {
      setAdjustment(prev => ({ ...prev, [name]: value }));
    }
  };

  const recommendation = () => {
    const rec: string[] = [];
    (["Stocks", "Bonds", "RealEstate", "Others"] as (keyof Allocation)[]).forEach(asset => {
      const diff = target[asset] - current[asset];
      if (diff > 0) rec.push(`Buy ${diff}% of ${asset.replace(/([A-Z])/g, " $1")}`);
      else if (diff < 0) rec.push(`Sell ${Math.abs(diff)}% of ${asset.replace(/([A-Z])/g, " $1")}`);
    });
    return rec.length ? rec.join(", ") : "No changes required.";
  };

  const getAdjustedValues = (): Allocation => ({
    Stocks: parseInt(adjustment.Stocks) || 0,
    Bonds: parseInt(adjustment.Bonds) || 0,
    RealEstate: parseInt(adjustment.RealEstate) || 0,
    Others: parseInt(adjustment.Others) || 0
  });

  const chartData = {
    labels: ["Stocks", "Bonds", "Real Estate", "Others"],
    datasets: [
      {
        label: "Current Allocation",
        data: [current.Stocks, current.Bonds, current.RealEstate, current.Others],
        backgroundColor: ["#007bff", "#28a745", "#6f42c1", "#fd7e14"]
      },
      ...(userResponse === "accepted"
        ? [{
            label: "Adjusted Allocation",
            data: Object.values(getAdjustedValues()),
            backgroundColor: ["#6610f2", "#20c997", "#ffc107", "#17a2b8"]
          }]
        : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: '85vh' }}>
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center">
          <div className="col-12 col-sm-10 col-md-8">
            <br /><br />
            <div className="container mt-4 text-base">
              <h4>Rebalancing Recommendation</h4>

              <div className="d-flex justify-content-between my-3 text-light">
                <div>
                  <strong>🎯 Target Allocation:</strong><br />
                  Stocks: {target.Stocks}%, Bonds: {target.Bonds}%, Real Estate: {target.RealEstate}%, Others: {target.Others}%
                </div>
                <div>
                  <strong>📊 Current Allocation:</strong><br />
                  Stocks: {current.Stocks}%, Bonds: {current.Bonds}%, Real Estate: {current.RealEstate}%, Others: {current.Others}%
                </div>
              </div><br />

              <div className="alert alert-info">
                <strong>📌 Recommendation:</strong> {recommendation()}
              </div><br />

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row">
                {(["Stocks", "Bonds", "RealEstate", "Others"] as (keyof Allocation)[]).map(asset => (
                  <div className="col-md-6 mb-3 text-light" key={asset}>
                    <label>Adjust {asset.replace(/([A-Z])/g, " $1")} (%):</label>
                    <input
                      type="number"
                      name={asset}
                      className="form-control"
                      value={adjustment[asset]}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      disabled={userResponse !== "accepted"}
                    />
                  </div>
                ))}
              </div>

              {userResponse === "pending" && (
                <div className="d-flex mt-3">
                  <button className="btn btn-success me-2" onClick={() => setUserResponse("accepted")}>✅ Accept</button>
                  <button className="btn btn-danger" onClick={() => setUserResponse("declined")}>❌ Decline</button>
                </div>
              )}

              {userResponse === "accepted" && (
                <div className="d-flex mt-3">
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => window.location.href = "/asset-data-entry"}
                  >
                    Update Asset
                  </button>
                </div>
              )}

              {userResponse === "declined" && (
                <div className="alert alert-warning mt-3 text-center">
                  ❌ You have declined the recommendation. Adjustments are disabled.
                </div>
              )}

              <div style={{ width: "300px", height: "300px", margin: "auto", marginTop: "40px" }}>
                <Pie data={chartData} options={chartOptions} />
              </div>

              <div className="mt-4 text-light">
                <strong>🔍 Reason:</strong> To align portfolio with target risk profile
              </div>
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancingRecommendation;
