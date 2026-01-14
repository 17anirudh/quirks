import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors"

export const app = new Elysia().use(cors({
  origin: "http://localhost:3000"
})).listen(5000);

app.get('/', () => { return { ok: true } })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
