import React, { FC, useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { validateStartDate, validateEndDate } from "../Validators/Validation";

const url = "http://localhost:8080/api/v1/cashflowtransactions/filter";

type TransactionFilterState = {
  startDate: Date;
  endDate: Date;
  category: string;
};

type Transaction = {
  transactionDate: string;
  category: string;
  description: string;
  amount: number;
};

const Messages = {
  START_DATE_ERROR: "Should be before current date",
  END_DATE_ERROR: "Should be after start date and before current date",
  ERROR: "Please Login",
  MANDATORY: "Enter all the form fields",
  INVALID_TOKEN: "Please login",
  SUCCESS: "Filtered successfully",
  NO_DATA: "No transactions found for the selected filters.",
};

const categoryList = ["Salary", "Rent", "Groceries", "Others"];

const TransactionFilter: FC = () => {
  const [state, setState] = useState<TransactionFilterState>({
    startDate: new Date(),
    endDate: new Date(),
    category: "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mandatory, setMandatory] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [valid, setValid] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");

  const [formErrors, setFormErrors] = useState({
    startDateError: "",
    endDateError: "",
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!state.startDate || !state.endDate || !state.category) {
      setErrorMessage("");
      setTransactions([]);
      setSuccessMessage("");
      setNoDataMessage("");
      setMandatory(Messages.MANDATORY);
      return;
    }

    setErrorMessage("");
    setMandatory("");
    setSuccessMessage("");
    setNoDataMessage("");

    const token = localStorage.getItem("token");

    axios
      .post(url, state, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })
      .then((response) => {
        const resData = response.data;

        if (Array.isArray(resData)) {
          setTransactions(resData);

          if (resData.length > 0) {
            setSuccessMessage(Messages.SUCCESS);
            setNoDataMessage("");
          } else {
            setNoDataMessage(Messages.NO_DATA);
          }
        } else if (resData === "Invalid or expired token, Please Login") {
          setTransactions([]);
          setErrorMessage(Messages.INVALID_TOKEN);
        } else {
          setErrorMessage(Messages.ERROR);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorMessage(Messages.ERROR);
        setTransactions([]);
      });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setState((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name: string, value: any) => {
    const errors = { ...formErrors };

    switch (name) {
      case "startDate":
        errors.startDateError = validateStartDate(value) ? "" : Messages.START_DATE_ERROR;
        break;
      case "endDate":
        errors.endDateError = validateEndDate(state.startDate, value)
          ? ""
          : Messages.END_DATE_ERROR;
        break;
    }

    setFormErrors(errors);
    setValid(Object.values(errors).every((val) => val === ""));
  };

  return (
    <div className="d-flex justify-content-center align-items-start bg-black" style={{ minHeight: "100vh" }}>
      <div className="container-fluid h-100 px-0">
        <div className="justify-content-center w-100 m-0">
          <div className="col-md-8 offset-2">
            <div className="card bg-dark text-light custom-shadow mt-5">
              <div className="card-header text-center border-base">
                <h4 className="text-base my-0">Outflow Filtered</h4>
              </div>

              <form className="form" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="startDate" className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      name="startDate"
                      onChange={handleChange}
                    />
                    <div className="text-warning">{formErrors.startDateError}</div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      name="endDate"
                      onChange={handleChange}
                    />
                    <div className="text-warning">{formErrors.endDateError}</div>
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-control"
                      id="category"
                      name="category"
                      value={state.category}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select Category</option>
                      {categoryList.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center mt-3">
                    <button className="btn btn-primary" disabled={!valid}>Apply Filters</button>
                  </div>

                  {mandatory && <div className="text-warning text-center">{mandatory}</div>}
                  {successMessage && <div style={{ color: "chartreuse" }} className="text-center">{successMessage}</div>}
                  {errorMessage && <div className="text-warning text-center">{errorMessage}</div>}
                  {noDataMessage && <div className="text-warning text-center">{noDataMessage}</div>}
                </div>
              </form>
            </div>

            {transactions.length > 0 && (
              <div className="card bg-dark text-light custom-shadow mt-4">
                <div className="card-header text-center">
                  <h5>Filtered Transactions</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-dark mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, index) => (
                        <tr key={index}>
                          <td>{new Date(txn.transactionDate).toLocaleDateString()}</td>
                          <td>{txn.category}</td>
                          <td>{txn.description}</td>
                          <td>${txn.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilter;
