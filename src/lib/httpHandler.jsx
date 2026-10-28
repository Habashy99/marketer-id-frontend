
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

    const normalizedUrl = url.replace(/^\/+/, "");

    let response;

    try {
        response = await fetch(
            `http://127.0.0.1:3000/${normalizedUrl}`,
            options
        );
    } catch (error) {
        console.error("API connection error:", error);
        throw new Error("Cannot connect to the server.");
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            result.message ||
            result.error ||
            `Request failed with status ${response.status}`
        );
    }

    return result;
}
