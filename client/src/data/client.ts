const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const parseResponse = (response: Response) => {
  if (!response.ok) {
    console.error("client error", response);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const buildRequestUrl = (endpoint: string) => {
  if (!endpoint.startsWith("/")) {
    throw new Error("Endpoint must start with a '/'");
  }
  return `${BASE_URL}${endpoint}`;
};

export default function getClient() {
  const client = {
    // Define your client methods here
    get: async (url: string) => {
      const response = await fetch(buildRequestUrl(url));
      return parseResponse(response);
    },
    post: async <T>(url: string, data: T) => {
      const response = await fetch(buildRequestUrl(url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return parseResponse(response);
    },
    put: async <T>(url: string, data: T) => {
      const response = await fetch(buildRequestUrl(url), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return parseResponse(response);
    },
    delete: async (url: string) => {
      const response = await fetch(buildRequestUrl(url), {
        method: "DELETE",
      });
      return parseResponse(response);
    },
  };

  return client;
}
