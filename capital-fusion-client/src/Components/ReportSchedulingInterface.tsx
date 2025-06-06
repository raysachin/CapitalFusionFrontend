import React, { FC, useState, ChangeEvent, FormEvent } from "react";

type ReportFormat = {
  pdf: boolean;
  csv: boolean;
};

type ScheduledReport = {
  id: number;
  reportType: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  recipients: string;
  deliveryEnabled: boolean;
  format: ReportFormat;
};

const reportTypes = [
  { value: "cashflow-transaction-filter", label: "Cash Flow Report" },
  { value: "asset-data-filter", label: "Assets Report" },
];

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const ReportSchedulingInterface: FC = () => {
  const [scheduleForm, setScheduleForm] = useState<Omit<ScheduledReport, "id">>({
    reportType: "",
    frequency: "daily",
    time: "09:00",
    recipients: "",
    deliveryEnabled: false,
    format: { pdf: false, csv: false },
  });

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleChange = (e: ChangeEvent<any>) => {
    const { name, value, checked } = e.target;
    if (name === "deliveryEnabled") {
      setScheduleForm((prev) => ({ ...prev, deliveryEnabled: checked }));
    } else {
      setScheduleForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormatChange = (formatType: "pdf" | "csv") => {
    const newFormat = {
      pdf: formatType === "pdf",
      csv: formatType === "csv",
    };
    setScheduleForm((prev) => ({ ...prev, format: newFormat }));
  };

  const validateEmails = (emails: string) => {
    if (!emails.trim()) return false;
    const emailArray = emails.split(",").map((e) => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every((email) => emailRegex.test(email));
  };

  const isFormValid = () => {
    return (
      scheduleForm.reportType !== "" &&
      scheduleForm.time !== "" &&
      validateEmails(scheduleForm.recipients) &&
      (scheduleForm.format.pdf || scheduleForm.format.csv)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setStatus("Please fill all required fields correctly.");
      return;
    }

    if (editingId !== null) {
      setScheduledReports((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...scheduleForm, id: editingId } : r
        )
      );
      setStatus("Scheduled report updated successfully.");
      setEditingId(null);
    } else {
      const newReport: ScheduledReport = {
        id: Date.now(),
        ...scheduleForm,
      };
      setScheduledReports((prev) => [...prev, newReport]);
      setStatus("Report scheduled successfully.");
    }

    resetForm();
  };

  const handleEdit = (id: number) => {
    const reportToEdit = scheduledReports.find((r) => r.id === id);
    if (reportToEdit) {
      setScheduleForm({ ...reportToEdit });
      setEditingId(id);
      setStatus("");
    }
  };

  const handleDelete = (id: number) => {
    setScheduledReports((prev) => prev.filter((r) => r.id !== id));
    setStatus("Scheduled report deleted.");
    if (editingId === id) {
      resetForm();
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setStatus("");
  };

  const resetForm = () => {
    setScheduleForm({
      reportType: "",
      frequency: "daily",
      time: "09:00",
      recipients: "",
      deliveryEnabled: false,
      format: { pdf: false, csv: false },
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: "85vh" }}>
      <div className="container-fluid h-100 px-0">
        <div className="row w-100 m-0 justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 mb-5">
            <br /><br />
            <div className="text-center text-base">
              <h4>Schedule Report</h4>
            </div>
            <br />

            <div className="card bg-dark text-light custom-shadow">
              <div className="card-body">
                <h5 className="card-title text-base my-0">Schedule Report</h5>
                <br />
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-2">
                    <label htmlFor="reportType" className="form-label">Report Type</label>
                    <select
                      id="reportType"
                      name="reportType"
                      className="form-control"
                      value={scheduleForm.reportType}
                      onChange={handleChange}
                    >
                      <option value="" disabled>-- Select Report Type --</option>
                      {reportTypes.map((rt) => (
                        <option key={rt.value} value={rt.value}>{rt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label">Frequency</label>
                    <div>
                      {frequencies.map((freq) => (
                        <div className="form-check form-check-inline" key={freq.value}>
                          <input
                            type="radio"
                            id={`freq-${freq.value}`}
                            name="frequency"
                            value={freq.value}
                            checked={scheduleForm.frequency === freq.value}
                            onChange={handleChange}
                            className="form-check-input"
                          />
                          <label htmlFor={`freq-${freq.value}`} className="form-check-label">
                            {freq.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group mb-2">
                    <label htmlFor="time" className="form-label">Report Generation Time</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      className="form-control"
                      value={scheduleForm.time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label htmlFor="recipients" className="form-label">Recipient Email(s) (comma-separated)</label>
                    <input
                      type="text"
                      id="recipients"
                      name="recipients"
                      className="form-control"
                      placeholder="example1@mail.com, example2@mail.com"
                      value={scheduleForm.recipients}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group form-check mb-2">
                    <input
                      type="checkbox"
                      id="deliveryEnabled"
                      name="deliveryEnabled"
                      className="form-check-input"
                      checked={scheduleForm.deliveryEnabled}
                      onChange={handleChange}
                    />
                    <label htmlFor="deliveryEnabled" className="form-check-label">
                      Enable Automatic Delivery
                    </label>
                  </div>

                  <div className="form-group mb-2">
                    <label className="form-label">Output Format</label>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="pdf"
                        name="format"
                        className="form-check-input"
                        checked={scheduleForm.format.pdf}
                        onChange={() => handleFormatChange("pdf")}
                      />
                      <label htmlFor="pdf" className="form-check-label">PDF</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="csv"
                        name="format"
                        className="form-check-input"
                        checked={scheduleForm.format.csv}
                        onChange={() => handleFormatChange("csv")}
                      />
                      <label htmlFor="csv" className="form-check-label">CSV</label>
                    </div>
                  </div>

                  <br />

                  <div className="d-flex justify-content-center gap-2">
                    <button type="submit" className="btn btn-primary" disabled={!isFormValid()}>
                      {editingId !== null ? "Update Schedule" : "Schedule Report"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>

                  <br />

                  {status && <div className="text-info text-center fs-5">{status}</div>}
                </form>
              </div>
            </div>

            <br />

            <div className="card bg-dark text-light custom-shadow">
              <div className="card-body">
                <h5 className="card-title text-base my-0 mb-3">Scheduled Reports</h5>
                {scheduledReports.length === 0 ? (
                  <p className="text-center">No scheduled reports.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>Report Type</th>
                          <th>Frequency</th>
                          <th>Time</th>
                          <th>Recipients</th>
                          <th>Delivery</th>
                          <th>Format</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduledReports.map((report) => (
                          <tr key={report.id}>
                            <td>{reportTypes.find((rt) => rt.value === report.reportType)?.label || report.reportType}</td>
                            <td>{report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}</td>
                            <td>{report.time}</td>
                            <td>{report.recipients}</td>
                            <td>{report.deliveryEnabled ? "Yes" : "No"}</td>
                            <td>{report.format.pdf ? "PDF" : report.format.csv ? "CSV" : "N/A"}</td>
                            <td>
                              <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(report.id)}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(report.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSchedulingInterface;
