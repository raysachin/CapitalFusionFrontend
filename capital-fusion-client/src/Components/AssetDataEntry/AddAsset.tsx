import axios from "axios";

import {
  validateAssetName,
  validatePurchaseDate,
  validatePurchasePrice,
  validateQuantity,
} from "../../Validators/Validation";

import React, { ChangeEvent, FC, FormEvent, useState } from "react";

import { Modal, Button } from "react-bootstrap";

const addUrl: string = "http://localhost:8080/api/v1/asset/add";

type AddAssetState = {
  assetType: string;
  assetName: string;
  quantity: string | number;
  purchasePrice: string | number;
  purchaseDate: string;
};

type FormErrorState = {
  assetNameError: string;
  quantityError: string;
  purchasePriceError: string;
  purchaseDateError: string;
};

type Props = {
  show: boolean;
  onHide: () => void;
};

const AddAssetModal: FC<Props> = ({ show, onHide }) => {
  const [asset, setAsset] = useState<AddAssetState>({
    assetType: "",
    assetName: "",
    quantity: "",
    purchasePrice: "",
    purchaseDate: "",
  });

  const assetTypeList: string[] = ["Stock", "Bond", "Real Estate", "Others"];

  const [formErrors, setFormErrors] = useState<FormErrorState>({
    assetNameError: "",
    quantityError: "",
    purchasePriceError: "",
    purchaseDateError: "",
  });

  const [mandatory, setMandatory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [valid, setValid] = useState(false);

  const Messages = {
    ASSET_NAME_ERROR: "Enter a valid Asset Name",
    QUANTITY_ERROR: "Quantity should be greater than 0",
    PURCHASE_PRICE_ERROR: "Price should be greater than 0",
    PURCHASE_DATE_ERROR: "Purchase Date should be a past date or today's date",
    ADD_SUCCESS: "Asset added successfully",
    ADD_ERROR: "Please Login",
    EXISTS: "Asset already present",
    INVALID_TOKEN: "Please login",
    MANDATORY: "Enter all the form fields",
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (
      asset.assetType === "" ||
      asset.assetName === "" ||
      asset.quantity === "" ||
      asset.purchasePrice === "" ||
      asset.purchaseDate === ""
    ) {
      setSuccessMessage("");
      setErrorMessage("");
      setMandatory(Messages.MANDATORY);
    } else {
      setSuccessMessage("");
      setErrorMessage("");
      setMandatory("");

      const token = localStorage.getItem("token");

      console.log("TOKEN: " + token);

      axios
        .post(addUrl, asset, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
        })
        .then((response) => {
          const resData = response.data;

          console.log("RESPONSE " + resData);

          if (resData === "Asset already present") {
            setSuccessMessage("");
            setErrorMessage(Messages.EXISTS);
          } else if (resData === "Invalid or expired token, Please Login") {
            setSuccessMessage("");
            setErrorMessage(Messages.INVALID_TOKEN);
          } else if (resData === "Asset data added successfully") {
            setSuccessMessage(Messages.ADD_SUCCESS);
            setErrorMessage("");
            setAsset({
              assetName: "",
              assetType: "",
              purchaseDate: "",
              purchasePrice: "",
              quantity: "",
            });
          } else {
            setSuccessMessage("");
            setErrorMessage(Messages.ADD_ERROR);
          }
        })
        .catch((error) => {
          console.log("Error: ", error);
          setSuccessMessage("");
          setErrorMessage(Messages.ADD_ERROR);
          setMandatory("");
        });
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    let name: string = event.target.name;
    let value: any = event.target.value;

    setAsset({ ...asset, [name]: value });

    validateField(name, value);
  };

  const validateField = (name: string, value: any): void => {
    let errors = { ...formErrors };

    switch (name) {
      case "assetName":
        errors.assetNameError = validateAssetName(value)
          ? ""
          : Messages.ASSET_NAME_ERROR;
        break;

      case "quantity":
        errors.quantityError = validateQuantity(value)
          ? ""
          : Messages.QUANTITY_ERROR;
        break;

      case "purchasePrice":
        errors.purchasePriceError = validatePurchasePrice(value)
          ? ""
          : Messages.PURCHASE_PRICE_ERROR;
        break;

      case "purchaseDate":
        errors.purchaseDateError = validatePurchaseDate(value)
          ? ""
          : Messages.PURCHASE_DATE_ERROR;
        break;

      default:
        break;
    }

    setFormErrors(errors);

    const valid = Object.values(errors).every((value) => value === "");
    setValid(valid);
  };

  return (
    <Modal className="asset-modal" show={show} onHide={onHide} centered>
      <Modal.Body className="asset-modal-body">
        <div className="asset-modal-content-scrollable bg-dark p-3">
          <div className="row">
            <div className="col-6">
              <h2 className="text-white fw-bold mb-1">Add Asset</h2>
              <p className="text-light mb-4">Add your Assets here!</p>
            </div>
            <div className="col-6">
              <div className="text-end">
                <a
                  href="/asset-data-entry"
                  className="text-white"
                  style={{ textDecoration: "none", font: "24px Arial" }}
                >
                  <b>x</b>
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleAdd}>
            <div className="row">
              {/* Asset Type */}
              <div className="col-6 form-group mb-2">
                <label htmlFor="assetType" className="form-label">
                  Asset Type
                </label>
                <select
                  className="form-control"
                  id="assetType"
                  name="assetType"
                  value={asset.assetType}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    --Select Type--
                  </option>

                  {assetTypeList.map((assetValue) => (
                    <option key={assetValue} value={assetValue}>
                      {assetValue}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asset Name */}
              <div className="col-6 form-group mb-2">
                <label htmlFor="assetName" className="form-label">
                  Asset Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="assetName"
                  name="assetName"
                  value={asset.assetName}
                  onChange={handleChange}
                />

                <span className="text-warning text-bold">
                  {formErrors.assetNameError}
                </span>
              </div>
            </div>

            <div className="row">
              {/* Quantity */}
              <div className="col-6 form-group mb-2">
                <label htmlFor="quantity" className="form-label">
                  Quantity / Units
                </label>

                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  name="quantity"
                  value={asset.quantity}
                  onChange={handleChange}
                />

                <span className="text-warning text-bold">
                  {formErrors.quantityError}
                </span>
              </div>

              {/* Purchase Price */}
              <div className="col-6 form-group mb-2">
                <label
                  htmlFor="purchasePrice"
                  className="form-label"
                  style={{ fontSize: "18px" }}
                >
                  Purchase Price (per unit)
                </label>

                <input
                  type="number"
                  className="form-control"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={asset.purchasePrice}
                  onChange={handleChange}
                />

                <span className="text-warning text-bold">
                  {formErrors.purchasePriceError}
                </span>
              </div>
            </div>

            <div className="row">
              {/* Purchase Date */}
              <div className="col-6 form-group mb-2">
                <label htmlFor="purchaseDate" className="form-label">
                  Purchase Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={asset.purchaseDate}
                  onChange={handleChange}
                />

                <span className="text-warning text-bold">
                  {formErrors.purchaseDateError}
                </span>
              </div>
            </div>

            <br />

            <div className="row">
              {/* Add Asset Button */}
              <div className="text-center">
                <Button type="submit" variant="primary" disabled={!valid}>
                  Add Asset
                </Button>
              </div>
            </div>

            {mandatory && (
              <div className="text-warning text-bold text-center mt-1">
                {Messages.MANDATORY}
              </div>
            )}

            {successMessage && (
              <div className="text-success text-bold text-center mt-1">
                {Messages.ADD_SUCCESS}
              </div>
            )}

            {errorMessage && (
              <div className="text-danger text-bold text-center mt-1">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddAssetModal;
