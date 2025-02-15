import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const MONGODB_URL = process.env.MONGODB_URL;

export { PORT, CORS_ORIGIN, MONGODB_URL };
