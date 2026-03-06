import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors"
import { rateLimit } from "elysia-rate-limit";
import * as routes from "./routes/index";
import { logger } from "@tqman/nice-logger"

const port = process.env.PORT || 5000

export const app = new Elysia({ name: 'Quirks API' })
  .use(cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4173",
      "https://quirks.vercel.app",
      "https://quirks.vercel.app/"
    ]
  }))
  .use(logger({
    mode: 'live',
    withTimestamp: true
  }))
  .use(rateLimit({
    duration: 60000,
    max: 150, // for testing 4, change it back to 150
    errorResponse: "Slow down buddy"
  }))
  .use(routes.users)
  .use(routes.post)
  .use(routes.friendship)
  .use(routes.messages)
  .use(routes.showdown)
  .get('/', () => {
    return {
      message: "Build using Elysia.js, Bun.js, TypeScript",
      deps: "@tqman/nice-logger, @elysiajs/cors, @elysiajs/rate-limit, @supabase/supabase-js, zod and uWebSockets"
    }
  })
  .listen(port);

console.log(`🦊 Backend beast is running on ${app.server?.url}`)
