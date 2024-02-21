import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Redis } from "ioredis";

const app = express();
const port = 8080;

app.use(cors());

dotenv.config();

// get Redis connection parameters from environment variables
const redisPort = process.env.REDIS_PORT;
const redisHost = process.env.REDIS_HOST;

// convert redisPort to integer
const redisPortInt = parseInt(redisPort ?? "6379");

var getItems = async () => {
  const redis = new Redis({
    port: redisPortInt,
    host: redisHost
  });

  console.log(`Redis info: ${redis.info()}`);
  console.log(`Redis status: ${redis.status}`);

  redis.set("1", JSON.stringify({
    name: "Johnny"
  }));
  redis.set("2", JSON.stringify({
    name: "Billy"
  }));
  redis.set("3", JSON.stringify({
    name: "Vanessa"
  }));

  redis.get("3", (err, result) => {
    if (err) {
      console.log(err);
    }
    return JSON.stringify(
      {
        id: 3,
        name: result,
        qty: 1
      }
    );
  });
};

app.get("/", (req, res) => {
  console.log(`Processing request: ${req}`);
  getItems().then((items) => {
      console.log(`Received items: ${items}`);
      res.send(items);
  })
  .catch((err) => {
      console.log(err);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
