import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet"; //ai
import rateLimit from "express-rate-limit"; //ai

const app = express();

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(helmet()); //sets secure HTTP headers

//Rate limiting - prevent spam/abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min
  max: 1000, // limit each IP to 200 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

//Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//trust proxy (important for production behind  Nginx/Cloudflare)
app.set("trust proxy", 1);

//Important routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import aiRouter from "./routes/ai.routes.js";
import notificationRouter from "./routes/notification.routes.js";

//API routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter); //https://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/notifications", notificationRouter);



//404 Handler - Route not found   ai
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "Not Found",
  });
});

//Global Error Handler (for asyncHandler)    ai
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
