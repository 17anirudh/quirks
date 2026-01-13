import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"

export const app = new Elysia().use(cors()).listen(5000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
