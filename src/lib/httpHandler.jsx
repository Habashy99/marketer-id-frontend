export function sendHttpReq(url, method = "GET", data = null) {
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

    return fetch(`http://localhost:3000/${url}`, options);
}