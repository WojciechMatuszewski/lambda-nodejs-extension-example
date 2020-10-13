import * as http from "http";
import { URL } from "url";

export type HttpClient = ReturnType<typeof createHttpClient>;

export function createHttpClient(rootPath: string) {
  const { host, port } = new URL(rootPath);
  const [h, _] = host.split(":");
  const request = requestForHost({ host: h, port });

  return {
    get: request.bind(null, "GET"),
    post: request.bind(null, "POST")
  };
}

type RequestOptions = {
  path: string;
  data?: string;
  headers?: http.OutgoingHttpHeaders;
};

type SetupOptions = {
  host: string;
  port: string;
};

function requestForHost({ host, port }: SetupOptions) {
  return function request(
    method: string,
    { path, data, headers }: RequestOptions
  ): Promise<{ data: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const rq = http.request(
        {
          method: method,
          host: host,
          path: `/2020-01-01/extension${path}`,
          port: port,
          headers
        },
        response => {
          const chunks: Buffer[] = [];

          response.on("data", chunk => chunks.push(chunk));

          response.on("end", () =>
            resolve({
              data: parseChunks(chunks),
              headers: response.headers
            })
          );

          response.on("error", reject);
        }
      );

      if (data) {
        rq.write(data);
      }

      rq.end();
    });
  };

  function parseChunks(chunkArr: Buffer[]) {
    const buf = Buffer.concat(chunkArr);
    if (buf.length === 0) return null;

    return JSON.parse(buf.toString());
  }
}
