import { app } from "@/app";
import { env } from "@config/env";
import db from "./db";

async function bootstrap() {
  try {
    // Test database connection
    await db.execute("SELECT 1");

    console.info("✅ Database connected successfully")

    // run server only when the database is connected
    const port = env?.PORT;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    })

  } catch (error) {
    console.error(`❌ Database connection failed: ${error}`);
    process.exit(1);
  }
}

bootstrap();