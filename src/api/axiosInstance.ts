import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
}

export const axiosInstance = axios.create({
  baseURL: 'https://60a21a08745cd70017576014.mockapi.io/api/v1',
  timeout: 7000,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    throw toApiError(error);
  },
);

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const serverMessage =
      typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data
        ? String(error.response.data.message)
        : undefined;

    return {
      message: serverMessage ?? error.message ?? 'Unexpected API error',
      statusCode,
      isNetworkError: !error.response,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      isNetworkError: false,
    };
  }

  return {
    message: 'Unexpected error',
    isNetworkError: false,
  };
}

export function isApiError(error: unknown): error is ApiError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as Partial<ApiError>;

  return typeof candidate.message === 'string' && typeof candidate.isNetworkError === 'boolean';
}
