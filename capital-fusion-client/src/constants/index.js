import Asset from "../Components/assets/Asset.png";
import goal from "../Components/assets/goal.png";
import manage from "../Components/assets/MP.png";
import portfolio from "../Components/assets/Port1.png";
import transaction from "../Components/assets/Trans.png";
import daily from "../Components/assets/cash.png";

export const benefits = [
  {
    id: "0",
    title: "Daily Outflow",
    text: "Track your income and expenses effortlessly with quick transaction entry, smart filters, and a clean-coded view. Easily edit or delete entries to keep your finances up to date.",
    img: daily,
  },
  {
    id: "1",
    title: "Manual Asset Entry",
    text: "Easily input and manage your financial assets with a simple form, CSV upload and real time validation. Add or update asset details like type, quantity and purchase price.",
    img: Asset,
  },
  {
    id: "2",
    title: "Live Portfolio Snapshot",
    text: "Stay informed with a real time view of your total portfolio value, automatically upadted with the latest market data.",
    img: portfolio,
  },
  {
    id: "3",
    title: "Transaction Recording",
    text: "Easily record, view and track all transactions realted to your portfolio, from buy/sell orders to dividends and capital gains.",
    img: transaction,
  },
  {
    id: "4",
    title: "Financial Planning Tools",
    text: "Achieve your financial goals with ease using our comprehensive planning tools. Stay informed with probability indicators and adjust your plan as needed.",
    img: goal,
  },
  {
    id: "5",
    title: "Asset Allocation",
    text: "Manage and optimize your portfolio value with real time asset allocation traking and historical data insights.",
    img: manage,
  },
];
