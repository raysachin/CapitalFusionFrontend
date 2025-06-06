// GoalAchievementIndicator.tsx

import { FC } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

const GoalAchievementIndicator: FC<{ goal: string; probability: number }> = ({ goal, probability }) => {
    let color = '#e539';

    if (probability >= 75) color = '#43aa8b';
    else if (probability >= 50) color = '#f9c74f';

    return (
        <div style={{ width: 120, textAlign: 'center' }}>
            <CircularProgressbar
                value={probability}
                text={`${probability}%`}
                styles={buildStyles({
                    pathColor: color,
                    textColor: '#fff',
                    trailColor: '#333',
                })}
            />
            <small>{goal}</small>
        </div>
    );
};

export default GoalAchievementIndicator;
