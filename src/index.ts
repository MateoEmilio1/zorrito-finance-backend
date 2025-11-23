import { config } from "dotenv";
import app from "./app.js";

config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Zorrito backend listening on http://localhost:${PORT}`);
});
