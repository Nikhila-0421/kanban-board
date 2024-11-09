import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@medusajs/ui";
import { PlusIcon } from "lucide-react";
import * as React from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSubmit } from "react-router";
import type { Column, Id, Task } from "~/types";
import { useProject } from "~/utils";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";

function KanbanBoard() {
	// @ts-expect-error
	const { data, project } = useProject();

	const [columns, setColumns] = useState<Column[]>(data.cols);
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

	const [tasks, setTasks] = useState<Task[]>(data.tasks);

	const [activeColumn, setActiveColumn] = useState<Column | null>(null);
	const [activeTask, setActiveTask] = useState<Task | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	);

	const submit = useSubmit();

	React.useEffect(() => {
		submit(
			{
				projectId: project.id,
				data: JSON.stringify({
					cols: columns,
					tasks,
				}),
			},
			{
				method: "POST",
			},
		);
	}, [columns, submit, project.id, tasks]);

	return (
		<div className="text-black flex w-full items-center overflow-y-hidden overflow-x-scroll px-[40px]">
			<DndContext
				sensors={sensors}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onDragOver={onDragOver}
			>
				<div className="flex gap-4">
					<div className="flex gap-4">
						<SortableContext items={columnsId}>
							{columns.map((col) => (
								<ColumnContainer
									key={col.id}
									column={col}
									deleteColumn={deleteColumn}
									updateColumn={updateColumn}
									createTask={createTask}
									deleteTask={deleteTask}
									updateTask={updateTask}
									tasks={tasks.filter((task) => task.columnId === col.id)}
								/>
							))}
						</SortableContext>
					</div>

					<Button
						// variant="default"
						onClick={() => createNewColumn()}
						className="w-max"
					>
						<PlusIcon />
						Add Column
					</Button>
				</div>

				{createPortal(
					<DragOverlay>
						{activeColumn ? (
							<ColumnContainer
								column={activeColumn}
								deleteColumn={deleteColumn}
								updateColumn={updateColumn}
								createTask={createTask}
								deleteTask={deleteTask}
								updateTask={updateTask}
								tasks={tasks.filter(
									(task) => task.columnId === activeColumn.id,
								)}
							/>
						) : null}
						{activeTask ? (
							<TaskCard
								task={activeTask}
								deleteTask={deleteTask}
								updateTask={updateTask}
							/>
						) : null}
					</DragOverlay>,
					document.body,
				)}
			</DndContext>
		</div>
	);

	function createTask(columnId: Id) {
		const newTask: Task = {
			id: generateId(),
			columnId,
			content: `Task ${tasks.length + 1}`,
		};

		setTasks([...tasks, newTask]);
	}

	function deleteTask(id: Id) {
		const newTasks = tasks.filter((task) => task.id !== id);
		setTasks(newTasks);
	}

	function updateTask(id: Id, content: string) {
		const newTasks = tasks.map((task) => {
			if (task.id !== id) return task;
			return { ...task, content };
		});

		setTasks(newTasks);
	}

	function createNewColumn() {
		const columnToAdd: Column = {
			id: generateId(),
			title: `Column ${columns.length + 1}`,
		};

		setColumns([...columns, columnToAdd]);
	}

	function deleteColumn(id: Id) {
		const filteredColumns = columns.filter((col) => col.id !== id);
		setColumns(filteredColumns);

		const newTasks = tasks.filter((t) => t.columnId !== id);
		setTasks(newTasks);
	}

	function updateColumn(id: Id, title: string) {
		const newColumns = columns.map((col) => {
			if (col.id !== id) return col;
			return { ...col, title };
		});

		setColumns(newColumns);
	}

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === "Column") {
			setActiveColumn(event.active.data.current.column);
			return;
		}

		if (event.active.data.current?.type === "Task") {
			setActiveTask(event.active.data.current.task);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveAColumn = active.data.current?.type === "Column";
		if (!isActiveAColumn) return;

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

			const overColumnIndex = columns.findIndex((col) => col.id === overId);

			return arrayMove(columns, activeColumnIndex, overColumnIndex);
		});
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const isActiveATask = active.data.current?.type === "Task";
		const isOverATask = over.data.current?.type === "Task";

		if (!isActiveATask) return;

		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);
				const overIndex = tasks.findIndex((t) => t.id === overId);

				if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
					tasks[activeIndex].columnId = tasks[overIndex].columnId;
					return arrayMove(tasks, activeIndex, overIndex - 1);
				}

				return arrayMove(tasks, activeIndex, overIndex);
			});
		}

		const isOverAColumn = over.data.current?.type === "Column";

		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId);

				tasks[activeIndex].columnId = overId;
				return arrayMove(tasks, activeIndex, activeIndex);
			});
		}
	}
}

function generateId() {
	return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
