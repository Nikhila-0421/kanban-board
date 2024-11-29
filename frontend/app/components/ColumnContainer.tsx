import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, usePrompt } from "@medusajs/ui";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import type { Column, Id, Task } from "~/types";
import { cn } from "~/utils";

import TaskCard from "./TaskCard";

interface Props {
	column: Column;
	deleteColumn: (id: Id) => void;
	updateColumn: (id: Id, title: string) => void;

	createTask: (columnId: Id) => void;
	updateTask: (id: Id, content: string) => void;
	deleteTask: (id: Id) => void;
	tasks: Task[];
}

function ColumnContainer({
	column,
	deleteColumn,
	updateColumn,
	createTask,
	tasks,
	deleteTask,
	updateTask,
}: Props) {
	const [editMode, setEditMode] = useState(false);
	const prompt = usePrompt();

	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		},
		disabled: editMode,
	});

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="opacity-40 border-2 border-blue-500/50 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col bg-white/50 backdrop-blur-sm shadow-lg"
			/>
		);
	}

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className="w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200"
		>
			<CardHeader
				className="grid grid-cols-[1fr_40px] items-center px-4 py-3"
				onClick={() => {
					setEditMode(true);
				}}
			>
				<CardTitle className="flex items-center gap-2">
					<Button
						{...attributes}
						{...listeners}
						size="base"
						variant="transparent"
						className="cursor-grab hover:bg-slate-100/80 transition-colors size-8 shrink-0 w-max"
					>
						<GripVerticalIcon className="text-slate-500" size={16} />
					</Button>

					<Input
						size={40}
						className={cn(
							"text-lg font-medium text-slate-700 leading-none tracking-tight bg-transparent",
							!editMode &&
								"outline-none border-transparent focus:outline-none hover:bg-slate-100/50",
							editMode && "border-slate-200 focus:border-slate-300",
						)}
						value={column.title}
						onChange={(e) => updateColumn(column.id, e.target.value)}
						autoFocus
						readOnly={!editMode}
						onBlur={() => setEditMode(false)}
						onKeyDown={(e) => {
							if (e.key !== "Enter") {
								return;
							}

							setEditMode(false);
						}}
					/>
				</CardTitle>

				<Button
					variant="transparent"
					onClick={async () => {
						const confirmed = await prompt({
							title: "Delete column",
							description: "Are you sure you want to delete this column?",
						});

						if (confirmed) {
							deleteColumn(column.id);
						}
					}}
					size="base"
					className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors size-8 shrink-0 w-max"
				>
					<Trash2Icon size={16} />
				</Button>
			</CardHeader>

			<CardContent className="flex flex-grow flex-col gap-4 overflow-x-hidden px-3">
				<Separator className="bg-slate-200/70" />

				<div className="overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
					<SortableContext items={tasksIds}>
						{tasks.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						))}
					</SortableContext>
				</div>

				<Separator className="bg-slate-200/70" />

				<Button
					variant="secondary"
					onClick={() => {
						createTask(column.id);
					}}
					className="bg-slate-100 hover:bg-slate-200 text-slate-600 gap-2 transition-colors"
				>
					<PlusIcon className="w-4 h-4" />
					Add task
				</Button>
			</CardContent>
		</Card>
	);
}

export default ColumnContainer;
