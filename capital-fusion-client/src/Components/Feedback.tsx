import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Feedback = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "Suggestion",
    message: "",
    rating: "5",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please login to submit feedback.");
      return;
    }

    const url = "http://localhost:8080/api/v1/feedback/submit";

    const payload = {
      userName: form.name,
      userEmail: form.email,
      feedbackType: form.type,
      feedbackMessage: form.message,
      rating: form.rating,
    };

    axios
      .post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })
      .then((response) => {
        const resData = response.data;

        if (resData === "Feedback submitted") {
          setSubmitted(true);
        } else if (resData === "User not found") {
          setErrorMessage("User not found. Please login.");
        } else {
          setErrorMessage("Unexpected response from server.");
        }
      })
      .catch((error) => {
        console.error("Feedback submission error:", error);
        setErrorMessage("Something went wrong. Please try again.");
      });
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "black", padding: "40px 20px" }}
    >
      <div className="card shadow-lg rounded-4" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="card-body p-5">
          <h3 className="text-center mb-4 fw-bold text-primary">📝 Share Your Feedback</h3>
          {submitted ? (
            <div className="alert alert-success text-center rounded-3">
              Thank you for your feedback! 🙌
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                />
                <label htmlFor="name">Your Name (optional)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                />
                <label htmlFor="email">Your Email (optional)</label>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Feedback Type</label>
                <select
                  className="form-select"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="Bug">🐞 Bug</option>
                  <option value="Suggestion">💡 Suggestion</option>
                  <option value="Compliment">🎉 Compliment</option>
                </select>
              </div>

              <div className="form-floating mb-3">
                <textarea
                  className="form-control"
                  placeholder="Leave your feedback here"
                  id="message"
                  name="message"
                  style={{ height: "120px" }}
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <label htmlFor="message">Your Feedback</label>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Rating</label>
                <select
                  className="form-select"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                >
                  <option value="1">⭐ 1 - Poor</option>
                  <option value="2">⭐⭐ 2 - Fair</option>
                  <option value="3">⭐⭐⭐ 3 - Good</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                </select>
              </div>

              {errorMessage && (
                <div className="alert alert-danger text-center">{errorMessage}</div>
              )}

              <div className="text-center">
                <button className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm">
                  🚀 Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
