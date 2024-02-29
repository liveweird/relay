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

// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

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
  