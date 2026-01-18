import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"
import { rateLimit } from "elysia-rate-limit";
import { htmlDoc } from "./public/i";
import { html } from "@elysiajs/html"
import * as routes from "./routes"
import { logger } from "@tqman/nice-logger"

const app = new Elysia({ name: 'Quirks API' })
  .use(cors({ origin: "http://localhost:3000" }))
  .use(logger({
    mode: 'live',
    withTimestamp: true
  }))
  .use(rateLimit({
    duration: 60000,
    max: 10,
    errorResponse: "Slow down buddy"
  }))
  .use(routes.users)
  .use(routes.post)
  .listen(5000);

app.use(html()).get('/', () => htmlDoc)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
