import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type TListResponse<T> = {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
} & ResponseWithError;

export type TResponse<T> = {
  data: T | null;
} & ResponseWithError;

export type ResponseWithError = {
  error?: string;
  authError?: boolean;
  message?: string;
  success: boolean;
};

/**
 * Handles errors from client-side operations and formats them into a standardized response object.
 *
 * @param error - The error object to handle. Can be of any type.
 * @returns An object containing:
 *   - `success`: Always `false` to indicate failure.
 *   - `error`: The error message if the error is an instance of `Error`, otherwise a generic message.
 *   - `authError`: `true` if the error is an authentication error, otherwise `false`.
 */
export const clientErrorHandler = (error: unknown): ResponseWithError => {
  console.error("Error:", error);
  const isAuthError =
    error instanceof Error && error.message === "Authentication required";
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
    authError: isAuthError,
  };
};

type ErrorResponse = {
  message: string;
  success: boolean;
};

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "success" in data
  );
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  // Handle error response
  const errorMessage = await getErrorMessage(response);
  console.log("err message", errorMessage);
  throw new Error(errorMessage);
};

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();

    if (isErrorResponse(errorData) && !errorData.success) {
      return errorData.message;
    }
  } catch (err) {
    console.error("Error parsing error response:", err);
  }

  return response.statusText;
};

const buildRequestUrl = (endpoint: string) => {
  if (!endpoint.startsWith("/")) {
    throw new Error("Endpoint must start with a '/'");
  }
  return `${BASE_URL}${endpoint}`;
};

function getClient(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const client = {
    get: async <T = unknown>(endpoint: string) => {
      const response = await fetch(buildRequestUrl(endpoint), {
        headers,
      });
      return parseResponse<T>(response);
    },
    post: async <T>(endpoint: string, data: T) => {
      console.log("post data", { data, endpoint });
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "POST",
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      return parseResponse<T>(response);
    },
    put: async <T>(endpoint: string, data: T) => {
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "PUT",
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      return parseResponse<T>(response);
    },
    delete: async <T>(endpoint: string) => {
      const response = await fetch(buildRequestUrl(endpoint), {
        method: "DELETE",
        headers,
      });
      return parseResponse<T>(response);
    },
  };

  return client;
}

// Create authenticated client for server actions
export async function getAuthenticatedClient() {
  const authData = await auth();
  const token = await authData.getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return getClient(token);
}
