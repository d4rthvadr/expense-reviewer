interface errorDataInput {
  data?: unknown;
  success?: boolean;
  status?: number;
  message: string;
}

export interface ErrorResponse<T = unknown> {
  status: number;
  error: {
    data?: T;
    message: string;
    success: boolean;
  };
}

/**
 * Normalizes an error object into a standardized error response format.
 *
 * @param {object} params - The input parameters for the error normalization.
 * @param {number} params.status - The HTTP status code of the error.
 * @param {string} params.message - A descriptive error message.
 * @param {any} [params.data=null] - Additional data related to the error (optional).
 * @param {boolean} [params.success=false] - Indicates whether the operation was successful (default is `false`).
 * @returns {ErrorResponse} A standardized error response object.
 */
export const normalizeError = ({
  status,
  message,
  data = null,
  success = false,
}: errorDataInput): ErrorResponse => {
  return {
    status: status || 500,
    error: {
      data,
      message,
      success,
    },
  };
};
