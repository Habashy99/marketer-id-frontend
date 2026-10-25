import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";


import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import MarketingHome from "./pages/marketing/marketingHome.jsx";
import UsersManagement from "./pages/users/usersManagement.jsx";
import CoordinatorsManagement from "./pages/marketing/coordinators/coordinatorsManagement.jsx";
import PricingHome from "./pages/pricing/pricingHome.jsx";
import PrintLogManagment from "./pages/marketing/printLogs/printLogsManagement.jsx";
import CardDesigner from "./pages/marketing/cardDesigner/cardDesigner.jsx";





function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/marketing" element={<MarketingHome />} />
                    <Route
                        path="/users"
                        element={<UsersManagement />}
                    />
                    <Route
                        path="/marketing/printer-log"
                        element={<PrintLogManagment />}
                    />
                    <Route
                        path="/marketing/coordinators"
                        element={<CoordinatorsManagement />}
                    />
                    <Route
                        path="/marketing/card-designer"
                        element={<CardDesigner />}
                    />
                    <Route path="/pricing" element={<PricingHome />} />



                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
