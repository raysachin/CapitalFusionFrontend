import React, { ChangeEvent, FC, FormEvent, useState } from "react";
import { validatefilterName, validatefiltertype } from "../../Validators/Validation";
import axios from "axios";

const url: string = "http://localhost:8080/api/v1/assettransaction/filter";

type transactionlist = {
  filtertype: string;
  filterName: string;
};

type transaction = {
  type: string;
  Asset: string;
  quantity: number;
  price: number;
  date: Date;
  fee: number;
  Actions: string;
};

const TransactionList: FC = () => {
  const [state, setState] = useState<transactionlist>({
    filtertype: "",
    filterName: "",
  });

  const [transactions, setTransactions] = useState<transaction[]>([]);
  const [mandatory, setMandatory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [valid, setValid] = useState(false);

  const Messages = {
    TYPERROR: "Please select appropriate type",
    NAMEERROR: "Name should be valid",
    SUCCESS: "Successfully Filtered Data",
    ERROR: "Please run the backend",
    MANDATORY: "Enter all the form fields",
  };

  type FormErrorState = {
    filtertypeError: string;
    filternameError: string;
  };

  const [formErrors, setFormErrors] = useState<FormErrorState>({
    filtertypeError: "",
    filternameError: "",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    let { name, value } = event.target;

    setState({
      ...state,
      [name]: value,
    });

    validateField(name, value);
  };

  const validateField = (name: string, value: any): void => {
    let errors = { ...formErrors };

    switch (name) {
      case "filtertype":
        errors.filtertypeError = validatefiltertype(value) ? "" : Messages.TYPERROR;
        break;
      case "filterName":
        errors.filternameError = validatefilterName(value) ? "" : Messages.NAMEERROR;
        break;
    }

    setFormErrors(errors);
    setValid(Object.values(errors).every((val) => val === ""));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!state.filtertype || !state.filterName) {
      setMandatory(Messages.MANDATORY);
      return;
    }

    const istypeValid = validatefiltertype(state.filtertype);
    const isNameValid = validatefilterName(state.filterName);

    setFormErrors({
      filtertypeError: istypeValid ? "" : Messages.TYPERROR,
      filternameError: isNameValid ? "" : Messages.NAMEERROR,
    });

    if (!istypeValid || !isNameValid) {
      setValid(false);
      return;
    }

    setMandatory("");

    axios
      .post(url, state)
      .then((response) => {
        setTransactions(response.data);
        setSuccessMessage(Messages.SUCCESS);
        setErrorMessage("");
      })
      .catch((error) => {
        setTransactions([]);
        setSuccessMessage("");
        setErrorMessage(Messages.ERROR);
      });
  };

  return (
    <React.Fragment>
      <div className="d-flex justify-content-center align-items-start bg-black" style={{ minHeight: "100vh" }}>
        <div className="container-fluid h-100 px-0">
          <div className="justify-content-center w-100 m-0">
            <div className="col-md-8 offset-2">
              <div className="card bg-dark text-light custom-shadow mt-5">
                <div className="card-header text-center border-base">
                  <h4 className="text-base my-0">Transaction List</h4>
                </div>
                <br />
                <form className="form" onSubmit={handleSubmit}>
                  <div className="row mb-2">
                    <div className="col-md-4 offset-md-2">
                      <div className="form-group">
                        <label htmlFor="filtertype" className="fs-5">
                          Asset Type
                        </label>
                        <br />
                        <select
                          name="filtertype"
                          id="filtertype"
                          value={state.filtertype}
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="">--Select the Assets name</option>
                          <option value="filtertype">Stock</option>
                          <option value="filtertype">Bond</option>
                          <option value="filtertype">Rent</option>
                          <option value="filtertype">Others</option>
                        </select>
                        <div className="text-danger">{formErrors.filtertypeError}</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="filterName" className="fs-5">
                          Asset Name
                        </label>
                        <br />
                        <input
                          type="text"
                          name="filterName"
                          id="filterName"
                          value={state.filterName}
                          onChange={handleChange}
                          className="form-control"
                        />
                        <div className="text-danger">{formErrors.filternameError}</div>
                      </div>
                    </div>
                    <br />
                    <br />
                    <div className="text-center mt-3">
                      <button className="btn btn-primary text-light" name="applyFilters" disabled={!valid}>
                        Apply Filters
                      </button>
                    </div>
                    {mandatory && <div className="text-danger text-center">{mandatory}</div>}
                    {successMessage && <div className="text-success text-center">{successMessage}</div>}
                    {errorMessage && <div className="text-danger text-center">{errorMessage}</div>}
                  </div>
                </form>
              </div>
              <br />
              <br />
              {/* Transaction Table */}
              {transactions.length > 0 && (
                <div className="card bg-dark text-light custom-shadow mt-4">
                  <div className="card-header text-center">
                    <h5>Transacton List</h5>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-dark mb-0">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Asset</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>dDate</th>
                          <th>Fee</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn, index) => (
                          <tr key={index}>
                            <td>{txn.type}</td>
                            <td>{txn.Asset}</td>
                            <td>{txn.quantity}</td>
                            <td>${txn.price}</td>
                            <td>{new Date(txn.date).toLocaleDateString()}</td>
                            <td>{txn.fee}</td>
                            <td>
                              <button className="btn btn-sm btn-danger">Delete</button>
                            </td>
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
    </React.Fragment>
  );
};

export default TransactionList;
