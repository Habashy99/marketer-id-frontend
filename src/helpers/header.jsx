import { useNavigate } from "react-router-dom";
import { sendHttpReq } from "../lib/httpHandler";
import { useAuth } from "../context/authContext";

function Header({ user: showLogoutButton }) {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    const logout = async () => {
        try {
            const response = await sendHttpReq("users/logout", "POST");
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to log out");
            }

            logoutUser();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
            alert(error.message || "Logout failed");
        }
    };

    return (
        <header
            dir="ltr"
            className="grid w-full grid-cols-3 items-center bg-white px-3 py-4 sm:px-6"
        >
            <div className="justify-self-start">
                {showLogoutButton && (
                    <button
                        type="button"
                        onClick={logout}
                        className="rounded-lg bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 sm:px-5 sm:py-3 sm:text-base"
                    >
                        تسجيل الخروج
                    </button>
                )}
            </div>

            <h1
                dir="rtl"
                className="justify-self-center whitespace-nowrap text-lg font-bold text-orange-600 sm:text-3xl"
            >
                معرِّف المسوِّق
            </h1>

            <div className="justify-self-end overflow-hidden rounded-lg">
                <img
                    src="/images/gomlaMarketlogo2.jpg"
                    alt="HRMS Logo"
                    className="h-12 w-12 object-cover sm:h-20 sm:w-20"
                />
            </div>
        </header>
    );
}

export default Header;
