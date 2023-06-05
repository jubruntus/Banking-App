import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import connect from "connect-dynamodb";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import session from "express-session";
import morgan from "morgan";
import { requiresAuth } from "./middleware/auth";
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import accountRoute from "./routes/accounts";
import transactionRoute from "./routes/transactions";
dotenv.config();

const app = express();

// dev logs
app.use(morgan("dev"));

// enable cors for frontend
app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(express.json());

// session storage via express-session and connect-dynamodb
type SessionData = {
  accountId: string;
  username: string;
};
const DynamoDBStore = connect<SessionData>(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "abcdefg",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      secure: false,
      sameSite: "none",
    },
    rolling: true,
    store: new DynamoDBStore({
      client: new DynamoDBClient({ region: process.env.AWS_REGION }),
      specialKeys: [
        {
          name: "accountId",
          type: "S",
        },
        {
          name: "username",
          type: "S",
        },
      ],
    }),
  })
);

// routes
app.use("/api/account", accountRoute);
app.use("/api/transactions", requiresAuth, transactionRoute);

// middleware
app.use(notFound);
app.use(errorHandlerMiddleware);

// server
const port = parseInt(process.env.PORT || "");
const hostname = process.env.HOSTNAME || "127.0.0.1";

app.listen(port, hostname, () => console.log(`Server started on port ${port}`));
