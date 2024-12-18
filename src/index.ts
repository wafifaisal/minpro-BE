import express, { Application, Request, Response } from "express";
import cors from "cors";
import { EventRouter } from "./routers/event.router";
import { UserRouter } from "./routers/user.router";
import { AuthRouter } from "./routers/auth.router";
import { OrgAuthRouter } from "./routers/org.auth.router";

const PORT: number = 8000;
const app: Application = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Welcome to my API");
});

const eventRouter = new EventRouter();
const userRouter = new UserRouter();
const authRouter = new AuthRouter();
const orgAuthRouter = new OrgAuthRouter();

app.use("/api/events", eventRouter.getRouter());
app.use("/api/users", userRouter.getRouter()); 
app.use("/api/auth", authRouter.getRouter());
app.use("/api/organizer", orgAuthRouter.getRouter());

// console.log(process.env.JWT_KEY);




app.listen(PORT, () => {
  console.log(`server running on -> http://localhost:${PORT}/api`);
});
