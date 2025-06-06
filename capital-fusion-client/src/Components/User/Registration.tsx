import axios from "axios";
import React, { useEffect, ChangeEvent, FC, FormEvent, useState } from "react";
import { getPasswordStrength, validateEmail, validatePassword } from "../../Validators/Validation";
import { useNavigate } from "react-router-dom";

const url: string = "http://localhost:8080/api/v1/auth/signup";

type RegistrationState = {
  email: string;
  password: string;
};

type FormErrorState = {
  emailError: string;
  passwordError: string;
  passwordMissingError: string[];
};

export let registered = 0;

const Registration: FC = () => {
  const [user, setUser] = useState<RegistrationState>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrorState>({
    emailError: "",
    passwordError: "",
    passwordMissingError: ["", "", "", "", ""],
  });

  const [mandatory, setMandatory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [existMessage, setExistMessage] = useState("");
  const [valid, setValid] = useState(false);

  // const navigate = useNavigate();

  useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
    setExistMessage("");
    setMandatory("");
  }, []);

  const Messages = {
    EMAIL_ERROR: "Please enter a valid email address.",
    PASSWORD_ERROR: "The password must contain",
    PASSWORD_MISSING_ERROR: [
      "At least 12 characters",
      "An uppercase letter",
      "A lowercase letter",
      "A number",
      "A special character",
    ],
    SUCCESS: "Registered Successfully",
    ERROR: "Registration Failed",
    EXIST: "Already Registered",
    MANDATORY: "Enter all the form fields",
  };

  const passwordColors = ["#cccccc", "#ff0000", "#ff6f00", "#ffb700", "#0000ff", "#008000"];

  const score = getPasswordStrength(user.password);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (user.email === "" || user.password === "") {
      setSuccessMessage("");
      setErrorMessage("");
      setExistMessage("");
      setMandatory(Messages.MANDATORY);
      return;
    } else {
      setSuccessMessage("");
      setErrorMessage("");
      setExistMessage("");
      setMandatory("");

      axios
        .post(url, user, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          const resData = response.data;
          console.log("RESPONSE:", resData);
          localStorage.setItem("userToken", response.data);

          if (resData === "User alreday exist") {
            registered = 1;
            setSuccessMessage("");
            setExistMessage(Messages.EXIST);
          } else if (resData === null) {
            setErrorMessage(Messages.ERROR);
          } else {
            registered = 1;
            setSuccessMessage(Messages.SUCCESS);
            setExistMessage("");
            localStorage.setItem("token", resData);
            // navigate('/dashboard');
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
    let name: string = event.target.name;
    let value: any = event.target.value;

    setUser({ ...user, [name]: value });
    validateField(name, value);
  };

  const validateField = (name: string, value: any): void => {
    let errors = { ...formErrors };

    switch (name) {
      case "email":
        errors.emailError = validateEmail(value) ? "" : Messages.EMAIL_ERROR;
        break;
      case "password":
        errors.passwordMissingError[0] = value.length >= 12 ? "" : Messages.PASSWORD_MISSING_ERROR[0];
        errors.passwordMissingError[1] = /[A-Z]/.test(value) ? "" : Messages.PASSWORD_MISSING_ERROR[1];
        errors.passwordMissingError[2] = /[a-z]/.test(value) ? "" : Messages.PASSWORD_MISSING_ERROR[2];
        errors.passwordMissingError[3] = /[0-9]/.test(value) ? "" : Messages.PASSWORD_MISSING_ERROR[3];
        errors.passwordMissingError[4] = /[^A-Za-z0-9]/.test(value) ? "" : Messages.PASSWORD_MISSING_ERROR[4];
        errors.passwordError = validatePassword(value) ? "" : Messages.PASSWORD_ERROR;
        break;
      default:
        break;
    }

    setFormErrors(errors);

    let valid = false;

    for (let err of Object.values(errors)) {
      if (typeof err === "string" && err === "") {
        valid = true;
      } else if (Array.isArray(err)) {
        valid = err.every((val) => val === "") ? true : false;
      }
    }

    setValid(valid);
  };

  const getStrengthLabel = (score: number) => {
    const passwordLabels = ["Too Short", "Very Weak", "Weak", "Moderate", "Good", "Strong"];
    return passwordLabels[score] || "";
  };

  return (
    <React.Fragment>
      <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: "85vh" }}>
        <div className="container-fluid px-0">
          <div className="row justify-content-center w-100 m-0">
            <div className="col-8 col-sm-6 col-md-4">
              <div className="card bg-dark text-light custom-shadow">
                <div className="card-header text-center border-base">
                  <h4 className="text-base my-0">Create Your FinTrack Account</h4>
                </div>

                <div className="card-body">
                  <form className="form" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="form-group mb-3">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={user.email}
                        placeholder="Enter your Email Address"
                        onChange={handleChange}
                      />
                      <span className="text-danger">{formErrors.emailError}</span>
                    </div>

                    {/* Password */}
                    <div className="form-group mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control mb-3"
                        id="password"
                        name="password"
                        value={user.password}
                        placeholder="Create a strong password"
                        onChange={handleChange}
                      />

                      <div>
                        <div style={{ backgroundColor: "#eee", height: "1.2vh", borderRadius: "4px" }}>
                          <div
                            style={{
                              width: `${(score / 5) * 100}%`,
                              height: "1.2vh",
                              backgroundColor: passwordColors[score],
                              borderRadius: "1vh",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <sup>{getStrengthLabel(score)}</sup>
                      </div>

                      {formErrors.passwordError ? (
                        <div className="text-danger">{formErrors.passwordError}</div>
                      ) : (
                        ""
                      )}

                      {formErrors.passwordMissingError[0] ? (
                        <div className="text-danger">
                          <small>{formErrors.passwordMissingError[0]}</small>
                        </div>
                      ) : (
                        ""
                      )}
                      {formErrors.passwordMissingError[1] ? (
                        <div className="text-danger">
                          <small>{formErrors.passwordMissingError[1]}</small>
                        </div>
                      ) : (
                        ""
                      )}
                      {formErrors.passwordMissingError[2] ? (
                        <div className="text-danger">
                          <small>{formErrors.passwordMissingError[2]}</small>
                        </div>
                      ) : (
                        ""
                      )}
                      {formErrors.passwordMissingError[3] ? (
                        <div className="text-danger">
                          <small>{formErrors.passwordMissingError[3]}</small>
                        </div>
                      ) : (
                        ""
                      )}
                      {formErrors.passwordMissingError[4] ? (
                        <div className="text-danger">
                          <small>{formErrors.passwordMissingError[4]}</small>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>

                    {/* Create account button */}
                    <div className="text-center mb-1">
                      <button type="submit" className="btn" name="createAccount" disabled={!valid}>
                        Create Account
                      </button>
                    </div>

                    {mandatory ? (
                      <div className="text-danger text-bold text-center mb-3">{Messages.MANDATORY}</div>
                    ) : (
                      ""
                    )}

                    {successMessage ? (
                      <div className="text-base text-bold text-center mb-3">{Messages.SUCCESS}</div>
                    ) : (
                      ""
                    )}

                    {errorMessage ? (
                      <div className="text-danger text-bold text-center mb-3">{Messages.ERROR}</div>
                    ) : (
                      ""
                    )}

                    {existMessage ? (
                      <div className="text-danger text-bold text-center mb-3">{Messages.EXIST}</div>
                    ) : (
                      ""
                    )}
                  </form>

                  <div className="text-center">
                    Already have an account? <a href="/user-login">Login here</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Registration;
