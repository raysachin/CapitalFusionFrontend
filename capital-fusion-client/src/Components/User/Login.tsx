import axios from 'axios';
import React, { ChangeEvent, FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const url: string = 'http://localhost:8080/api/v1/auth/login';

export let loggedIn = 0;

type LoginState = {
  email: string;
  password: string;
};

const Messages = {
  SUCCESS: 'Logged-In Successfully',
  ERROR: 'Login Failed',
  MANDATORY: 'Enter all the form fields',
  INVALID: 'Invalid email or password',
};

const Login: FC = () => {
  const { setIsLoggedIn } = useAuth();

  const [user, setUser] = useState<LoginState>({
    email: '',
    password: '',
  });

  const [mandatory, setMandatory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);

    if (user.email === '' || user.password === '') {
      setSuccessMessage('');
      setErrorMessage('');
      setMandatory(Messages.MANDATORY);
      setLoading(false);
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');
    setMandatory('');

    axios
      .post(url, user, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        const resData = response.data;
        console.log('LOGIN RESPONSE:', resData);

        if (resData === 'Invalid email or password') {
          setErrorMessage(Messages.INVALID);
        } else if (resData === null) {
          setErrorMessage(Messages.ERROR);
        } else {
          setIsLoggedIn(true);
          localStorage.setItem('token', resData);
          setSuccessMessage(Messages.SUCCESS);
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.log('LOGIN ERROR: ', error);
        setSuccessMessage('');
        setErrorMessage(Messages.ERROR);
        setMandatory('');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const name: string = event.target.name;
    const value: any = event.target.value;

    setUser((user) => ({ ...user, [name]: value }));

    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <React.Fragment>
      <div
        className="d-flex justify-content-center align-items-center bg-black"
        style={{ height: '85vh' }}
      >
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
                    </div>

                    {/* Password */}
                    <div className="form-group mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        id="password"
                        name="password"
                        value={user.password}
                        placeholder="Enter your Password"
                        onChange={handleChange}
                      />
                    </div>

                    {/* Create account button */}
                    <div className="text-center mb-1">
                      <button type="submit" className="btn" name="createAccount" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                      </button>
                    </div>

                    {mandatory && (
                      <div className="text-danger text-bold text-center mb-3">{mandatory}</div>
                    )}

                    {successMessage && (
                      <div className="text-base text-bold text-center mb-3">{successMessage}</div>
                    )}

                    {errorMessage && (
                      <div className="text-danger text-bold text-center mb-3">{errorMessage}</div>
                    )}
                  </form>

                  <div className="text-center">
                    Not a user yet? <a href="/user-registration">Register here</a>
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

export default Login;
