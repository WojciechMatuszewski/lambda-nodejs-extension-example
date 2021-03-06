import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2";
import { fromRoot, getFunctionPath } from "./utils/utils";

export class NodeExtensionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const extensionLayer = new lambda.LayerVersion(this, "NodeExtensionLayer", {
      code: lambda.Code.fromAsset(fromRoot("./dist/layers")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X]
    });

    const helloHandler = new lambda.Function(this, "helloHandler", {
      code: lambda.Code.fromAsset(getFunctionPath("hello")),
      handler: "handler.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    helloHandler.addLayers(extensionLayer);

    const api = new apigwv2.HttpApi(this, "httpApi");

    const helloIntegration = new apigwv2.LambdaProxyIntegration({
      handler: helloHandler
    });

    api.addRoutes({
      path: "/",
      methods: [apigwv2.HttpMethod.GET],
      integration: helloIntegration
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: api.url ?? "error"
    });
  }
}
