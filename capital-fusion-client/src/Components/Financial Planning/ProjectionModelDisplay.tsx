import { FC, useState } from "react";
import { Alert, ButtonGroup, ToggleButton } from "react-bootstrap";
import {
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Line,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell
} from "recharts";

const chartTypeList = ['line', 'bar', 'pie'];
const colors = ['#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ProjectionModelDisplay: FC<{ projections: any[] }> = ({ projections }) => {
  const [chartType, setChartType] = useState('pie');

  if (!projections || projections.length === 0)
    return <Alert variant="warning">No projection data available</Alert>;

  const chartData = projections.flatMap(goal =>
    goal.capitalGainProjection.map((entry: any) => ({
      date: entry.currentDate,
      [goal.goalType]: entry.capitalGain,
    }))
  );

  const pieData = projections.map(goal => ({
    name: goal.goalType,
    value: goal.capitalGainProjection.reduce(
      (sum: number, entry: any) => sum + entry.capitalGain,
      0
    ),
  }));

  return (
    <div className="text-white">
      <h4>Projection Model</h4>

      <ButtonGroup className="mb-3">
        {chartTypeList.map(type => (
          <ToggleButton
            key={type}
            id={`chart-${type}`}
            type="radio"
            variant="outline-light"
            name="chart"
            value={type}
            checked={chartType === type}
            onChange={e => setChartType(e.currentTarget.value)}
          >
            {type.toUpperCase()}
          </ToggleButton>
        ))}
      </ButtonGroup>

      <ResponsiveContainer width="100%" height={300}>
        <>
          {chartType === 'line' && (
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              {projections.map((goal, i) => (
                <Line
                  key={goal.goalType}
                  dataKey={goal.goalType}
                  stroke={colors[i % colors.length]}
                />
              ))}
            </LineChart>
          )}

          {chartType === 'bar' && (
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              {projections.map((goal, i) => (
                <Bar
                  key={goal.goalType}
                  dataKey={goal.goalType}
                  fill={colors[i % colors.length]}
                />
              ))}
            </BarChart>
          )}

          {chartType === 'pie' && (
            <PieChart>
              <RechartsTooltip />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectionModelDisplay;
