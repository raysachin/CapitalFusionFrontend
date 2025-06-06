import React, { FC, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, Tooltip, Legend);

const HistoricalAllocationSnapshotsViewer: FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [allocation, setAllocation] = useState<{ [key: string]: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [noData, setNoData] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchSnapshot = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must not be after end date.");
      return;
    }

    setLoading(true);
    setError("");
    setAllocation(null);
    setNoData(false);

    const apiUrl = "http://localhost:8080/api/v1/asset/asset-allocation";
    const token = localStorage.getItem("token");
    const payload = { startDate, endDate };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });

      const result = response.data;
      console.log("API result:", result);

      if (typeof result === "object" && result !== null) {
        const hasOnlyNullOrZero = Object.entries(result).every(
          ([key, value]) => key === null || key === "null" || value === 0
        );

        if (hasOnlyNullOrZero || Object.keys(result).length === 0) {
          setNoData(true);
          setAllocation(null);
        } else {
          setNoData(false);
          setAllocation(result);
        }
      } else {
        setError("Invalid data format received from server.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!allocation) return;

    const headers = ["Asset Class", "Allocation (%)"];
    const rows = Object.entries(allocation).map(([key, value]) => [key, value]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `allocation_snapshot_${startDate}_to_${endDate}.csv`);
  };

  const chartData = allocation
    ? {
        labels: Object.keys(allocation),
        datasets: [
          {
            data: Object.values(allocation),
            backgroundColor: [
              "#4e73df",
              "#1cc88a",
              "#36b9cc",
              "#f6c23e",
              "#e74a3b",
              "#858796",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: "85vh" }}>
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 mb-5">
            <br />
            <div className="text-center text-base text-center">
              <h4>Historical Allocation Snapshot Viewer</h4>
            </div>
            <br />

            <div className="card bg-dark text-light custom-shadow">
              <div className="card-body">
                <h5 className="card-title text-base my-0">Select Date Range</h5>
                <br />

                <div className="form-row d-flex gap-3 mb-3 justify-content-center">
                  <input
                    type="date"
                    className="form-control"
                    style={{ maxWidth: 180 }}
                    value={startDate}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control"
                    style={{ maxWidth: 180 }}
                    value={endDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={fetchSnapshot}
                    disabled={!startDate || !endDate || loading}
                  >
                    {loading ? "Loading..." : "View Snapshot"}
                  </button>
                </div>

                {error && <div className="text-danger text-center mb-3">{error}</div>}

                {noData && (
                  <div className="text-warning text-center mb-3">
                    No data is available for the selected date range.
                  </div>
                )}

                {allocation && (
                  <>
                    <div className="d-flex justify-content-center mb-4">
                      <div style={{ maxWidth: 400 }}>{chartData && <Pie data={chartData} />}</div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered table-dark mb-4">
                        <thead>
                          <tr>
                            <th>Asset Class</th>
                            <th>Allocation (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(allocation).map(([key, value]) => (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>{value}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-center">
                      <button className="btn btn-success" onClick={handleExport}>
                        Export Snapshot as CSV
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAllocationSnapshotsViewer;
