import axios from "axios";
import React, { ChangeEvent, FC, FormEvent, useState } from "react";

import {
  validateAssetsName,
  validatefee,
  validatepurchasedate,
  validatepurchaseprice,
  validateQuantitys,
  validateTransactionType,
} from "../Validators/Validation";

const url: string = "http://localhost:8080/api/v1/assettransaction/add";

type Transaction = {
  transactionType: string;
  assetName: string;
  quantity: string | number;
  pricePerShare: string | number;
  transactionDate: string;
  transactionFee: string | number;
};

type FormErrorState = () => {
  typesError: string;
  symbolError: string;
  quantityError: string;
  priceError: string;
  dateError: string;
  feeError: string;
};

const Message = {
  TYPE_ERROR: "Please select a valid transaction type",
  SYMBOL_ERROR: "Assest name must start with a capital letter",
  QUANTITY_ERROR: "Quantity must be greater than 0",
  PRICE_ERROR: "Price must be 0 or more",
  DATE_ERROR: "Date cannot be in future",
  FEE_ERROR: "Fee must be 0 or more",
  SUCCESS: "Transaction added successfully",
  ERROR: "Please run the backend",
  INVALID_TOKEN: "Please login",
  MANDATORY: "Enter all the fields",
  ASSET_NOT_FOUND: "Asset not found",
  QUANTITY_LIMIT: "Not enough quantity to sell",
};

