
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./../helpers/header";
import { sendHttpReq } from "../lib/httpHandler";
import { useAuth } from "../context/authContext";

function Login() {
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const login = async (event) => {
        event.preventDefault();
        setError("");

        try {
            const response = await sendHttpReq("users/login", "POST", {
                code,
                password,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }
            
            navigate("/dashboard", { replace: true });
            console.log("Login successful:", data);
            loginUser(data.user);
        } catch (error) {
            setError(error.message || "Something went wrong");
        }
    };

    return (
        <>
            <div className="sticky top-0 z-50">
                <Header user={null} />
            </div>

            <div className="flex min-h-screen items-center justify-center bg-slate-100 bg-[url('/images/gomla_market_company_cover.jpg')] bg-cover bg-center p-8">
                <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
                    <h2 className="text-3xl font-bold text-orange-600">
                        Login
                    </h2>

                    <p className="mt-3 text-gray-600">
                        Welcome back! Please sign in.
                    </p>

                    <form onSubmit={login} className="mt-6 space-y-4">
                        <input
                            type="text"
                            name="code"
                            placeholder="User code"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-600"
                        />

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-orange-600 px-5 py-3 text-white hover:bg-orange-700"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
