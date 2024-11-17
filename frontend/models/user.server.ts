import { type User, userApi } from "./api.server";

export type { User } from "./api.server";

export async function getUserById(id: User["id"]) {
	const response = await userApi.getById(id);
	if (response.error || !response.data) {
		return null;
	}

	return response.data;
}

export async function createUser({
	email,
	password,
	name,
}: Pick<User, "email" | "password" | "name">) {
	const response = await userApi.create({
		email,
		password,
		name,
	});
	return response.data;
}

export async function verifyLogin(
	email: User["email"],
	password: User["password"],
) {
	const response = await userApi.login({
		email,
		password,
	});

	if (!response.data || !response.data.success) {
		return null;
	}

	const user = await getUserById(response.data.id);
	if (!user) return null;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password: _password, ...userWithoutPassword } = user;

	return userWithoutPassword;
}
