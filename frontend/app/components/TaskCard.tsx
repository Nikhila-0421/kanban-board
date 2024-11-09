import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePrompt } from "@medusajs/ui";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { Id, Task } from "~/types";
import { cn } from "~/utils";

interface Props {
	task: Task;
	deleteTask: (id: Id) => void;
	updateTask: (id: Id, content: string) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
	const prompt = usePrompt();
	const [mouseIsOver, setMouseIsOver] = useState(false);
	const [editMode, setEditMode] = useState(true);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: "Task",
			task,
		},
		disabled: editMode,
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const toggleEditMode = () => {
		setEditMode((prev) => !prev);
		setMouseIsOver(false);
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="opacity-30 p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-blue-500/50 bg-white/50 backdrop-blur-sm cursor-grab relative"
			/>
		);
	}

	return (
		<div
			{...attributes}
			{...listeners}
			ref={setNodeRef}
			style={style}
			onClick={editMode ? () => {} : toggleEditMode}
			className={cn(
				"group p-3 min-h-[100px] items-center flex text-left relative gap-3 bg-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 shadow-sm hover:shadow-md transition-all duration-200",
				editMode ? "cursor-text" : "cursor-grab",
			)}
			onMouseEnter={() => setMouseIsOver(true)}
			onMouseLeave={() => setMouseIsOver(false)}
		>
			<Button
				{...attributes}
				{...listeners}
				size="icon"
				variant="ghost"
				className="cursor-grab hover:bg-slate-100/80 transition-colors h-8 w-8"
			>
				<GripVerticalIcon size={16} className="text-slate-500" />
			</Button>

			<Textarea
				value={task.content}
				readOnly={!editMode}
				autoFocus={editMode}
				placeholder="Task content here"
				onBlur={toggleEditMode}
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.shiftKey) {
						toggleEditMode();
					}
				}}
				onChange={(e) => updateTask(task.id, e.target.value)}
				className="resize-none border-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-slate-50/50 transition-colors text-slate-600"
			/>

			{mouseIsOver && !editMode ? (
				<Button
					variant="ghost"
					size="icon"
					onClick={async (e) => {
						e.stopPropagation();

						const confirmed = await prompt({
							title: "Delete task",
							description: "Are you sure you want to delete this task?",
						});

						if (confirmed) deleteTask(task.id);
					}}
					className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
				>
					<Trash2Icon size={16} />
				</Button>
			) : null}
		</div>
	);
}

export default TaskCard;
