import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
  DB_CONNECTION_STRING: str(),
  PORT: port(),
  SESSION_SECRET: str(),
  FRONTEND_URL: str(),
})