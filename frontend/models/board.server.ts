import { boardApi } from "./api.server";

export async function getProjectsByUser(user_id: string) {
	const response = await boardApi.getByUser(user_id);
	return response.data || [];
}

export async function getProjectById(id: string) {
	const response = await boardApi.getById(id);
	return response.data || null;
}

export async function deleteProject(id: string) {
	await boardApi.delete(id);
}

export async function createProject({
	name,
	description,
	userId,
}: {
	name: string;
	description: string;
	userId: string;
}) {
	const response = await boardApi.create({
		name,
		description,
		userId,
	});

	return response.data;
}

export async function updateProject(id: string, data: string) {
	await boardApi.update(id, data);
}
