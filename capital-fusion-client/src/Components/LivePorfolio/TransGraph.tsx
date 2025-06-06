import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const url = "http://localhost:8080/api/v1/cashflowtransactions/filter";

type Transaction = {
  transactionDate: string;
  category: string;
  description: string;
  amount: number;
};

const Messages = {
  ERROR: "Please Login or backend issue",
};

const categories = ["Salary", "Rent", "Groceries", "Others"];

const TransGraph: FC = () => {
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startDate = "2024-01-01";
  const endDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        let totalIncome = 0;
        let totalExpense = 0;

        const fetchCategory = async (category: string) => {
          const token = localStorage.getItem("token") || "";
          const response = await axios.post(
            url,
            { startDate, endDate, category },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );
          return response.data as Transaction[];
        };

        for (const cat of categories) {
          const data = await fetchCategory(cat);
          const sum = data.reduce((acc, txn) => acc + txn.amount, 0);
          if (cat === "Salary") totalIncome += sum;
          else totalExpense += sum;
        }

        setIncome(totalIncome);
        setExpense(totalExpense);
      } catch (error) {
        setErrorMessage(Messages.ERROR);
        setIncome(0);
        setExpense(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [income, expense],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgb(75, 192, 192)",
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "white" },
      },
      x: {
        ticks: { color: "white" },
      },
    },
  };

  return (
    <div style={{
      backgroundColor: "#1e1e2f",
      borderRadius: "12px",
      padding: "20px",
      width: "400px",
      margin: "40px auto",
      color: "white",
    }}>
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Income vs Expense
      </h3>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {errorMessage && (
        <p style={{ textAlign: "center", color: "tomato" }}>{errorMessage}</p>
      )}
      {!loading && !errorMessage && <Line data={data} options={options} />}
    </div>
  );
};

export default TransGraph;
