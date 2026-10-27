const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8082';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export class AuthApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  isDuplicateEmail: boolean;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
    isDuplicateEmail: boolean = false
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isDuplicateEmail = isDuplicateEmail;
  }
}

export const authService = {
  async register(data: RegisterRequest): Promise<UserResponse> {
    let res: Response;
    try {
      res = await fetch(`${AUTH_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : 'Network error';
      throw new AuthApiError(
        `Unable to reach authentication service. Please check your network connection or server status. (${msg})`,
        0
      );
    }

    if (!res.ok) {
      let body: { message?: string; fieldErrors?: Record<string, string> } | null = null;
      try {
        body = await res.json();
      } catch {
        // Response is non-JSON or empty
      }

      if (res.status === 409) {
        throw new AuthApiError(
          body?.message || 'An account with this email address already exists.',
          409,
          undefined,
          true
        );
      }

      if (res.status === 400) {
        throw new AuthApiError(
          body?.message || 'Validation failed. Please verify your details.',
          400,
          body?.fieldErrors
        );
      }

      throw new AuthApiError(
        body?.message || `Registration failed with status ${res.status}: ${res.statusText}`,
        res.status
      );
    }

    return await res.json();
  },
};
