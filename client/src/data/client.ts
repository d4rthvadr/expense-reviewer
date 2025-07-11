const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const parseResponse = <T>(response: Response) => {
  if (!response.ok) {
    console.error("client error", response);
    console.log("err message", response.statusText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const buildRequestUrl = (endpoint: string) => {
  if (!endpoint.startsWith("/")) {
    throw new Error("Endpoint must start with a '/'");
  }
  return `${BASE_URL}${endpoint}`;
};

function getClient() {
  const client = {
    get: async <T = unknown>(endpoint: string) => {
      const response = await fetch(buildRequestUrl(endpoint));
      return parseResponse<T>(response);
    },
    post: async <T>(endpoint: string, data: T) => {
      console.log("post data", { data, endpoint });
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(data),
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      return parseResponse<T>(response);
    },
    put: async <T>(endpoint: string, data: T) => {
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      return parseResponse<T>(response);
    },
    delete: async <T>(endpoint: string) => {
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "DELETE",
      });
      return parseResponse<T>(response);
    },
  };

  return client;
}

export const client = getClient();
