
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
        response = await fetch(
            `http://localhost:3000/${url.replace(/^\/+/, "")}`,
            options
        );
    } catch {
        throw new Error("Cannot connect to the server.");
    }

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
        const normalizedUrl = url.replace(/^\/+/, "");
        const isLoginRequest = normalizedUrl === "users/login";

        if (!isLoginRequest) {
            window.location.replace("/login");
        }

        throw new Error(
            result.message || "Your session has expired. Please login again."
        );
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            result.error ||
            `Request failed with status ${response.status}`
        );
    }

    return result;
}
