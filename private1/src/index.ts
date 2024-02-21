import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    ExecuteStatementCommand,
    DynamoDBDocumentClient,
  } from "@aws-sdk/lib-dynamodb";

const app = express();
const port = 8080;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

app.use(cors());

dotenv.config();

const private2Host = process.env.PRIVATE2_HOST;
const private2Port = process.env.PRIVATE2_PORT;
const private2Address = `https://${private2Host}:${private2Port}/`;

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

async function getItemsPrivate2(): Promise<Item[]> {

    const request = new Request(private2Address, {
        method: 'GET',
        headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        }
    });
    
    console.log(`Trying to connect to ${private2Address}`);
    
    return fetch(request)
        .then(response => {
            console.log(`Unparsed: ${JSON.stringify(response)}`);
            return (response as ItemsResponse).json();
        })
        .then(items => {
            console.log(`Private2 items: ${items}`);
            return Promise.resolve(items);
        })
        .catch(err => {
            console.log(`Private2 request error: ${err}`);
            return Promise.reject(err);
        });
    }

var getItems = async () => {
    const command = new ExecuteStatementCommand({
        Statement: "SELECT * FROM \"sgebski-relay-ddb\" WHERE id=?",
        Parameters: [2],
        ConsistentRead: true,
      });
  
    const response = await docClient.send(command);
    console.log(response.Items);
    return response.Items;
};

app.get("/", (req, res) => {

    Promise.all([getItemsPrivate2()])
    .then((items) => {
            res.send(items);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});