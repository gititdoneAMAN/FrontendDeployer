const { exec } = require("child_process");
const Valkey = require("ioredis");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

require("dotenv").config();

const serviceUri = process.env.REDIS_URL || "";
const valkey = new Valkey(serviceUri);

const PROJECT_ID = process.env.PROJECT_ID || "";
async function publish(msg) {
  await valkey.publish("test", msg);
}

const s3client = new S3Client({
  region: process.env.REGION || "",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
  },
});

async function init() {
  console.log("Excuting Script...");
  await publish("Excuting Script...");

  const p = exec(`cd output && npm install && npm run build`);

  p.stdout.on("data", async (data) => {
    console.log(data.toString());
    await publish(data.toString());
  });

  p.stderr.on("data", async (data) => {
    console.log(data.toString());
    await publish(data.toString());
  });

  p.on("close", async () => {
    console.log("Build Complete");
    await publish("Build complete");

    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    for (const file of distFolderContent) {
      console.log("Uploading ", file);
      await publish(`Uploading ${file}`);

      let currentFilePath = path.join(distFolderPath, file);

      if (fs.lstatSync(currentFilePath).isDirectory()) continue;

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME || "",
        Key: `__output/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(currentFilePath),
        ContentType: mime.lookup(currentFilePath),
      });

      try {
        await s3client.send(command);
        await publish(`Uploaded ${file}`);
        console.log(`Uploaded ${file}`);
      } catch (err) {
        await publish(`Error while uploading ${file}`);
        console.log(`Error while uploading ${file}`);
        console.log(err);
        process.exit(1);
      }
    }
    await publish(`Task Completed`);
    console.log(`Task Completed`);
    valkey.disconnect();
  });
}

init();
