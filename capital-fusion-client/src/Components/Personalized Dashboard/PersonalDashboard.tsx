import { FC } from "react";
import GreetingBar from "./GreetingBar";
import CurrentGoal from "./CurrentGoal";

const PersonalDashboard: FC = () => {
  return (
    <div className="dashboard-container p-4 text-white bg-black min-h-screen">
      <GreetingBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <CurrentGoal />
        {/* <TodayExpense /> */}
        {/* <AssetCard /> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* <PortfolioOverview /> */}
        {/* <TransactionCard /> */}
      </div>
    </div>
  );
};

export default PersonalDashboard;
