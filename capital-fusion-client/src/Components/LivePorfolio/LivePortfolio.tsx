import React, { useEffect, useState, FC } from "react";
import axios from "axios";
import AssetPieChart from "./Assetpiechart";
import AssetTransPie from "./AssetTransPie";
import TransGraph from "./TransGraph";

const currencies = ["USD", "EUR", "GBP", "JPY", "INR"];
const conversionRates: Record<string, number> = {
  INR: 1,
  USD: 1 / 83.2,
  EUR: 1 / 91.2,
  GBP: 1 / 106.7,
  JPY: 1 / 0.56,
};

const tableUrl = "http://localhost:8080/api/v1/portfoliovalue/user";

const LivePortfolio: FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [value, setValue] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");

  useEffect(() => {
    fetchValue();
  }, []);

  const fetchValue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.get(tableUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      setValue(res.data);
    } catch (err) {
      setErrorMessage("Failed to fetch assets.");
    } finally {
      setLoading(false);
    }
  };

  const conversionRate = conversionRates[selectedCurrency];
  const convertedValue = value * conversionRate;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000",
      color: "white",
      padding: "30px 20px",
      paddingTop: "80px",
    }}>
      <h3 className="text-center mb-4" style={{ fontWeight: "bold", color: "#3495db" }}>
        Live Portfolio Dashboard
      </h3>

      {/* Portfolio Value Card */}
      <div style={{
        maxWidth: 520,
        margin: "0 auto 50px auto",
        background: "linear-gradient(135deg, #222238 0%, #1a1a2e 100%)",
        borderRadius: "16px",
        padding: "30px 25px",
        boxShadow: "0 8px 20px rgba(52, 149, 219, 0.3)",
        color: "white",
      }}>
        <h4 className="mb-4" style={{
          borderBottom: "2px solid #3495db",
          paddingBottom: 12,
          fontWeight: "600",
          fontSize: "1.3rem",
          color: "#61dafb",
        }}>
          Real Time Portfolio Value
        </h4>

        {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
        {errorMessage && (
          <p style={{
            color: "#ff6b6b",
            fontWeight: "600",
            textAlign: "center",
          }}>{errorMessage}</p>
        )}

        {!loading && !errorMessage && (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "25px",
              fontSize: "2.3rem",
              fontWeight: "bold",
            }}>
              <span>💰</span>
              <span>{selectedCurrency} {convertedValue.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="currency" style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#61dafb",
              }}>
                Display Currency
              </label>
              <select
                id="currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #3495db",
                  backgroundColor: "#121224",
                  color: "white",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>

            <p style={{
              fontStyle: "italic",
              fontSize: "0.85rem",
              color: "#7a8a9c",
              textAlign: "center",
            }}>
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "25px",
        marginBottom: "30px",
      }}>
        <AssetPieChart />
        <AssetTransPie />
      </div>

      {/* Graph */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <TransGraph />
      </div>
    </div>
  );
};

export default LivePortfolio;
