import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/Home";
import Layout from "./components/layout/Layout";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      // { path: "/viewNFTs", element: <ViewNFTs /> },
      // { path: "/getSignature", element: <GetSignature /> },
      // { path: "/bunnyMarket", element: <BunnyMarket /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
