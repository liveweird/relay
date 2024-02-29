import express from "express";
import dotenv from "dotenv";
import * as xray from 'aws-xray-sdk';

xray.captureHTTPsGlobal(require('http'));

const app = express();
const port = 8080;

dotenv.config();

import process from 'process';

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new ExpressInstrumentation(),
    new HttpInstrumentation({
        requestHook: (span, request) => {
          span.setAttribute("???", "request");
        },
    }),
    new AwsInstrumentation({
      suppressInternalInstrumentation: true
    })
  ],
});

sdk.start();

var rules = {
  "rules": [
    {
      "description": "Public1",
      "service_name": "*",
      "http_method": "*",
      "url_path": "/*",
      "fixed_target": 1,
      "rate": 1 }
    ],
  "default": { "fixed_target": 1, "rate": 0.1 },
  "version": 1
  }

xray.middleware.setSamplingRules(rules);

app.use(xray.express.openSegment('Public1'));
xray.middleware.enableDynamicNaming('*.awsapprunner.com');

const private1Host = process.env.PRIVATE1_HOST;
const private1Port = process.env.PRIVATE1_PORT;
const private1Address = `https://${private1Host}:${private1Port}/`;

type Item = {
  id: number;
  name: string;
  qty: number;
}

type ItemsResponse =
  | (Omit<Response, "json"> & {
      status: 200;
      json: () => Item[] | PromiseLike<Item[]>;
    });

async function getItemsPrivate1(): Promise<Item[]> {

  const request = new Request(private1Address, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
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

app.use(xray.express.closeSegment());

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
