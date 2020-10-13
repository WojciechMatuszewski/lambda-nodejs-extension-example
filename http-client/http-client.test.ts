import { setupServer } from "msw/node";
import { rest } from "msw";
import { createHttpClient } from "./http-client";

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("simple get request", async () => {
  server.use(
    rest.get("http://127.0.0.1:9001/get", (req, res, ctx) => {
      return res(ctx.json({ message: "success" }));
    })
  );

  const client = createHttpClient("http://127.0.0.1:9001");

  await expect(client.get({ path: "/get" })).resolves.toEqual({
    data: { message: "success" },
    headers: { "x-powered-by": "msw", "content-type": "application/json" }
  });
});

test("simple post request", async () => {
  const testBody = JSON.stringify({ foo: "bar" });
  server.use(
    rest.post("http://google.com/post", (req, res, ctx) => {
      expect(req.body).toEqual(testBody);
      return res(ctx.json({ message: "success" }));
    })
  );

  const client = createHttpClient("http://google.com");

  await expect(client.post({ path: "/post", data: testBody })).resolves.toEqual(
    {
      data: { message: "success" },
      headers: { "x-powered-by": "msw", "content-type": "application/json" }
    }
  );
  expect.assertions(2);
});
