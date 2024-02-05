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
    },
    body: JSON.stringify({})
  });

  fetch(request)
    .then(response => (response as ItemsResponse).json())
    .then(items => { return Promise.resolve(items); });

  return Promise.reject();
}


app.get("/", (req, res) => {
  getItemsPrivate1().then((items) => {
    res.send(items);
  })
  .catch((err) => {
    console.log(err);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
