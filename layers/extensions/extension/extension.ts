import { createHttpClient, HttpClient } from "../../../http-client/http-client";

const EXTENSION_NAME = "extension.sh";

async function registerExtension(client: HttpClient) {
  const payload = JSON.stringify({ events: ["INVOKE", "SHUTDOWN"] });
  const { headers } = await client.post({
    path: "/register",
    data: payload,
    headers: { "Lambda-Extension-Name": EXTENSION_NAME }
  });

  return headers["lambda-extension-identifier"];
}

function makeNextIterator(client: HttpClient, extensionID: string) {
  return {
    [Symbol.asyncIterator]: function () {
      return {
        next: async function () {
          const { data } = await client.get({
            path: "/event/next",
            headers: { "Lambda-Extension-Identifier": extensionID }
          });

          return {
            done: data.eventType == "SHUTDOWN",
            value: data
          };
        }
      };
    }
  };
}

async function initExtension() {
  const rootPath = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension`;
  const client = createHttpClient(rootPath);

  console.log("registering extension");
  const extensionID = await registerExtension(client);
  console.log("extension registered");

  const nextEvents = makeNextIterator(client, extensionID);
  for await (let nextEvent of nextEvents) {
    console.log("got event", nextEvent);
  }

  console.log("shutting down...");
  return;
}

initExtension();
