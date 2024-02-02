import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    ExecuteStatementCommand,
    DynamoDBDocumentClient,
  } from "@aws-sdk/lib-dynamodb";

const app = express();
const port = 8080;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

var getItems = async () => {
    const command = new ExecuteStatementCommand({
        Statement: "SELECT * FROM relay WHERE id=?",
        Parameters: [2],
        ConsistentRead: true,
      });
  
    const response = await docClient.send(command);
    console.log(response.Items);
    return response.Items;
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