
export async function sendHttpReq(url, method = "GET", data = null) {
    const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

    const options = {
        method,
        credentials: "include",
    };

    if (data !== null && data !== undefined) {
        if (isFormData) {
            options.body = data;
        } else {
            options.headers = {
                "Content-Type": "application/json",
            };
            options.body = JSON.stringify(data);
        }
    }

    let response;

    try {
        response = await fetch(`http://localhost:3000/${url}`, options);
    } catch (error) {
        throw new Error("Cannot connect to the server.");
    }

    // Redirect to login if the session has expired
    if (response.status === 401) {
        const isLoginRequest = url.replace(/^\/+/, "") === "users/login";

        if (!isLoginRequest) {
            window.location.replace("/login");
        }

        const result = await response.json().catch(() => ({}));

        throw new Error(
            result.message || "Your session has expired. Please login again."
        );
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}
