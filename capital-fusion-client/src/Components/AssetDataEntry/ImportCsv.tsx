import axios from "axios";
import React, { ChangeEvent, FormEvent, useRef, useState, FC } from "react";
import { Modal, Button, ProgressBar } from "react-bootstrap";

const importUrl: string = "http://localhost:8080/api/v1/asset/upload";

const Messages = {
  SUCCESS: "CSV File Imported Successfully!",
  ERROR: "Please Upload a valid CSV file",
  TYPE_ERROR: "Only .csv files are allowed",
  TOKEN_ERROR: "Please login",
};

type Props = {
  show: boolean;
  onHide: () => void;
};

const ImportCsvModal: FC<Props> = ({ show, onHide }) => {
  const [csv, setCsv] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!csv) {
      setSuccessMessage("");
      setErrorMessage(Messages.ERROR);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", csv);

    axios
      .post(importUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token || "",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      })
      .then((response) => {
        const resData = response.data;

        if (resData === "CSV imported Successfully") {
          setSuccessMessage(Messages.SUCCESS);
          setErrorMessage("");
          setCsv(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setSuccessMessage("");
          setErrorMessage(resData);
        }
      })
      .catch((error) => {
        console.log("Error: " + error);
        setSuccessMessage("");
        setErrorMessage(Messages.TOKEN_ERROR);
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(0);
      });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];

      const isCSV =
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".csv");

      if (!isCSV) {
        setCsv(null);
        setSuccessMessage("");
        setErrorMessage(Messages.TYPE_ERROR);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setCsv(selectedFile);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  return (
    <Modal className="asset-modal" show={show} onHide={onHide} centered>
      <Modal.Body className="asset-modal-body">
        <div className="asset-modal-content-scrollable bg-dark p-3">
          <div className="row">
            <div className="col-6">
              <h2 className="text-white fw-bold mb-1">Import CSV</h2>
              <p className="text-light mb-4">Import your Assets CSV!</p>
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

          <form onSubmit={handleImport}>
            <div className="form-group mb-3">
              <label htmlFor="csv" className="form-label">
                Select CSV File
              </label>
              <input
                type="file"
                className="form-control"
                id="csv"
                name="csv"
                accept=".csv"
                onChange={handleChange}
                ref={fileInputRef}
                disabled={uploading}
              />
            </div>

            <div className="text-center w-100">
              <Button
                type="submit"
                variant="primary"
                disabled={uploading || !csv}
              >
                {uploading ? "Uploading..." : "Upload CSV"}
              </Button>
            </div>

            {uploading && (
              <ProgressBar
                now={uploadProgress}
                label={`Uploading: ${uploadProgress}%`}
                className="my-3"
                animated
                striped
              />
            )}

            {successMessage && (
              <div className="text-success text-bold text-center mt-3">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="text-danger text-bold text-center mt-3">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImportCsvModal;
