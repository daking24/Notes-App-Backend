import app from "./app";
import env from "./util/validateEnv";
import mongoose from 'mongoose';

const port = env.PORT;

mongoose.connect(env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB...");
    app.listen(port, () => {
      console.log("Server is running on port " + port + "...");
    });
  })
  .catch((err) => console.log("Could not connect to MongoDB...", err));

