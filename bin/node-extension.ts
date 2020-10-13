#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { NodeExtensionStack } from "../lib/node-extension-stack";

const app = new cdk.App();
new NodeExtensionStack(app, "NodeExtensionStack", {
  env: { region: "eu-central-1" }
});
