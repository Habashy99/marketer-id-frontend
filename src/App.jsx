
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";


import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import MarketingHome from "./pages/marketing/marketingHome.jsx";
import UsersManagement from "./pages/marketing/usersManagement.jsx";
import CoordinatorsManagement from "./pages/marketing/coordinatorsManagement.jsx";
import PricingHome from "./pages/pricing/pricingHome.jsx";





function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/marketing" element={<MarketingHome />} />
                    <Route
                        path="/marketing/users"
                        element={<UsersManagement />}
                    />
                    <Route
                        path="/marketing/coordinators"
                        element={<CoordinatorsManagement />}
                    />
                    <Route path="/pricing" element={<PricingHome />} />



                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
