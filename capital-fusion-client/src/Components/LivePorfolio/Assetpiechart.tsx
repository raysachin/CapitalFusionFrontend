import React, { FC, useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

type AssetClass = {
  name: string;
  percentage: number;
};

const AssetPieChart: FC = () => {
  const [assets, setAssets] = useState<AssetClass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchAssets = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.get("http://localhost:8080/api/v1/asset/type-counts", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const data = response.data;
      const transformed: AssetClass[] = Object.entries(data).map(([key, value]) => ({
        name: key,
        percentage: Math.round(Number(value)),
      }));

      setAssets(transformed);
    } catch (err) {
      console.error("Error fetching asset chart data", err);
      setError("Failed to load chart data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const chartData = {
    labels: assets.map((a) => a.name),
    datasets: [
      {
        data: assets.map((a) => a.percentage),
        backgroundColor: [
          "#4e73df", "#1cc88a", "#36b9cc", "#f6c23e",
          "#e74a3b", "#858796", "#fd7e14", "#6f42c1",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        left: 90,
        width: 250,
        height: 300,
        backgroundColor: "#1e1e2f",
        borderRadius: "12px",
        padding: "10px",
        color: "white",
        boxShadow: "0 0 10px rgba(255,255,255,0.1)",
      }}
    >
      <h6 className="text-center">Asset Allocation</h6>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && assets.length > 0 && (
        <Pie
          data={chartData}
          options={{
            plugins: {
              legend: {
                labels: { color: "white" },
              },
              tooltip: {
                bodyColor: "white",
                titleColor: "white",
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default AssetPieChart;
