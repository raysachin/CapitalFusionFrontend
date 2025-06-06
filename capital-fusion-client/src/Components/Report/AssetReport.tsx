import axios from "axios";
import React, { FC, useState, FormEvent, ChangeEvent, useRef } from "react";
import { validateStartDate, validateEndDate } from "../../Validators/Validation";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Asset = {
  assetType: string;
  assetName: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
};

type ReportFormState = {
  startDate: string;
  endDate: string;
  reportTitle: string;
};

type FormErrorState = {
  startDateError: string;
  endDateError: string;
};

type KPI = {
  key: string;
  value: any;
};

const Messages = {
  START_DATE_ERROR: "Start date must be before today.",
  END_DATE_ERROR: "End date must be after start date and before today.",
  MANDATORY: "Please fill in all required fields and select a format.",
  SUCCESS: "Report generated successfully!",
  FAILURE: "Failed to generate report. Please try again.",
  INVALID_TOKEN: "Invalid or expired token. Please log in again.",
  NODATA_ERROR: "No data found",
};

const AssetReport: FC = () => {
  const [formState, setFormState] = useState<ReportFormState>({
    startDate: "",
    endDate: "",
    reportTitle: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrorState>({
    startDateError: "",
    endDateError: "",
  });

  const calculateKPIs = (data: Asset[]): KPI[] => {
    if (!data || data.length === 0) return [];

    let totalInvestment = 0;
    let totalQuantity = 0;

    data.forEach((asset) => {
      const quantity = parseFloat(asset.quantity);
      const price = parseFloat(asset.purchasePrice);
      if (!isNaN(quantity) && !isNaN(price)) {
        totalInvestment += quantity * price;
        totalQuantity += quantity;
      }
    });

    const avgPrice = totalQuantity !== 0 ? totalInvestment / totalQuantity : 0;

    return [
      { key: "Total Investment", value: `$${totalInvestment.toFixed(2)}` },
      { key: "Total Quantity", value: totalQuantity.toFixed(2) },
      { key: "Average Purchase Price", value: `$${avgPrice.toFixed(2)}` },
    ];
  };

  const formatChartData = (data: Asset[]) => {
    return data.map((asset) => ({
      date: new Date(asset.purchaseDate).toLocaleDateString(),
      value: parseFloat(asset.quantity) * parseFloat(asset.purchasePrice),
    }));
  };

  const [transreport, setTransReport] = useState<Asset[]>([]);
  const [mandatoryMessage, setMandatoryMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);
  const [kpi, setKpi] = useState<KPI[]>([]);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000", // optional: render canvas with black bg
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.setFillColor(0, 0, 0); // black
      pdf.rect(0, 0, imgWidth, pageHeight, "F"); // fill full page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Extra pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 0, imgWidth, pageHeight, "F"); // draw black bg
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${formState.reportTitle || "Cashflow_Report"}.pdf`);
    }
  };

  const validateEntireForm = (state: ReportFormState) => {
    const errors: FormErrorState = {
      startDateError: validateStartDate(new Date(state.startDate))
        ? ""
        : Messages.START_DATE_ERROR,
      endDateError: validateEndDate(
        new Date(state.startDate),
        new Date(state.endDate)
      )
        ? ""
        : Messages.END_DATE_ERROR,
    };

    setFormErrors(errors);

    const formIsValid =
      state.reportTitle.trim() !== "" &&
      state.startDate !== "" &&
      state.endDate !== "" &&
      errors.startDateError === "" &&
      errors.endDateError === "";

    setValid(formIsValid);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedState = { ...formState, [name]: value };
    setFormState(updatedState);
    validateEntireForm(updatedState);
  };

  const handleFormatChange = (formatType: "pdf" | "csv") => {
    const newFormat = {
      pdf: formatType === "pdf",
      csv: formatType === "csv",
    };
    const updatedState = { ...formState, format: newFormat };
    setFormState(updatedState);
    validateEntireForm(updatedState);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMandatoryMessage("");
    setErrorMessage("");
    setSuccessMessage("");
    setTransReport([]);

    if (!formState.startDate || !formState.endDate || !formState.reportTitle.trim()) {
      setMandatoryMessage(Messages.MANDATORY);
      return;
    }

    if (formErrors.startDateError || formErrors.endDateError) {
      setErrorMessage("Please fix the date errors before submitting.");
      return;
    }

    const apiUrl = "http://localhost:8080/api/v1/report-analysis/asset-data-filter";

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(apiUrl, formState, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });

      const result = response.data;

      if (Array.isArray(result)) {
        setTransReport(result);
        if (result.length === 0) {
          setErrorMessage(Messages.NODATA_ERROR);
        } else {
          const kpis = calculateKPIs(result);
          setKpi(kpis);
          setSuccessMessage(Messages.SUCCESS);
          setErrorMessage("");
          setMandatoryMessage("");
        }
      } else if (
        typeof result === "string" &&
        result.toLowerCase().includes("invalid or expired token")
      ) {
        setErrorMessage(Messages.INVALID_TOKEN);
      } else if (result.message) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage(Messages.FAILURE);
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      setErrorMessage(Messages.FAILURE);
    }
  };

  const handleCancel = () => {
    setFormState({
      startDate: "",
      endDate: "",
      reportTitle: "",
    });
    setFormErrors({ startDateError: "", endDateError: "" });
    setTransReport([]);
    setMandatoryMessage("");
    setErrorMessage("");
    setSuccessMessage("");
    setValid(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-black"
      style={{ height: "85vh" }}
    >
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center px-5-">
          <div className="col-12 col-sm-10 col-md-8 mb-5 px-4">
            <br />
            <div className="text-center text-base">
              <h4>Asset Report Generation</h4>
            </div>
            <br />
            <div className="card bg-dark text-light custom-shadow">
              <div className="card-body">
                <h5 className="card-title text-base my-0">Generate Report</h5>
                <br />
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-2">
                    <label htmlFor="reportTitle" className="form-label">
                      Report Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="reportTitle"
                      name="reportTitle"
                      value={formState.reportTitle}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label">Date Range</label>
                    <div className="d-flex gap-2">
                      <input
                        type="date"
                        className="form-control"
                        name="startDate"
                        value={formState.startDate}
                        onChange={handleChange}
                      />
                      <input
                        type="date"
                        className="form-control"
                        name="endDate"
                        value={formState.endDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="text-danger">{formErrors.startDateError}</div>
                    <div className="text-danger">{formErrors.endDateError}</div>
                  </div>

                  <br />

                  <div className="d-flex justify-content-center gap-2">
                    <button type="submit" className="btn btn-primary" disabled={!valid}>
                      Generate Report
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>

                  <br />

                  {mandatoryMessage && (
                    <div className="text-danger text-bold text-center mb-3">
                      {mandatoryMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="text-danger text-bold text-center mb-3">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="text-base text-bold text-center mb-3">
                      {successMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <br />

            {transreport.length > 0 && (
              <div className="card bg-dark text-light custom-shadow mt-4">
                <div ref={reportRef}>
                  <div className="card-header text-center">
                    <br />
                    <h5>
                      {formState.reportTitle} From{" "}
                      {format(new Date(formState.startDate), "do MMM yyyy")} To{" "}
                      {format(new Date(formState.endDate), "do MMM yyyy")}
                    </h5>
                  </div>
                  <br />

                  <div className="text-center">
                    <h5>Asset Transactions</h5>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered table-dark mb-0">
                      <thead>
                        <tr>
                          <th>Asset Type</th>
                          <th>Asset Name</th>
                          <th>Quantity</th>
                          <th>Purchase Price</th>
                          <th>Purchase Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transreport.map((asset, index) => (
                          <tr key={index}>
                            <td>{asset.assetType}</td>
                            <td>{asset.assetName}</td>
                            <td>{asset.quantity}</td>
                            <td>${parseFloat(asset.purchasePrice).toFixed(2)}</td>
                            <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <br />
                    <br />

                    <div className="text-center">
                      <h5>Key Performance Indicators</h5>
                    </div>

                    <div className="card-body">
                      <div className="row">
                        {kpi.map((kpi, index) => (
                          <div key={index} className="col-md-4 mb-3">
                            <div className="border p-3 rounded bg-secondary text-light text-center">
                              <strong>{kpi.key}</strong>
                              <div>
                                {typeof kpi.value === "number"
                                  ? kpi.value.toFixed(2)
                                  : kpi.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <br />
                    <br />

                    <div className="p-3">
                      <h5 className="text-center">Investment Over Time</h5>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formatChartData(transreport)}>
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), "do MMM yyyy")}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <br />

                  <div className="text-center mt-3 mb-4">
                    <button className="btn btn-outline-light" onClick={handleDownloadPDF}>
                      Download Report as PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetReport;
