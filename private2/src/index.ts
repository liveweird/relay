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

const redis = new Redis({
  port: redisPortInt,
  host: redisHost
});

var getItems = async () => {
  redis.get("items", (err, result) => {
    if (err) {
      console.log(err);
    }
    return result;
  });
};

app.get("/", (req, res) => {
  getItems().then((items) => {
      res.send(items);
  })
  .catch((err) => {
      console.log(err);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
