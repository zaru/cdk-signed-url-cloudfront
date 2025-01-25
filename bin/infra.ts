#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AcmStack } from "../lib/acm-stack";
import { CloudfrontStack } from "../lib/cloudfront-stack";

const app = new cdk.App();

// CloudFrontでACMを設定するにはus-east-1で証明書を発行する必要がある
const acmStack = new AcmStack(app, "ExampleAcm", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
  crossRegionReferences: true,
});

new CloudfrontStack(app, "ExampleCF", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  crossRegionReferences: true,
  certificate: acmStack.certificate,
});
