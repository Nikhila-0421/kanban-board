import {
	Button,
	Drawer,
	Input,
	Label,
	Textarea,
	usePrompt,
} from "@medusajs/ui";
import * as React from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { EmptyPrivateProjectsPlaceholder } from "~/components/empty-placeholder";
import { useTabState } from "~/components/hooks/use-tab-state";
import { ProjectCard } from "~/components/project-card";
import { Separator } from "~/components/ui/separator";
import { createProject } from "~/models/board.server";
import { requireUser } from "~/session.server";
import { useProjects } from "~/utils";
import type { Route } from "./+types/dashboard._index";

export const action = async ({ request }: Route.ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();

	const name = formData.get("name")?.toString();
	const description = formData.get("description")?.toString();

	if (!name || !description) {
		return {
			message: "Invalid data",
			success: false,
			data: null,
		};
	}

	const board = await createProject({
		name,
		description,
		userId: user.id,
	});

	if (!board) {
		return {
			success: false,
			data: null,
			message: "Failed to create board",
		};
	}

	return {
		success: true,
		data: board.id,
		message: "Board created",
	};
};

export default function Dashboard() {
	const { userProjects } = useProjects();
	const prompt = usePrompt();

	const [tab, setTab] = useTabState();

	if (!tab || (tab !== "public" && tab !== "private")) {
		setTab("public");
	}

	const [open, setOpen] = React.useState(false);
	const fetcher = useFetcher<typeof action>();
	const navigate = useNavigate();

	const isSubmiting = fetcher.state !== "idle";

	React.useEffect(() => {
		if (isSubmiting) return;

		if (!fetcher.data) return;

		if (fetcher.data.success) {
			toast.success(fetcher.data.message);
			navigate(`/dashboard/${fetcher.data.data}`);
			setOpen(false);
		}
	}, [isSubmiting, fetcher.data, navigate]);

	return (
		<>
			<div className="h-full px-4 py-6 lg:px-8">
				<div className="w-full">
					<div className="flex items-center justify-between">
						<div className="ml-auto mr-4">
							<Drawer open={open} onOpenChange={setOpen}>
								<Drawer.Trigger asChild>
									<Button>Add Project</Button>
								</Drawer.Trigger>
								<Drawer.Content>
									<Drawer.Header>
										<Drawer.Title>Create Board</Drawer.Title>
									</Drawer.Header>
									<Drawer.Body className="p-4">
										<fetcher.Form
											id="create-board"
											method="POST"
											className="grid gap-4"
										>
											<div className="flex flex-col gap-2 items-start">
												<Label htmlFor="name">Name</Label>
												<div className="w-full">
													<Input id="name" name="name" />
												</div>
											</div>

											<div className="flex flex-col gap-2 items-start">
												<Label htmlFor="description">Description</Label>
												<Textarea id="description" name="description" />
											</div>
										</fetcher.Form>
									</Drawer.Body>
									<Drawer.Footer>
										<Drawer.Close asChild>
											<Button variant="secondary">Cancel</Button>
										</Drawer.Close>
										<Button
											type="submit"
											disabled={isSubmiting}
											form="create-board"
										>
											Create
										</Button>
									</Drawer.Footer>
								</Drawer.Content>
							</Drawer>
						</div>
					</div>

					<div className="mt-6">
						<Separator className="my-4" />
						<div className="relative">
							{userProjects.length > 0 ? (
								<div className="grid grid-cols-2 gap-4">
									{userProjects.map((project) => (
										<ProjectCard key={project.id} project={project} />
									))}
								</div>
							) : (
								<EmptyPrivateProjectsPlaceholder />
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
