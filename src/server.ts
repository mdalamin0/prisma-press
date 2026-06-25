import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const port = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("database connected successfullly!");
    app.listen(port, () => {
       console.log(`Example app listening on port ${port}`);
    })
  } catch (error) {
    console.log(`error starting the server: ${error}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();