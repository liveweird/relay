import express from "express";
import dotenv from "dotenv";

const app = express();
const port = 8080;

dotenv.config();

const private1Host = process.env.PRIVATE1_HOST;
const private1Port = process.env.PRIVATE1_PORT;
const private1Address = `http://${private1Host}:${private1Port}/`;

type Item = {
  id: number;
  name: string;
  qty: number;
}

type ItemsResponse =
  | (Omit<Response, "json"> & {
      status: 201;
      json: () => Item[] | PromiseLike<Item[]>;
    });

async function getItemsPrivate1(): Promise<Item[]> {

  const request = new Request(private1Address, {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    }
  });

  console.log(`Trying to connect to ${private1Address}`);

  return fetch(request)
    .then(response => (response as ItemsResponse).json())
    .then(items => {
      console.log(`Private1 items: ${items}`);
      return Promise.resolve(items);
    })
    .catch(err => {
      console.log(`Private1 request error: ${err}`);
      return Promise.reject(err);
    });
}

app.get("/", (req, res) => {
  console.log(`Request received. ${req}`);
  getItemsPrivate1().then((items) => {
    console.log(`Response received. ${items}`);
    res.send(items);
  })
  .catch((err) => {
    console.log(`Promise error: ${err}`);
    res.send([]);
  });
  console.log(`Request processed.`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
