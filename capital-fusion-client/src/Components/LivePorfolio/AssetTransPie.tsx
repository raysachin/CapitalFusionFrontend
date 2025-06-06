import React, { FC, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Transaction = {
  transactionType: string;
  assetName: string;
  quantity: number;
  pricePerShare: number;
  transactionDate: string;
  fee: number;
};

const AssetTransactionBarChart: FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.post(
        "http://localhost:8080/api/v1/assettransaction/filter",
        {
          filtertype: null,
          filterName: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      const rawData: Transaction[] = response.data;

      if (Array.isArray(rawData)) {
        setTransactions(rawData);
      } else {
        setError("Invalid response format.");
      }
    } catch (err) {
      console.error("Error fetching asset transactions", err);
      setError("Failed to load asset transaction data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const grouped: Record<string, number> = transactions.reduce((acc, curr) => {
    const key = curr.transactionType;
    acc[key] = (acc[key] || 0) + curr.quantity;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Quantity",
        data: Object.values(grouped),
        backgroundColor: ["#007bff", "#dc3545"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: () => "", // disables tooltip text
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity",
        },
      },
      x: {
        title: {
          display: true,
          text: "Transaction Type",
        },
      },
    },
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 600,
        right: 40,
        width: "350px",
        backgroundColor: "#1e1e2f",
        borderRadius: "12px",
        paddingTop: "60px",
        color: "white",
        height: 300,
        boxShadow: "0 0 10px rgba(255,255,255,0.1)",
        zIndex: 1000,
      }}
    >
      <h6 className="text-center mb-3">Buy vs Sell (by Quantity)</h6>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && <Bar data={chartData} options={chartOptions} />}
    </div>
  );
};

export default AssetTransactionBarChart;
