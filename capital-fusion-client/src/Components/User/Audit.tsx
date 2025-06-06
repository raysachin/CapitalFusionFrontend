import React, { ChangeEvent, FC, useEffect, useState } from "react";
import axios from "axios";

export {}; // Ensure this is a module for TypeScript

const url = "http://localhost:8080/api/v1/assettransaction/filter";

type transaction = {
  transactionType: string;
  assetName: string;
  quantity: string | number;
  pricePerShare: string | number;
  transactionDate: string;
  transactionFee: string | number;
};

const Audit: FC = () => {
  const [state, setState] = useState({
    filtertype: "",
    filterName: "",
    startDate: "",
    endDate: "",
  });

  const [transactions, setTransactions] = useState<transaction[]>([]);
  const [masterTransactions, setMasterTransactions] = useState<transaction[]>([]);
  const [assets, setAssets] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");

  // Load all data once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .post(
        url,
        {
          transactionType: null,
          assetName: null,
          startDate: null,
          endDate: null,
        },
        {
          headers: {
            Authorization: token || "",
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const data: transaction[] = res.data;
        setMasterTransactions(data);
        setTransactions(data);

        const uniqueAssets: string[] = Array.from(
          new Set<string>(data.map((t) => t.assetName))
        );
        setAssets(uniqueAssets);
      })
      .catch((err) => {
        console.error("Error fetching data", err);
      });
  }, []);

  // Validation function
  const validateFilters = (): boolean => {
    if (!state.filtertype) {
      setValidationError("Please select a filter type.");
      return false;
    }

    if (state.filtertype === "Date") {
      if (!state.startDate || !state.endDate) {
        setValidationError("Please select both start and end dates.");
        return false;
      }
      if (new Date(state.startDate) > new Date(state.endDate)) {
        setValidationError("Start date cannot be after end date.");
        return false;
      }
      const today = new Date();
      const startDate = new Date(state.startDate);
      const endDate = new Date(state.endDate);

      if (startDate > today || endDate > today) {
        setValidationError("Start and end dates cannot be in the future.");
        return false;
      }
    } else {
      if (!state.filterName) {
        setValidationError(`Please select a valid ${state.filtertype}.`);
        return false;
      }
    }

    setValidationError("");
    return true;
  };

  // Apply filters whenever state changes
  useEffect(() => {
    if (!validateFilters()) {
      setTransactions([]);
      return;
    }

    let filtered = [...masterTransactions];

    if (state.filtertype === "Transaction Type") {
      filtered = filtered.filter(
        (txn) => txn.transactionType === state.filterName
      );
    } else if (state.filtertype === "Asset Name") {
      filtered = filtered.filter((txn) => txn.assetName === state.filterName);
    } else if (state.filtertype === "Date") {
      filtered = filtered.filter((txn) => {
        const txnDate = new Date(txn.transactionDate)
          .toISOString()
          .split("T")[0];
        return txnDate >= state.startDate && txnDate <= state.endDate;
      });
    }

    setTransactions(filtered);
  }, [state, masterTransactions]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "filtertype"
        ? { filterName: "", startDate: "", endDate: "" }
        : {}),
    }));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-black"
      style={{ height: "85vh" }}
    >
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center">
          <div className="col-12 col-sm-10 col-md-8">
            <br />
            <br />
            <div className="container mt-4">
              <div className="card bg-dark text-light">
                <div className="card-header text-center">
                  <h4>Transaction List</h4>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 offset-2">
                      <label>Filter Type</label>
                      <select
                        name="filtertype"
                        className="form-control"
                        value={state.filtertype}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select Filter
                        </option>
                        <option value="Transaction Type">Transaction Type</option>
                        <option value="Asset Name">Asset Name</option>
                        <option value="Date">Date</option>
                      </select>
                    </div>

                    {state.filtertype === "Transaction Type" && (
                      <div className="col-md-4">
                        <label>Transaction Type</label>
                        <select
                          name="filterName"
                          className="form-control"
                          value={state.filterName}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          <option value="Buy">Buy</option>
                          <option value="Sell">Sell</option>
                        </select>
                      </div>
                    )}

                    {state.filtertype === "Asset Name" && (
                      <div className="col-md-4">
                        <label>Asset Name</label>
                        <select
                          name="filterName"
                          className="form-control"
                          value={state.filterName}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select Asset
                          </option>
                          {assets.map((asset, index) => (
                            <option key={index} value={asset}>
                              {asset}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {state.filtertype === "Date" && (
                      <>
                        <div className="col-md-4">
                          <label>Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={state.startDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4 offset-6">
                          <label>End Date</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={state.endDate}
                            onChange={handleChange}
                            min={state.startDate}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="text-danger text-bold text-center mb-3">
                  {validationError}
                </div>
              )}

              {transactions.length > 0 && (
                <div className="card bg-dark text-light mt-4">
                  <div className="card-header text-center">
                    <h5>Transaction List</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-dark">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Asset</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Date</th>
                          <th>Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn, index) => (
                          <tr key={index}>
                            <td>{txn.transactionType}</td>
                            <td>{txn.assetName}</td>
                            <td>{txn.quantity}</td>
                            <td>{txn.pricePerShare}</td>
                            <td>{new Date(txn.transactionDate).toLocaleDateString()}</td>
                            <td>{txn.transactionFee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {transactions.length === 0 && !validationError && (
                <div className="text-warning text-bold text-center mt-3">
                  No transactions found for the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
