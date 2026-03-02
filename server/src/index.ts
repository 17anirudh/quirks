import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"
import { rateLimit } from "elysia-rate-limit";
import { htmlDoc } from "./public/i";
import { html } from "@elysiajs/html"
import * as routes from "./routes/index";
import { logger } from "@tqman/nice-logger"

const app = new Elysia({ name: 'Quirks API' })
  .use(cors({ origin: "http://localhost:3000" }))
  .use(logger({
    mode: 'live',
    withTimestamp: true
  }))
  .use(rateLimit({
    duration: 60000,
    max: 150,
    errorResponse: "Slow down buddy"
  }))
  .use(routes.users)
  .use(routes.post)
  .use(routes.friendship)
  .use(routes.messages)
  .use(routes.showdown)
  .use(html()).get('/', () => htmlDoc)
  .listen(5000);

console.log(`🦊 Standalone Elysia.JS is running on ${app.server?.url}`)
