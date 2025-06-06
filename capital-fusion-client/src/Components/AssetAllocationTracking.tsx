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

type AssetClass = {
  id: string;
  name: string;
  percentage: number;
};

const tableUrl: string = "http://localhost:8080/api/v1/asset/type-counts";

const AssetAllocationPanel: FC = () => {
  const [assets, setAssets] = useState<AssetClass[]>([]);
  const [originalAssets, setOriginalAssets] = useState<AssetClass[]>([]);
  const [newAssetName, setNewAssetName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssetsFromBackend();
  }, []);

  const fetchAssetsFromBackend = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      const response = await axios.get(tableUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const rawData = response.data;
      const transformed: AssetClass[] = Object.entries(rawData).map(
        ([key, value]) => ({
          id: key.toLowerCase().replace(/\s+/g, "-"),
          name: key,
          percentage: Math.round(Number(value)),
        })
      );

      setAssets(transformed);
      setOriginalAssets(transformed);
    } catch (e) {
      console.error("Error fetching data", e);
      setError("Failed to fetch asset data from backend.");
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = assets.reduce((acc, a) => acc + a.percentage, 0);

  const handlePercentageChange = (id: string, value: number) => {
    const updatedAssets = assets.map((a) =>
      a.id === id ? { ...a, percentage: value } : a
    );
    setAssets(updatedAssets);
  };

  const handleNameChange = (id: string, value: string) => {
    const updatedAssets = assets.map((a) =>
      a.id === id ? { ...a, name: value } : a
    );
    setAssets(updatedAssets);
  };

  const handleAddAsset = () => {
    if (!newAssetName.trim()) {
      setStatus("Asset name cannot be empty.");
      return;
    }

    if (
      assets.some(
        (a) => a.name.toLowerCase() === newAssetName.trim().toLowerCase()
      )
    ) {
      setStatus("Asset class already exists.");
      return;
    }

    const newAsset: AssetClass = {
      id: newAssetName.toLowerCase().replace(/\s+/g, "-"),
      name: newAssetName.trim(),
      percentage: 0,
    };

    setAssets([...assets, newAsset]);
    setNewAssetName("");
    setStatus("");
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleReset = () => {
    setAssets(originalAssets);
    setStatus("");
  };

  const handleSave = () => {
    if (totalPercentage !== 100) {
      setStatus("Total allocation must equal 100%.");
      return;
    }

    setStatus("Changes saved successfully.");
  };

  const chartData = {
    labels: assets.map((a) => a.name),
    datasets: [
      {
        data: assets.map((a) => a.percentage),
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
          "#858796",
          "#fd7e14",
          "#6f42c1",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-black"
      style={{ height: "85vh" }}
    >
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 mb-5">
            <br />
            <br />
            <div className="text-center text-base">
              <h4>Asset Allocation Panel</h4>
            </div>
            <br />

            <div className="card bg-dark text-light custom-shadow">
              <div className="card-body">
                <h5 className="card-title text-base my-0">Manage Allocation</h5>
                <br />

                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  assets.map(({ id, name, percentage }) => (
                    <div className="form-group mb-3" key={id}>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          style={{ maxWidth: 150 }}
                          value={name}
                          onChange={(e) => handleNameChange(id, e.target.value)}
                        />
                        <div className="input-group" style={{ maxWidth: 120 }}>
                          <input
                            type="number"
                            className="form-control"
                            value={percentage}
                            min={0}
                            max={100}
                            onChange={(e) =>
                              handlePercentageChange(id, Number(e.target.value))
                            }
                          />
                          <span className="input-group-text">%</span>
                        </div>
                        <input
                          type="range"
                          className="form-range flex-grow-1"
                          min={0}
                          max={100}
                          value={percentage}
                          onChange={(e) =>
                            handlePercentageChange(id, Number(e.target.value))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm d-flex justify-content-center align-items-center"
                          style={{
                            width: 32,
                            height: 32,
                            padding: 0,
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                          onClick={() => handleRemoveAsset(id)}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Add new asset */}
                <div className="form-group mb-3 d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New asset class name"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-flex justify-content-center align-items-center"
                    style={{
                      width: 32,
                      height: 32,
                      padding: 0,
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                    onClick={handleAddAsset}
                    title="Add"
                  >
                    +
                  </button>
                </div>

                {/* Total Allocation */}
                <div className="mb-3">
                  <strong>Total Allocation: </strong>
                  <span
                    className={
                      totalPercentage === 100
                        ? "text-success text-bold"
                        : "text-danger text-bold"
                    }
                  >
                    {totalPercentage.toFixed(2)}%
                  </span>
                  {totalPercentage !== 100 && (
                    <div className="text-warning text-bold">
                      Total must be 100%.
                    </div>
                  )}
                </div>

                {/* Pie Chart */}
                <div className="mb-4 d-flex justify-content-center">
                  <div style={{ maxWidth: 400 }}>
                    <Pie
                      data={chartData}
                      options={{
                        plugins: {
                          legend: {
                            labels: {
                              color: "white",
                            },
                          },
                          tooltip: {
                            bodyColor: "white",
                            titleColor: "white",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={totalPercentage !== 100}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>

                <br />
                {status && (
                  <div className="text-info text-center fs-5">{status}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationPanel;
