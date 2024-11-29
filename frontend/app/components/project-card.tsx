import { ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { DeleteBoardButton } from "~/routes/api.delete-board";
import type { useProjects } from "~/utils";

interface ProjectCardProps {
	project: ReturnType<typeof useProjects>["userProjects"][0];
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<Card>
			<CardHeader className="grid grid-cols-[1fr_120px] items-start gap-4 space-y-0">
				<div className="flex flex-col gap-3">
					<CardTitle>{project.name}</CardTitle>
					<CardDescription className="line-clamp-2">
						{project.description}
					</CardDescription>
				</div>

				<div className="flex items-center space-x-1 rounded-md bg-secondary text-secondary-foreground">
					<Button variant="secondary" className="px-3 shadow-none" asChild>
						<Link to={project.id} className="flex items-center">
							<ExternalLinkIcon className="mr-2 h-4 w-4" />
							View
						</Link>
					</Button>

					<DeleteBoardButton boardId={project.id} />
				</div>
			</CardHeader>
		</Card>
	);
}
