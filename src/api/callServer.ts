import type {ClientApiTypes, ClientRequest} from "../../shared/apiTypes.ts";

export async function callServer<T extends ClientRequest>(name: ClientApiTypes, data: T["req"]): Promise<T["res"]> {
    const port = 3000;
    const response = await fetch(`http://localhost:${port}/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "x-zorik-token": "Gmak388djjsh2D",
        },
        body: JSON.stringify(data),
    })

    return await response.json() as T["res"];
}
