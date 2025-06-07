import React from "react";
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import logo from './logo.svg';
import "./App.css";
import Dashboard from "./Components/Dashboard";
import Transaction from "./Components/Transaction";
import AssetDataEntry from "./Components/AssetDataEntry/AssetDataEntry";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Nav/Navbar";
import TransactionManagement from "./Components/TransactionManagement";
import "bootstrap/dist/css/bootstrap.min.css";
import TransactionFilter from "./Components/TransactionFilter";
import LivePortfolio from "./Components/LivePorfolio/LivePortfolio";
import Audit from "./Components/User/Audit";
import ReportSchedulingInterface from "./Components/ReportSchedulingInterface";
import AssetAllocationPanel from "./Components/AssetAllocationTracking";
import CashFlowReport from "./Components/Report/CashFlowReport";
import AssetReport from "./Components/Report/AssetReport";
import HistoricalAllocationViewer from "./Components/HistoricalAllocationViewer";
import RebalancingRecommendation from "./Components/RebalancingRecommendations";
import FinancialPlanning from "./Components/Financial Planning/FinancialPlanning";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Feedback from "./Components/Feedback";
import { AuthProvider } from "./Components/User/AuthContext";
import RegistrationModal from "./Components/Authentication/RegistrationModal";
import LoginModal from "./Components/Authentication/LoginModal";
import PersonalDashboard from "./Components/Personalized Dashboard/PersonalDashboard";
import UpdateAsset from "./Components/AssetDataEntry/UpdateAsset";
import AssetPieChart from "./Components/LivePorfolio/Assetpiechart";
import AssetTransPie from "./Components/LivePorfolio/AssetTransPie";
import TransGraph from "./Components/LivePorfolio/TransGraph";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

function App() {
  return (
    <React.Fragment>
      <AuthProvider>
        <Navbar></Navbar>
        <div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/home" element={<Dashboard />} />
            {/* <Route
              path="/dashboard"
              element={
                localStorage.getItem("token") ? (
                  <PersonalDashboard />
                ) : (
                  <Navigate to="/" />
                )
              }
            /> */}
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/user-registration" element={<RegistrationModal />} />
            <Route path="/user-login" element={<LoginModal />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/transaction-filter" element={<TransactionFilter />} />
            <Route path="/asset-data-entry" element={<AssetDataEntry />} />
            {/* <Route path="/update-asset" element={<UpdateAsset />} /> */}
            <Route
              path="/transaction-management"
              element={<TransactionManagement />}
            />
            <Route path="/audit" element={<Audit />} />
            <Route path="/portfolio" element={<LivePortfolio />} />
            <Route path="/cashFlowReport" element={<CashFlowReport></CashFlowReport>}></Route>
            <Route
              path="/report-scheduling-interface"
              element={<ReportSchedulingInterface />}
            />
            {/* <Route path="/card" element={<Dashboard />} /> */}
            <Route
              path="/asset-allocation-tracking"
              element={<AssetAllocationPanel />}
            />
            <Route path="/assetReport" element={<AssetReport></AssetReport>}></Route>
            <Route path="/financial-planning" element={<FinancialPlanning />} />
            <Route
              path="/historical-allocation-viewer"
              element={<HistoricalAllocationViewer />}
            />
            <Route
              path="/rebalancing-recommendations"
              element={<RebalancingRecommendation />}
            />
            <Route path="/feedback" element={<Feedback></Feedback>}></Route>
            <Route path="/assetpie" element={<AssetPieChart></AssetPieChart>}></Route>
            <Route path="/tp" element={<AssetTransPie></AssetTransPie>}></Route>
            <Route path="/cash" element={<TransGraph></TransGraph>}></Route>
          </Routes>
          <ToastContainer />
        </div>
      </AuthProvider>
    </React.Fragment>
  );
}

export default App;
