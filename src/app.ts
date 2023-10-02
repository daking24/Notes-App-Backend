import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import notesRoutes from "./routes/notes";
import userRoutes from "./routes/user";
import morgan from 'morgan';
import createHttpError, { isHttpError } from 'http-errors';
import session from 'express-session'
import env from "./util/validateEnv";
import MongoStore from 'connect-mongo';
import { requireAuth } from './middleware/auth';
import cors from 'cors';


// Server
const app = express();

interface CorsOptions {
  origin: string,
  methods: string,
  allowedHeaders: string,
  credentials: boolean
}


// CORS
const corsOptions: CorsOptions = {
  origin: "https://cool-notes-vec8.onrender.com/", // Replace with your actual frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type',
  credentials: true, // If you're using cookies or sessions
};

app.use(cors(corsOptions)); // Use this after the variable declaration

app.use(morgan('dev'));

app.use(express.json());

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // save for an hour
    maxAge: 60 * 60 * 1000,
  },
  rolling: true,
  store: MongoStore.create({
    mongoUrl: env.DB_CONNECTION_STRING,
  }),
}))

// 
app.use("/api/notes", requireAuth, notesRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"))
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  let errorMessage = "An unkown error occured";
  let statusCode = 500;
  
  if (isHttpError(error)){
    statusCode = error.status;
    errorMessage = error.message;
  }

  res.status(statusCode).json({ error: errorMessage });
});

export default app;