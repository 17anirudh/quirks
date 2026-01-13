import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "Hello Elysia").listen(5000);

app.get('/user/:id', ( { params: { id } } ) => id);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
