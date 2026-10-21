export function sendHttpReq(url, method = "GET", data = null) {
    return fetch(`http://localhost:3000/${url}`, {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        ...(data !== null && {
            body: JSON.stringify(data),
        }),
    });
}