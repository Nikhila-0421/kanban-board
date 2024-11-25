import { Trash2Icon } from "lucide-react";
import * as React from "react";
import {
	type ActionFunctionArgs,
	data,
	redirect,
	useFetcher,
} from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { deleteProject } from "~/models/board.server";

export const ROUTE = "/api/delete-board";
export const loader = async () => {
	return redirect("/dashboard");
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const boardId = formData.get("boardId")?.toString();

	if (!boardId) {
		return data({
			success: false,
			message: "Please try again later",
		});
	}

	await deleteProject(boardId);

	return data({
		success: true,
		message: "Board deleted successfully",
	});
};

export function DeleteBoardButton({ boardId }: { boardId: string }) {
	const fetcher = useFetcher<typeof action>();

	const isSubmitting = fetcher.state !== "idle";

	React.useEffect(() => {
		if (isSubmitting) return;

		if (!fetcher.data) return;

		if (!fetcher.data.success) {
			toast.error(fetcher.data.message);
		}
	}, [isSubmitting, fetcher.data]);

	return (
		<Button
			variant="secondary"
			className="text-red-500"
			onClick={() => {
				fetcher.submit(
					{
						boardId,
					},
					{
						method: "POST",
						action: ROUTE,
					},
				);
			}}
		>
			<Trash2Icon size={16} />
		</Button>
	);
}
