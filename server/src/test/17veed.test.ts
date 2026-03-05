import { expect, test } from "bun:test";
import { app } from "..";

test("Complex database fetch Testing", async () => {
    const res = await fetch("http://localhost:5000/user/u/17veed");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("user");
    expect(json).toHaveProperty("post");
    expect(json).toHaveProperty("relation");

    app.stop();
})