const TransactionManagement: FC = () => {
  const [state, setState] = useState<Transaction>({
    transactionType: "",
    assetName: "",
    quantity: "",
    pricePerShare: "",
    transactionDate: "",
    transactionFee: "",
  });

  const [formError, setFormError] = useState({
    typeError: "",
    symbolError: "",
    quantityError: "",
    priceError: "",
    dateError: "",
    feeError: "",
  });

  const [mandatory, setMandatory] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    console.log(
      "STATE " +
        state.transactionType +
        " " +
        state.assetName +
        " " +
        state.quantity +
        " " +
        state.pricePerShare +
        " " +
        state.transactionDate +
        " " +
        state.transactionFee
    );

    if (
      state.transactionType === "" ||
      state.assetName === "" ||
      state.quantity === 0 ||
      state.pricePerShare === 0 ||
      state.transactionDate === "" ||
      state.transactionFee === 0
    ) {
      console.log("I AM HERE");
      setSuccess("");
      setError("");
      setMandatory(Message.MANDATORY);
    } else {
      setSuccess("");
      setError("");
      setMandatory("");

      const token = localStorage.getItem("token");

      console.log("TOKEN " + token);

      axios
        .post(url, state, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
        })
        .then((response) => {
          const resData = response.data;

          console.log("RESPONSE " + resData);

          if (resData === "Asset not found") {
            setSuccess("");
            setError(Message.ASSET_NOT_FOUND);
          } else if (resData === "Not enough quantity to sell") {
            setSuccess("");
            setError(Message.QUANTITY_LIMIT);
          } else if (resData === "Transaction recorded successfully") {
            setSuccess(Message.SUCCESS);
            setError("");

            setState({
              transactionType: "",
              assetName: "",
              quantity: "",
              pricePerShare: "",
              transactionDate: "",
              transactionFee: "",
            });
          } else {
            setSuccess("");
            setError(Message.ERROR);
          }
        })
        .catch((error) => {
          console.log("Error " + error);
          setSuccess("");
          setMandatory("");

          if (error.response?.status === 403) {
            setError(Message.INVALID_TOKEN);
          } else {
            setError(Message.ERROR);
          }
        });
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const name: string = event.target.name;
    const value: any = event.target.value;

    setState({ ...state, [name]: value });

    validateField(name, value);
  };

  const validateField = (name: string, value: any): void => {
    let errors = { ...formError };

    switch (name) {
      case "transactiontype":
        errors.typeError = validateTransactionType(value)
          ? ""
          : Message.TYPE_ERROR;
        break;

      case "assetName":
        errors.symbolError = validateAssetsName(value)
          ? ""
          : Message.SYMBOL_ERROR;
        break;

      case "quantity":
        errors.quantityError = validateQuantitys(value)
          ? ""
          : Message.QUANTITY_ERROR;
        break;

      case "pricePerShare":
        errors.priceError = validatepurchaseprice(value)
          ? ""
          : Message.PRICE_ERROR;
        break;

      case "transactionDate":
        errors.dateError = validatepurchasedate(value)
          ? ""
          : Message.DATE_ERROR;
        break;

      case "transactionFee":
        errors.feeError = validatefee(value) ? "" : Message.FEE_ERROR;
        break;

      default:
        break;
    }

    setFormError(errors);

    const valid = Object.values(errors).every((value) => value === "");
    setValid(valid);
  };

  return (
    <React.Fragment>
      <div
        className="d-flex justify-content-center align-items-center bg-black"
        style={{ height: "85vh", paddingTop: "30px", paddingBottom: "30px" }}
      >
        <div className="container-fluid h-100 px-0">
          <div className="row w-100 m-0 justify-content-center">
            <div className="col-12 col-sm-10 col-md-8">
              <br />
              <br />

              <div className="text-center text-base">
                <h4>Transaction Management</h4>
              </div>

              <br />
              <div className="card bg-dark text-light custom-shadow mb-5">
                <div className="card-body">
                  <br />
                  <form className="form" onSubmit={handleSubmit}>
                    {/* Asset Type */}
                    <div className="form-group mb-2">
                      <label htmlFor="transactiontype" className="form-label">
                        Transaction Type
                      </label>

                      <select
                        className="form-control"
                        id="transactionType"
                        name="transactionType"
                        value={state.transactionType}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          --Select Type--
                        </option>
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                      </select>
                    </div>
                    {/* Asset Name */}
                    <div className="form-group mb-2">
                      <label htmlFor="symbol" className="form-label">
                        Asset Name / Ticker Symbol
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        id="assetName"
                        name="assetName"
                        value={state.assetName}
                        onChange={handleChange}
                      />

                      <span className="text-warning text-bold fs-5">
                        {formError.symbolError}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="form-group mb-2">
                      <label htmlFor="quantity" className="form-label">
                        Quantity / Units
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        name="quantity"
                        value={state.quantity}
                        onChange={handleChange}
                      />

                      <span className="text-warning text-bold fs-5">
                        {formError.quantityError}
                      </span>
                    </div>

                    {/* Purchase Price */}
                    <div className="form-group mb-2">
                      <label htmlFor="price" className="form-label">
                        Price per Share/Unit
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        id="pricePerShare"
                        name="pricePerShare"
                        value={state.pricePerShare}
                        onChange={handleChange}
                      />

                      <span className="text-warning text-bold fs-5">
                        {formError.priceError}
                      </span>
                    </div>

                    {/* Purchase Date */}
                    <div className="form-group mb-2">
                      <label htmlFor="date" className="form-label">
                        Transaction Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        id="transactionDate"
                        name="transactionDate"
                        value={state.transactionDate}
                        onChange={handleChange}
                      />

                      <span className="text-warning text-bold fs-5">
                        {formError.dateError}
                      </span>
                    </div>

                    {/* Transaction Fee */}
                    <div className="form-group mb-2">
                      <label htmlFor="fee" className="form-label">
                        Transaction Fee
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        id="transactionFee"
                        name="transactionFee"
                        value={state.transactionFee}
                        onChange={handleChange}
                      />

                      <span className="text-warning text-bold fs-5">
                        {formError.feeError}
                      </span>
                    </div>

                    <br />
                    <div className="text-center">
                      <button
                        className="btn btn-primary text-light"
                        name="updateAsset"
                        disabled={!valid}
                      >
                        Add Transaction
                      </button>
                    </div>
                    <br />
                    {mandatory ? (
                      <div className="text-warning text-bold text-center fs-5">
                        {mandatory}
                      </div>
                    ) : (
                      ""
                    )}

                    <div style={{ color: "chartreuse" }}>
                      {success ? (
                        <div className="text-success text-bold text-center fs-5">
                          {success}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>

                    {error ? (
                      <div className="text-warning text-bold text-center fs-5">
                        {error}
                      </div>
                    ) : (
                      ""
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TransactionManagement;
