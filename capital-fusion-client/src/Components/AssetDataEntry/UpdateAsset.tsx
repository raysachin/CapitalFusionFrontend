import axios from "axios";
import React, { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  validateAssetName,
  validatePurchaseDate,
  validatePurchasePrice,
  validateQuantity,
} from "../../Validators/Validation";

const updateUrl: string = "http://localhost:8080/api/v1/asset/update";
const getAssetURL: string = "http://localhost:8080/api/v1/asset/types-with-names";

type UpdateAssetState = {
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

type AssetTypeMappingDTO = {
  assetType: string;
  assetNames: string[];
};

type Props = {
  show: boolean;
  onHide: () => void;
  existingAsset?: UpdateAssetState;
};

const Messages = {
  ASSET_NAME_ERROR: "Enter a valid asset name",
  QUANTITY_ERROR: "Quantity should be greater than 0",
  PURCHASE_PRICE_ERROR: "Price should be greater than 0",
  PURCHASE_DATE_ERROR: "Purchase Date should be past date or today's date",
  UPDATE_SUCCESS: "Asset Updated successfully",
  UPDATE_ERROR: "Please login",
  ASSET_NOT_FOUND: "Asset not found",
  MANDATORY: "Enter all the form fields",
};

const UpdateAssetModal: FC<Props> = ({ show, onHide, existingAsset }) => {
  const [state, setState] = useState<UpdateAssetState>({
    assetType: "",
    assetName: "",
    quantity: "",
    purchasePrice: "",
    purchaseDate: "",
  });

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
  const [assetList, setAssetList] = useState<AssetTypeMappingDTO[]>([]);
  const [filteredAssetNames, setFilteredNames] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get<AssetTypeMappingDTO[]>(getAssetURL, {
        headers: {
          Authorization: token || "",
        },
      })
      .then((response) => {
        setAssetList(response.data);
      })
      .catch((error) => {
        console.log("Failed to fetch asset data " + error);
      });
  }, []);

  useEffect(() => {
    if (show && existingAsset) {
      setState(existingAsset);

      const selectedType = assetList.find(
        (item) => item.assetType === existingAsset.assetType
      );
      setFilteredNames(selectedType ? selectedType.assetNames : []);

      Object.entries(existingAsset).forEach(([key, value]) => {
        validateField(key, value);
      });
    }
  }, [show, existingAsset, assetList]);

  const handleUpdate = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (
      !state.assetType ||
      !state.assetName ||
      !state.quantity ||
      !state.purchasePrice ||
      !state.purchaseDate
    ) {
      setSuccessMessage("");
      setErrorMessage("");
      setMandatory(Messages.MANDATORY);
      return;
    }

    const token = localStorage.getItem("token");
    axios
      .put(updateUrl, state, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      })
      .then((response) => {
        const resData = response.data;

        if (resData === "Asset not found") {
          setSuccessMessage("");
          setErrorMessage(Messages.ASSET_NOT_FOUND);
        } else if (resData === "Invalid or expired token, Please Login") {
          setSuccessMessage("");
          setErrorMessage(Messages.UPDATE_ERROR);
        } else if (resData === "Asset updated successfully") {
          setSuccessMessage(Messages.UPDATE_SUCCESS);
          setErrorMessage("");
          setState({
            assetName: "",
            assetType: "",
            purchaseDate: "",
            purchasePrice: "",
            quantity: "",
          });
        } else {
          setSuccessMessage("");
          setErrorMessage(Messages.UPDATE_ERROR);
        }
      })
      .catch((error) => {
        console.log("Error: " + error);
        setSuccessMessage("");
        setErrorMessage(Messages.UPDATE_ERROR);
        setMandatory("");
      });
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const name: string = event.target.name;
    const value: any = event.target.value;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === "assetType" ? { assetName: "" } : {}),
    }));

    if (name === "assetType") {
      const selectedType = assetList.find((item) => item.assetType === value);
      setFilteredNames(selectedType ? selectedType.assetNames : []);
    }

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
    const valid = Object.values(errors).every((val) => val === "");
    setValid(valid);
  };

  return (
    <Modal className="asset-modal" show={show} onHide={onHide} centered>
      <Modal.Body className="asset-modal-body">
        <div className="asset-modal-content-scrollable bg-dark p-3">
          <div className="row">
            <div className="col-6">
              <h2 className="text-white fw-bold mb-1">Update Asset</h2>
              <p className="text-light mb-4">Update your Assets here!</p>
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

          <form className="form" onSubmit={handleUpdate}>
            <div className="row">
              <div className="col-6 form-group mb-2">
                <label htmlFor="assetType" className="form-label">
                  Asset Type
                </label>
                <select
                  className="form-control"
                  name="assetType"
                  value={state.assetType}
                  disabled
                >
                  <option value="" disabled>
                    --Select Type--
                  </option>
                  {assetList.map((assetValue) => (
                    <option
                      key={assetValue.assetType}
                      value={assetValue.assetType}
                    >
                      {assetValue.assetType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6 form-group mb-2">
                <label htmlFor="assetName" className="form-label">
                  Asset Name
                </label>
                <select
                  className="form-control"
                  name="assetName"
                  value={state.assetName}
                  disabled
                >
                  <option value="" disabled>
                    --Select Name--
                  </option>
                  {filteredAssetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-6 form-group mb-2">
                <label htmlFor="quantity" className="form-label">
                  Quantity / Units
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={state.quantity}
                  onChange={handleChange}
                />
                <span className="text-warning">{formErrors.quantityError}</span>
              </div>

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
                  name="purchasePrice"
                  value={state.purchasePrice}
                  onChange={handleChange}
                />
                <span className="text-warning">
                  {formErrors.purchasePriceError}
                </span>
              </div>
            </div>

            <div className="row">
              <div className="col-6 form-group mb-2">
                <label htmlFor="purchaseDate" className="form-label">
                  Purchase Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="purchaseDate"
                  value={state.purchaseDate}
                  onChange={handleChange}
                />
                <span className="text-warning">
                  {formErrors.purchaseDateError}
                </span>
              </div>
            </div>

            <div className="row">
              <div className="text-center mt-3">
                <Button type="submit" variant="primary" disabled={!valid}>
                  Update Asset
                </Button>
              </div>
            </div>

            {mandatory && (
              <div className="text-warning text-bold text-center mt-1">
                {mandatory}
              </div>
            )}
            {successMessage && (
              <div className="text-success text-bold text-center mt-1">
                {successMessage}
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

export default UpdateAssetModal;
