import React, { ChangeEvent, FC, FormEvent, useState } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import { validateCurrentSavings, validateTargetAmount, validateTargetDate } from "../../Validators/Validation";

const goalSetupUrl = "http://localhost:8080/api/v1/goalSetup/add";

type Goal = {
    goalType: string;
    targetAmount: string | number;
    targetDate: string;
    currentSavings: string | number;
};

type FormErrorState = {
    targetAmountError: string;
    targetDateError: string;
    currentSavingsError: string;
};

type GoalSetupProp = {
    onGoalAdd: (goal: Goal) => void;
    goals: Goal[];
};

const GoalSetup: FC<GoalSetupProp> = ({ onGoalAdd, goals }) => {
    const [goal, setGoal] = useState<Goal>({
        goalType: "",
        targetAmount: "",
        targetDate: "",
        currentSavings: ""
    });

    const goalTypeList = ["Retirement", "Home Purchase", "Education"];

    const [formErrors, setFormErrors] = useState<FormErrorState>({
        targetAmountError: "",
        targetDateError: "",
        currentSavingsError: ""
    });

    const [loading, setLoading] = useState(false);
    const [mandatory, setMandatory] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [cancelMessage, setCancelMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [valid, setValid] = useState(false);

    const Messages = {
        TARGET_AMOUNT_ERROR: "Target Amount must be greater than 0",
        TARGET_DATE_ERROR: "Target Date should be a future date",
        CURRENT_SAVINGS_ERROR: "Current Savings must be greater than 0",
        SUCCESS: "Goal added successfully! Your new goal is now a part of your plan.",
        CANCEL: "Goal discarded. You can add your financial goal anytime.",
        ERROR: "Adding goal failed. Try again later.",
        EXISTS: "Goal already exists",
        INVALID_TOKEN: "Login required.",
        MANDATORY: "Enter all the form fields"
    };

    const handleAddGoal = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!goal.goalType || !goal.targetAmount || !goal.targetDate || !goal.currentSavings) {
            setSuccessMessage("");
            setErrorMessage("");
            setCancelMessage("");
            setMandatory(Messages.MANDATORY);
            return;
        }

        setSuccessMessage("");
        setErrorMessage("");
        setCancelMessage("");
        setMandatory("");
        setLoading(true);

        const token = localStorage.getItem("token");

        axios.post(goalSetupUrl, goal, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            }
        })
        .then((response) => {
            const resData = response.data;

            if (resData === "Goal Type already present") {
                setErrorMessage(Messages.EXISTS);
            } else if (resData === "Invalid or expired token, Please Login") {
                setErrorMessage(Messages.INVALID_TOKEN);
            } else if (resData === "Goal Setup data added successfully") {
                setSuccessMessage(Messages.SUCCESS);
                onGoalAdd({ ...goal });
                setGoal({ goalType: "", targetAmount: "", targetDate: "", currentSavings: "" });
            }
        })
        .catch(() => {
            setErrorMessage(Messages.ERROR);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const handleCancel = () => {
        setGoal({ goalType: "", targetAmount: "", targetDate: "", currentSavings: "" });
        setCancelMessage(Messages.CANCEL);
        setSuccessMessage("");
        setErrorMessage("");
        setMandatory("");
        setValid(true);
        setFormErrors({ targetAmountError: "", targetDateError: "", currentSavingsError: "" });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setGoal(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
        setCancelMessage("");
    };

    const validateField = (name: string, value: any) => {
        let errors = { ...formErrors };

        switch (name) {
            case "targetAmount":
                errors.targetAmountError = validateTargetAmount(value) ? "" : Messages.TARGET_AMOUNT_ERROR;
                break;
            case "targetDate":
                errors.targetDateError = validateTargetDate(value) ? "" : Messages.TARGET_DATE_ERROR;
                break;
            case "currentSavings":
                errors.currentSavingsError = validateCurrentSavings(value) ? "" : Messages.CURRENT_SAVINGS_ERROR;
                break;
        }

        setFormErrors(errors);
        const isValid = Object.values(errors).every((val) => val === "");
        setValid(isValid);
    };

    return (
        <div className="card bg-dark text-light custom-shadow">
            <div className="card-body">
                <h5 className="card-title text-base my-0">Goal Setup</h5>
                <br />
                <form className="form" onSubmit={handleAddGoal}>
                    <div className="form-group mb-2">
                        <label htmlFor="goalType" className="form-label">Goal Type</label>
                        <select
                            className="form-control"
                            id="goalType"
                            name="goalType"
                            value={goal.goalType}
                            onChange={handleChange}
                        >
                            <option value="" disabled>--Select Type--</option>
                            {goalTypeList.map((goalValue) => (
                                <option key={goalValue} value={goalValue}>{goalValue}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mb-2">
                        <label htmlFor="targetAmount" className="form-label">Target Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            id="targetAmount"
                            name="targetAmount"
                            value={goal.targetAmount}
                            onChange={handleChange}
                        />
                        <span className="text-warning text-bold">{formErrors.targetAmountError}</span>
                    </div>

                    <div className="form-group mb-2">
                        <label htmlFor="targetDate" className="form-label">Target Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="targetDate"
                            name="targetDate"
                            value={goal.targetDate}
                            onChange={handleChange}
                        />
                        <span className="text-warning text-bold">{formErrors.targetDateError}</span>
                    </div>

                    <div className="form-group mb-2">
                        <label htmlFor="currentSavings" className="form-label">Current Savings</label>
                        <input
                            type="number"
                            className="form-control"
                            id="currentSavings"
                            name="currentSavings"
                            value={goal.currentSavings}
                            onChange={handleChange}
                        />
                        <span className="text-warning text-bold">{formErrors.currentSavingsError}</span>
                    </div>

                    <br />

                    <div className="text-center">
                        <button
                            type="submit"
                            className="btn btn-primary text-light w-25"
                            name="addGoal"
                            disabled={!valid}
                            style={{ marginRight: '0.25rem' }}
                        >
                            {loading ? "Adding goal..." : "Add Goal"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary text-light w-25"
                            name="cancel"
                            onClick={handleCancel}
                            disabled={!valid}
                        >
                            Cancel
                        </button>
                    </div>

                    {mandatory && <div className="text-warning text-bold text-center">{mandatory}</div>}
                    {successMessage && <div className="text-bold text-center" style={{ color: "chartreuse" }}>{successMessage}</div>}
                    {errorMessage && <div className="text-warning text-bold text-center">{errorMessage}</div>}
                    {cancelMessage && <div className="text-warning text-bold text-center">{cancelMessage}</div>}
                </form>

                {goals.length > 0 && (
                    <Table striped bordered variant="dark" className="mt-4">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Current Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goals.map((goal, idx) => (
                                <tr key={idx}>
                                    <td>{goal.goalType}</td>
                                    <td>{goal.targetAmount}</td>
                                    <td>{goal.targetDate}</td>
                                    <td>{goal.currentSavings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default GoalSetup;
