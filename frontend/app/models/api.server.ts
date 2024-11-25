// types.ts
export interface ApiResponse<T> {
	data: T | null;
	error: string | null;
}

export interface User {
	id: string;
	email: string;
	name: string;
	password: string;
}

export interface Board {
	id: string;
	name: string;
	description: string;
	data: string;
	userId: string;
	user?: User;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	id: string;
	success: boolean;
}

// api.ts
const BASE_URL = "http://localhost:8080/api";

async function fetchApi<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, options);
		const data = await response.json();

		if (!response.ok) {
			return { data: null, error: data.message || "An error occurred" };
		}

		return { data, error: null };
	} catch (err) {
		return {
			data: null,
			error: err instanceof Error ? err.message : "Network error",
		};
	}
}

export const userApi = {
	async create(user: Omit<User, "id">): Promise<ApiResponse<User>> {
		return fetchApi<User>(`${BASE_URL}/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(user),
		});
	},

	async getById(id: string): Promise<ApiResponse<User>> {
		return fetchApi<User>(`${BASE_URL}/users/${id}`);
	},

	async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return fetchApi<LoginResponse>(`${BASE_URL}/users/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
		});
	},
};

export const boardApi = {
	async getByUser(userId: string): Promise<ApiResponse<Board[]>> {
		return fetchApi<Board[]>(`${BASE_URL}/boards/user/${userId}`);
	},

	async getById(id: string): Promise<ApiResponse<Board>> {
		const response = await fetchApi<Board>(`${BASE_URL}/boards/${id}`);
		if (response.data) {
			return {
				data: { ...response.data, data: JSON.parse(response.data.data) },
				error: null,
			};
		}
		return response;
	},

	async create(board: Omit<Board, "id" | "data">): Promise<ApiResponse<Board>> {
		return fetchApi<Board>(`${BASE_URL}/boards`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(board),
		});
	},

	async update(id: string, data: string): Promise<ApiResponse<Board>> {
		return fetchApi<Board>(`${BASE_URL}/boards/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: data,
		});
	},

	async delete(id: string): Promise<ApiResponse<void>> {
		return fetchApi<void>(`${BASE_URL}/boards/${id}`, {
			method: "DELETE",
		});
	},
};
