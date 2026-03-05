import { expect, test } from "bun:test";
import { app } from "..";

test("Authorization/Safety checks", async () => {
    const res = await fetch(`${app.server?.url}/user/delete`, {
        method: 'DELETE'
    })
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toHaveProperty("error", "Missing or invalid Authorization header");

    app.stop();
})