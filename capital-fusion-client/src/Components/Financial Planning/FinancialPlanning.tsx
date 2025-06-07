import React, { useEffect, useState, FC } from "react";
import axios from "axios";
import { Alert, Container, Spinner } from "react-bootstrap";

import GoalSetup from "./GoalSetup";
import ProjectionModelDisplay from "./ProjectionModelDisplay";
import GoalAchievementIndicator from "./GoalAchievementIndicator";
import ScenarioRecommendationsPanel from "./ScenarioRecommendationsPanel";

const FinancialPlanning: FC = () => {
    const [goals, setGoals] = useState([]);
    const [projections, setProjections] = useState([]);
    const [probabilities, setProbabilities] = useState<{ [key: string]: number }>({});
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const [goalsRes, probRes, recoRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/goalSetup/get', {
                    headers: { 'Authorization': token }
                }),
                axios.get('http://localhost:8080/api/v1/recommendations/prob', {
                    headers: { 'Authorization': token }
                }),
                axios.get('http://localhost:8080/api/v1/recommendations/prob', {
                    headers: { 'Authorization': token }
                })
            ]);

            setGoals(goalsRes.data);
            setProbabilities(probRes.data);
            setRecommendations(recoRes.data);
        } catch (error) {
            setError('Failed to load financial planning data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleGoalAdd = async (goal: any) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post('http://localhost:8080/api/v1/goalSetup/add', goal, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                }
            });
            fetchAll();
        } catch {
            alert('Failed to add goal');
        }
    };

    const handleAccept = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:8080/api/v1/recommendations/accept/${id}`, null, {
                headers: { 'Authorization': token }
            });
            fetchAll();
        } catch (error) {
            alert("Recommendation accepted");
        }
    };

    const handleReject = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:8080/api/v1/recommendations/reject/${id}`, null, {
                headers: { 'Authorization': token }
            });
            fetchAll();
        } catch (error) {
            alert("Recommendation rejected");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-black" style={{ height: '85vh' }}>
            <Container fluid className="bg-black text-white py-4 px-0 h-100">
                <div className="row w-100 m-0 justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8">
                        <h2 className="text-center text-base">Financial Planning</h2>

                        {loading ? (
                            <div className="text-center my-5">
                                <Spinner animation="border" variant="light" />
                            </div>
                        ) : (
                            <div>
                                <GoalSetup onGoalAdd={handleGoalAdd} goals={goals} />
                                <hr className="text-secondary" />

                                <h4>Goal Achievement</h4>
                                <div className="d-flex flex-wrap gap-4">
                                    {goals.map((goal: any) => (
                                        <GoalAchievementIndicator
                                            key={goal.goalType}
                                            goal={goal.goalType}
                                            probability={probabilities[goal.goalType] || 0}
                                        />
                                    ))}
                                </div>
                                <hr className="text-secondary" />

                                <ScenarioRecommendationsPanel
                                    recommendations={recommendations}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                                <br /><br />
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default FinancialPlanning;
