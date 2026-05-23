type ErrorMessages = Record<number, string>;
type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
	customErrors?: ErrorMessages;
}

export type ApiResponse<T> =
	| { data: T; error: null }
	| { data: null; error: { message: string; status: number, serverData?: unknown } };

export class ApiError extends Error {
	constructor(
		public message: string,
		public status?: number,
		public data?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

abstract class ApiClient {
	protected _baseUrl: string;

	constructor(baseUrl: string) {
		this._baseUrl = baseUrl;
	}

	public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this._request<T>('GET', endpoint, undefined, options);
	}

	public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this._request<T>('POST', endpoint, body, options);
	}

	public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this._request<T>('PUT', endpoint, body, options);
	}

	public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this._request<T>('PATCH', endpoint, body, options);
	}

	public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
		return this._request<T>('DELETE', endpoint, undefined, options);
	}

	private async _request<T>(
		method: string,
		endpoint: string,
		body?: unknown,
		options?: RequestOptions
	): Promise<ApiResponse<T>> {
		const { customErrors, headers: optionHeaders, ...fetchOptions } = options ?? {};

		const headers: Record<string, string> = {
			...(body !== undefined && { 'Content-Type': 'application/json' }),
			...(optionHeaders as Record<string, string>),
		};

		try {
			const response = await fetch(`${this._baseUrl}${endpoint}`, {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(body) : undefined,
				...fetchOptions,
			});

			if (!response.ok) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				let serverData: any;
				try {
					serverData = await response.json();
				} catch { /* Not JSON */ }

				const serverMessage = serverData?.message ?? serverData?.error;
				const message = customErrors?.[response.status] ??
					serverMessage ??
					this._getDefaultErrorMessage(response.status);

				return {
					data: null,
					error: { message, status: response.status, serverData }
				};
			}

			const data = response.status === 204 ? (undefined as T) : await response.json();
			return { data, error: null };

		} catch (error) {
			const isNetworkError = error instanceof Error &&
				(error.message.includes('fetch') || error.name === 'TypeError');

			return {
				data: null,
				error: {
					message: isNetworkError
						? 'Сервер недоступен или ошибка сети'
						: (error instanceof Error ? error.message : 'Непредвиденная ошибка'),
					status: 0 // client-side/network failure
				}
			};
		}
	}

	private _getDefaultErrorMessage(status: number): string {
		const defaultMessages: ErrorMessages = {
			400: 'Некорректный запрос',
			401: 'Не авторизован',
			403: 'Доступ запрещён',
			404: 'Ресурс не найден',
			500: 'Внутренняя ошибка сервера',
		};

		return defaultMessages[status] ?? `Непредвиденная ошибка (${status})`;
	}
}

export default ApiClient;
