/* Elysia Framework */
/* reference: https://elysiajs.com/ */
import { Elysia } from "elysia";

/* Server - init */
const port : number = Bun.env.PORT ? parseInt(Bun.env.PORT) : 8001;
const app : Elysia = new Elysia();

/* Server/Routes */
app.get("/", () => "Hello World 🚀");
app.get("/about", () => "About page");

// SideNote - Call after you finish with the routes.
app.listen(port);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
