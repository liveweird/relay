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

type Item = {
  id: number;
  name: string;
  qty: number;
}

var getItems = async (): Promise<Item[]> => {
  const redis = new Redis({
    port: redisPortInt,
    host: redisHost,
    showFriendlyErrorStack: true
  });

  redis.on('error', (error) => console.log('Got an error from Redis', error));

  console.log(`Redis info: ${redis.info()}`);
  console.log(`Redis status: ${redis.status}`);

  /*
  redis.set("1", JSON.stringify({
    name: "Johnny"
  }));
  redis.set("2", JSON.stringify({
    name: "Billy"
  }));
  redis.set("3", JSON.stringify({
    name: "Vanessa"
  }));
  */

  var promise1 = redis.ping()
    .then((result) => {
      console.log(`Ping result: ${result}`);
      return Promise.resolve({} as Item);
    })
    .catch((err) => {
      console.log(`Ping error: ${err}`);
      return Promise.reject();
    });

  var promise2 = redis.hello()
    .then((result) => {
      console.log(`Hello result: ${result}`);
      return Promise.resolve({} as Item);
    })
    .catch((err) => {
      console.log(`Hello error: ${err}`);
      return Promise.reject();
    });

  return Promise.all([promise1, promise2]);

    /*
  return redis.get("3")
    .then((result) => {
      console.log(`Result: ${result}`);
      return Promise.resolve([{
          id: 3,
          name: result,
          qty: 1
        } as Item]);
    })
    .catch((err) => {
        console.log(`Error: ${err}`);
        return Promise.reject(err);  
    });
    */
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
