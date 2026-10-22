import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Login from "./pages/login";
import CreateNewUser from "./pages/createNewUsers";
import CreateNewCoordinator from "./pages/createNewCoordinators";
import ShowAllUser from "./pages/showAllUser";
import GivePermission from "./pages/givePermission";
import ShowAllCoordinators from "./pages/showAllCoordinators";
import Dashboard from "./pages/dashboard";
import Home from "./pages/home";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/createNewUser" element={<CreateNewUser />} />
                    <Route path="/createNewCoordinator" element={<CreateNewCoordinator />} />
                    <Route path="/showAllCoordinators" element={<ShowAllCoordinators />} />
                    <Route path="/showAllUser" element={<ShowAllUser />} />
                    <Route path="/givePermission" element={<GivePermission />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;