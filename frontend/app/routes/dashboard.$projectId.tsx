import { redirect } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import KanbanBoard from "~/components/KanbanBoard";
import Loader from "~/components/loader";
import { getProjectById, updateProject } from "~/models/board.server";
import { requireUser } from "~/session.server";
import type { Route } from "./+types/dashboard.$projectId";

export type ProjectLoaderData = typeof loader;
export async function loader({ params, request }: Route.LoaderArgs) {
	const user = await requireUser(request);

	const project = await getProjectById(params.projectId);
	if (!project) {
		return redirect("/dashboard");
	}

	return {
		project,
		data: project.data,
		canEdit: project.userId === user.id,
	};
}

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();

	const projectId = formData.get("projectId")?.toString();
	const data = formData.get("data")?.toString();

	if (!projectId || !data) {
		return redirect("/dashboard");
	}

	await updateProject(projectId, data);

	return null;
};

export default function Project({ loaderData }: Route.ComponentProps) {
	return (
		<div className="h-full px-4 py-12 lg:px-8 overflow-x-auto">
			<ClientOnly
				fallback={
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader />
					</div>
				}
			>
				{() => <KanbanBoard />}
			</ClientOnly>
		</div>
	);
}
