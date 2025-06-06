import React, { ChangeEvent, FC, FormEvent, useState } from "react";
import axios from "axios";
import { validateAmount, validateDate } from "../Validators/Validation";

const url: string = "http://localhost:8080/api/v1/cashflowtransactions/add";

type TransactionState = {
  transactionDate: string;
  amount: number | string;
  category: string;
  description?: string;
};

type FormErrorState = {
  dateError: string;
  amountError: string;
};

const Messages = {
  DATE_ERROR: "Please select valid date",
  AMOUNT_ERROR: "Enter correct amount",
  SUCCESS: "Transaction data added successfully",
  ERROR: "Please run the backend",
  INVALID_TOKEN: "Please login",
  MANDATORY: "Enter all the form fields"
};

const Transaction: FC = () => {
  const [state, setState] = useState<TransactionState>({
    transactionDate: "",
    amount: "",
    category: "",
    description: ""
  });

  const [formErrors, setFormErrors] = useState<FormErrorState>({
    dateError: "",
    amountError: ""
  });

  const categoryList: string[] = ["Salary", "Rent", "Groceries", "Others"];
  const [mandatory, setMandatory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [valid, setValid] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (state.amount === 0 || state.category === "" || state.transactionDate === "") {
      setSuccessMessage("");
      setErrorMessage("");
      setMandatory(Messages.MANDATORY);
    } else {
      setSuccessMessage("");
      setErrorMessage("");
      setMandatory("");

      const token = localStorage.getItem('token');

      axios.post(url, state, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })
        .then((response) => {
          const resData = response.data;

          if (resData === "Invalid or expired token, Please Login") {
            setSuccessMessage("");
            setErrorMessage(Messages.INVALID_TOKEN);
          } else if (resData === "transaction data added successfully") {
            setSuccessMessage(Messages.SUCCESS);
            setErrorMessage("");
            setState({
              transactionDate: "",
              amount: "",
              category: "",
              description: ""
            });
          } else {
            setSuccessMessage("");
            setErrorMessage(Messages.ERROR);
          }
        })
        .catch((error) => {
          console.log("Error " + error);
          setSuccessMessage("");
          setErrorMessage(Messages.ERROR);
          setMandatory("");
        });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
    validateField(name, value);
  };

  const validateField = (name: string, value: any): void => {
    let errors = { ...formErrors };

    switch (name) {
      case "transactionDate":
        errors.dateError = validateDate(value) ? "" : Messages.DATE_ERROR;
        break;
      case "amount":
        errors.amountError = validateAmount(value) ? "" : Messages.AMOUNT_ERROR;
        break;
    }

    setFormErrors(errors);
    const valid = Object.values(errors).every((val) => val === "");
    setValid(valid);
  };

  return (
    <React.Fragment>
      <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: '85vh' }}>
        <div className="container-fluid h-100 px-0">
          <div className="row w-100 m-0 justify-content-center">
            <div className="col-11 col-sm-9 col-md-7">
              <br /><br />
              <div className="text-center text-base">
                <h4>Daily Outflow</h4>
              </div>
              <br />
              <div className="card bg-dark text-light custom-shadow">
                <div className="card-body">
                  <h5 className="card-title text-base my-0">Add transactions</h5>
                  <br />
                  <form className="form" onSubmit={handleSubmit}>
                    {/* Date */}
                    <div className="form-group mb-2">
                      <label htmlFor="transactionDate" className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="transactionDate"
                        name="transactionDate"
                        value={state.transactionDate}
                        onChange={handleChange}
                      />
                      <span className="text-warning text-bold">{formErrors.dateError}</span>
                    </div>

                    {/* Amount */}
                    <div className="form-group mb-2">
                      <label htmlFor="amount" className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        name="amount"
                        value={state.amount}
                        onChange={handleChange}
                      />
                      <span className="text-warning text-bold">{formErrors.amountError}</span>
                    </div>

                    {/* Category */}
                    <div className="form-group mb-2">
                      <label htmlFor="category" className="form-label">Category</label>
                      <select
                        className="form-control"
                        id="category"
                        name="category"
                        value={state.category}
                        onChange={handleChange}
                      >
                        <option value="" disabled>Select Category</option>
                        {categoryList.map((res) => (
                          <option key={res} value={res}>{res}</option>
                        ))}
                      </select>
                      {state.category === "Others" && (
                        <input
                          type="text"
                          className="form-control mt-2"
                          id="category"
                          name="category"
                          placeholder="If selected Others..."
                        />
                      )}
                    </div>

                    {/* Description */}
                    <div className="form-group mb-2">
                      <label htmlFor="description" className="form-label">Description (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="description"
                        name="description"
                        value={state.description}
                        onChange={handleChange}
                      />
                    </div>

                    <br />

                    {/* Button */}
                    <div className="text-center">
                      <button className="btn btn-primary text-light" name="addTransaction" disabled={!valid}>
                        Add Transaction
                      </button>
                    </div>

                    {mandatory && <div className="text-danger text-bold text-center mb-3">{mandatory}</div>}
                    {successMessage && <div className="text-bold text-center mb-3" style={{ color: "chartreuse" }}>{successMessage}</div>}
                    {errorMessage && <div className="text-danger text-bold text-center mb-3">{errorMessage}</div>}
                  </form>
                </div>
              </div>
              <br /><br /><br /><br />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Transaction;
