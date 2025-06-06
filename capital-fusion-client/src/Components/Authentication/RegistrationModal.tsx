import { ChangeEvent, FC, FormEvent, useState } from "react";

import { useNavigate } from "react-router-dom";

import { getPasswordStrength, validateEmail, validatePassword } from "../../Validators/Validation";

import axios from "axios";

import { Button, Form, Modal, Spinner } from "react-bootstrap";

const registrationModalUrl: string = "http://localhost:8080/api/v1/auth/signup";

type RegistrationState = {
    email: string;
    password: string;
};

type FormErrorState = {
    emailError: string;
    passwordError: string;
    passwordMissingError: string[];
};

const RegistrationModal: FC = () => {

    const [user, setUser] = useState<RegistrationState>({
        email: "",
        password: ""
    });

    const [mandatory, setMandatory] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [exist, setExist] = useState("");
    const [loading, setLoading] = useState(false);
    const [valid, setValid] = useState(false);

    const [formErrors, setFormErrors] = useState<FormErrorState>({
        emailError: "",
        passwordError: "",
        passwordMissingError: ["", "", "", "", ""]
    });

    const navigate = useNavigate();

    const Messages = {
        EMAIL_ERROR: "Please enter a valid email address.",
        PASSWORD_ERROR: "The password must contain",
        PASSWORD_MISSING_ERROR: ["At least 12 characters", "An uppercase letter", "A lowercase letter", "A number", "A special character"],
        MANDATORY: "Enter all the form fields",
        SUCCESS: "Registered Successfully!",
        ERROR: "Registration Failed",
        EXIST: "Already Registered"
    };

    const passwordColors = ["#cccccc", "#ff0000", "#ff6f00", "#ffb700", "#0000ff", "#008000"];

    const score = getPasswordStrength(user.password);

    const getStrengthLabel = (score: number) => {
        const passwordLabels = ["Too Short", "Very Weak", "Weak", "Moderate", "Good", "Strong"];
        return passwordLabels[score] || "";
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (user.email === "" || user.password === "") {
            setMandatory(Messages.MANDATORY);
            setSuccess("");
            setError("");
            setExist("");
            return;
        }

        setMandatory("");
        setSuccess("");
        setError("");
        setExist("");

        setLoading(true);

        try {
            const response = await axios.post(registrationModalUrl, user, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resData = response.data;
            console.log('RESPONSE: ', resData);

            if (resData === null) {
                setSuccess("");
                setError(Messages.ERROR);
                setExist("");
            }
            else if (resData === "User alreday exist") {
                setSuccess("");
                setError("");
                setExist(Messages.EXIST);
            }
            // else if (resData === "Registration successful") {
            else {
                setSuccess(Messages.SUCCESS);
                setError("");
                setExist("");

                localStorage.setItem('token', resData);

                // console.log(user.email.split('@')[0]);
                localStorage.setItem('username', user.email.split('@')[0]);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            }
        }

        catch (error: any) {
            setError(Messages.ERROR);
        }

        finally {
            setLoading(false);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
                errors.passwordMissingError[0] = (value.length >= 12) ? "" : Messages.PASSWORD_MISSING_ERROR[0];
                errors.passwordMissingError[1] = (/[A-Z]/.test(value)) ? "" : Messages.PASSWORD_MISSING_ERROR[1];
                errors.passwordMissingError[2] = (/[a-z]/.test(value)) ? "" : Messages.PASSWORD_MISSING_ERROR[2];
                errors.passwordMissingError[3] = (/[0-9]/.test(value)) ? "" : Messages.PASSWORD_MISSING_ERROR[3];
                errors.passwordMissingError[4] = (/[^A-Za-z0-9]/.test(value)) ? "" : Messages.PASSWORD_MISSING_ERROR[4];
                errors.passwordError = validatePassword(value) ? "" : Messages.PASSWORD_ERROR;
                break;
            default:
                break;
        }

        setFormErrors(errors);

        let valid = false;

        for (let err of Object.values(errors)) {
            if ((typeof err === "string" && err === "")) {
                valid = true;
            }
            else if (typeof err === "object") {
                valid = err.every((val) => val === "") ? true : false;
            }
        }

        setValid(valid);
    };

    return (
        <Modal
            className="registration-modal"
            centered
            backdrop="static"
            animation
            show
        >

            {/* <Modal.Header closeButton>
                <Modal.Title>User Registration</Modal.Title>
            </Modal.Header> */}

            <Modal.Body className="registration-modal-body">

                <div className="registration-modal-content-scrollable bg-dark p-3">

                    <div className="text-end">
                        <a href="/dashboard" className="text-white" style={{ textDecoration: 'none', font: '24px Arial' }}>
                            <b>x</b>
                        </a>
                    </div>

                    <h2 className="text-white text-center fw-bold mb-1">Welcome</h2>
                    <p className="text-light text-center mb-4">Register to manage your finances!</p>

                    <Form onSubmit={handleSubmit}>

                        {/* Email Address */}
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label className="text-white">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                placeholder="Enter your Email Address"
                            />
                            {formErrors.emailError ? <div className="text-danger mt-1">{formErrors.emailError}</div> : ""}
                        </Form.Group>

                        {/* Password */}
                        <Form.Group controlId="formPassword" className="mb-2">
                            <Form.Label className="text-white">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleChange}
                                placeholder="Enter your Password"
                            />
                        </Form.Group>

                        {/* Strength indicator */}
                        <div>
                            <div style={{ backgroundColor: "#eee", height: "1.2vh", borderRadius: "1vh" }}>
                                <div style={{ width: `${(score / 5) * 100}%`, height: "1.2vh", backgroundColor: passwordColors[score], borderRadius: "1vh", transition: "width 0.3s" }} />
                            </div>
                            <sup>{getStrengthLabel(score)}</sup>
                        </div>

                        {formErrors.passwordError ? <div className="text-danger mt-1">{formErrors.passwordError}</div> : ""}

                        {formErrors.passwordMissingError[0] ? <div className="text-danger"><small>{formErrors.passwordMissingError[0]}</small></div> : ""}
                        {formErrors.passwordMissingError[1] ? <div className="text-danger"><small>{formErrors.passwordMissingError[1]}</small></div> : ""}
                        {formErrors.passwordMissingError[2] ? <div className="text-danger"><small>{formErrors.passwordMissingError[2]}</small></div> : ""}
                        {formErrors.passwordMissingError[3] ? <div className="text-danger"><small>{formErrors.passwordMissingError[3]}</small></div> : ""}
                        {formErrors.passwordMissingError[4] ? <div className="text-danger"><small>{formErrors.passwordMissingError[4]}</small></div> : ""}

                        {/* Registration button */}
                        <Button className="w-100 registration-btn" type="submit" disabled={loading && valid}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Register"}
                        </Button>

                        {mandatory ? <div className="text-danger text-bold text-center mb-3">{mandatory}</div> : ""}
                        {success ? <div className="text-base text-bold text-center mb-3">{success}</div> : ""}
                        {error ? <div className="text-danger text-bold text-center mb-3">{error}</div> : ""}
                        {exist ? <div className="text-danger text-bold text-center mb-3">{exist}</div> : ""}
                    </Form>

                    <div className="text-center text-white mt-3">
                        Already have an account?{' '}
                        <span className="login-popup text-primary" onClick={() => navigate("/user-login")}>
                            Login Here
                        </span>
                    </div>
                </div>

            </Modal.Body>

        </Modal>
    );

};

export default RegistrationModal;
