import React from "react";
import { FC } from "react";
import { Alert, Button, Card, Col, Row } from "react-bootstrap";

type ScenarioRecommendationsProps = {
  recommendations: any[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
};

const ScenarioRecommendationsPanel: FC<ScenarioRecommendationsProps> = ({
  recommendations,
  onAccept,
  onReject
}) => {
  if (!recommendations || recommendations.length === 0)
    return <Alert variant="info">No recommendations at this time.</Alert>;

  return (
    <React.Fragment>
      <h4 className="text-white">Recommendations</h4>
      <Row xs={1} md={2} className="g-3">
        {recommendations.map((rec, i) => (
          <Col key={i}>
            <Card className="bg-secondary text-white p-3">
              <Card.Title className="text-white">{rec.goalType}</Card.Title>
              <Card.Text>{rec.message}</Card.Text>
              <Card.Text>
                <strong>Capital Gain:</strong> {rec.capitalGain}
              </Card.Text>

              <div className="d-flex gap-2">
                <Button variant="success" onClick={() => onAccept(rec.id)}>
                  Accept
                </Button>
                <Button variant="danger" onClick={() => onReject(rec.id)}>
                  Reject
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </React.Fragment>
  );
};

export default ScenarioRecommendationsPanel;
