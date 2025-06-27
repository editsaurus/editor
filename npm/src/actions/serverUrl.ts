export function getServerUrl(path: string) {
    return process.env.CODECLICK_DEV_LOCAL ? `http://localhost:3009${path}` : `https://editsaururs-sadas.app${path}`;
}

export async function fetchServer(url: string, body: any) {
    const serverUrl = getServerUrl(url);

    try {
        const response = await fetch(serverUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}