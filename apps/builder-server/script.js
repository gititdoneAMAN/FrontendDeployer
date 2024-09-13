const { exec } = require("child_process");
const Valkey = require("ioredis");
require("dotenv").config();

serviceUri = process.env.REDIS_URL || "";

const valkey = new Valkey(serviceUri);

async function publish(msg) {
  await valkey.publish("test", msg);
}

async function init() {
  console.log("Excuting Script...");
  publish("Excuting Script...");

  const p = exec(`cd output && npm install && npm run build`);
  p.stdout.on("data", (data) => {
    console.log(data.toString());
    publish(data.toString());
  });
  p.stderr.on("error", (data) => {
    console.log(data.toString());
    publish(data.toString());
  });
  p.on("exit", () => {
    console.log("done");
    publish("done");
    valkey.disconnect();
  });
}

init();
