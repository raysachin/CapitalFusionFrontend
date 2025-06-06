import React, { useEffect, useState } from "react";
import { FC } from "react";
import GoalSetup from "./GoalSetup";
import ProjectionModelDisplay from "./ProjectionModelDisplay";
import axios from "axios";
import { Alert, Container, Spinner } from "react-bootstrap";
import GoalAchievementIndicator from "./GoalAchievementIndicator";
import ScenarioRecommendationsPanel from "./ScenarioRecommendationsPanel";

const FinancialPlanning: FC = () => {
    const [goals, setGoals] = useState([]);
    const [projections, setProjections] = useState([]);
    const [probabilities, setProbabilities] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = async () => {
        try {
            setLoading(true);

            const [goalsRes, projRes, probRes, recoRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/goalSetup/add'),
                axios.get('http://localhost:8080/api/v1/projection/goal-vs-date'),
                axios.get('http://localhost:8080/api/v1/recommendations/prob'),
                axios.get('http://localhost:8080/api/v1/recommendations/prob'),
            ]);

            setGoals(goalsRes.data);
            setProjections(projRes.data);
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
            await axios.post('/goals', goal);
            fetchAll();
        } catch {
            alert('Failed to add goal');
        }
    };

    return (
        <Container fluid className="bg-black text-white p-4">
            <h2 className="text-center text-base">Financial Planning</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="light" />
                </div>
            ) : (
                <div className="col-12 col-sm-10 col-md-8">
                    <GoalSetup onGoalAdd={handleGoalAdd} goals={goals} />
                    <hr className="text-secondary" />

                    <ProjectionModelDisplay projections={projections} />
                    <hr className="text-secondary" />

                    <h4>Goal Achievement</h4>

                    {/* 
                    <div className="d-flex flex-wrap gap-4">
                        {goals.map((goal: any) => (
                            <GoalAchievementIndicator
                                key={goal.goalType}
                                goal={goal.goalType}
                                probability={probabilities[goal.goalType] || 0}
                            />
                        ))}
                    </div> 
                    */}

                    <hr className="text-secondary" />

                    <ScenarioRecommendationsPanel
                        recommendations={recommendations}
                        onAccept={id => console.log('Accepted', id)}
                        onReject={id => console.log('Rejected', id)}
                    />
                </div>
            )}
        </Container>
    );
};

export default FinancialPlanning;
