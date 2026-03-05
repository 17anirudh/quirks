import { expect, test } from "bun:test";
import { app } from "..";


test("Route Path Testing", async () => {
    const res = await fetch("http://localhost:5000/");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("message", "Build using Elysia.js, Bun.js, TypeScript");
    expect(json).toHaveProperty("deps", "@tqman/nice-logger, @elysiajs/cors, @elysiajs/rate-limit, @supabase/supabase-js, zod and uWebSockets");

    app.stop();
})
