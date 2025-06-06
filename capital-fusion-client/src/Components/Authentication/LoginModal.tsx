import axios from "axios";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import './Authentication.css';

const loginModalUrl: string = "http://localhost:8080/api/v1/auth/login"

// type LoginModalProps = {
//     show: boolean;
//     onClose: () => void;
//     openRegister: () => void;
// };

type LoginState = {
    email: string;
    password: string;
};

const LoginModal: FC = () => {

    const [user, setUser] = useState<LoginState>({
        email: "",
        password: ""
    });

    const [mandatory, setMandatory] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const Messages = {
        MANDATORY: "Fill all the fields",
        SUCCESS: "Logged-In Successfully!",
        ERROR: "Login Failed",
        INVALID: "Invalid Credentials"
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        if (!user.email || !user.password) {
            setMandatory(Messages.MANDATORY);
            setSuccess("");
            setError("");
            return;
        }

        setMandatory("");
        setSuccess("");
        setError("");

        setLoading(true);

        try {
            const response = await axios.post(loginModalUrl, user, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resData = response.data;
            console.log('RESPONSE: ', resData);

            if (resData === null) {
                setSuccess("");
                setError(Messages.ERROR);
            }

            else if (resData === "Invalid email or password") {
                setSuccess("");
                setError(Messages.INVALID);
            }

            // else if (resData === "Login successful") {
            else {
                setSuccess(Messages.SUCCESS);
                setError("");

                localStorage.setItem('token', resData);
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

        let { name, value } = event.target;

        setUser((user) => ({ ...user, [name]: value }));

        setSuccess("");
        setError("");
    };

    // const isFormValid = () => user.email.trim() !== "" && user.password.trim() !== "";

    return (
        <Modal
            className="login-modal"
            centered
            backdrop="static"
            show
            animation
        >

            <div className="login-modal-content bg-dark p-4 rounded-4">

                <div className="text-end">
                    <a href="/dashboard" className="text-white" style={{ textDecoration: 'none', font: '24px Arial' }}>
                        <b>x</b>
                    </a>
                </div>
               
                <h2 className="text-white text-center fw-bold mb-1">Welcome Back</h2>
                <p className="text-light text-center mb-4">Login to manage your finances!</p>

                <Form onSubmit={handleSubmit}>

                    {/* Email Address */}
                    <Form.Group controlId="formEmail" className="mb-3">
                        <Form.Label className="text-white">Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                        />
                    </Form.Group>

                    {/* Password */}
                    <Form.Group controlId="formPassword" className="mb-3">
                        <Form.Label className="text-white">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                        />
                    </Form.Group>

                    {/* Login button */}
                    <Button className="w-100 login-btn mt-3 mb-1" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Log In"}
                    </Button>

                    {mandatory ? <div className="text-danger text-bold text-center mb-3">{mandatory}</div> : ""}
                    {success ? <div className="text-base text-bold text-center mb-3">{success}</div> : ""}
                    {error ? <div className="text-danger text-bold text-center mb-3">{error}</div> : ""}
                </Form>

                <div className="text-center text-white mt-3">
                    Don't have an account?{' '}
                    {/* <a href="user-registration" className="text-primary">
                        Register Here
                    </a> */}
                    <span className="text-primary registration-popup" style={{ cursor: "pointer" }} onClick={() => navigate("/user-registration")}>
                        Register Here
                    </span>
                </div>

            </div>

        </Modal>
    );
};

export default LoginModal;
