import { NavLink, Outlet } from "react-router";
import { UserNav } from "~/components/user-nav";
import { getProjectsByUser } from "~/models/board.server";
import { requireUser } from "~/session.server";
import { cn } from "~/utils";
import type { Route } from "./+types/dashboard";

export type DashboardLoaderData = typeof loader;
export const loader = async ({ request }: Route.LoaderArgs) => {
	const user = await requireUser(request);

	const userProjects = await getProjectsByUser(user.id);

	return {
		userProjects,
	};
};

export default function ProjectDashboard() {
	return (
		<>
			<div className="flex flex-col h-full overflow-hidden">
				<div className="hidden flex-col md:flex bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50">
					<div className="border-b border-slate-200/50 shadow-sm backdrop-blur-sm">
						<div className="flex h-16 items-center justify-between px-4">
							<h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 cursor-default animate-gradient bg-300% tracking-tight">
								TaskManager
							</h1>

							<div className="w-full flex items-center justify-center">
								<NavLink
									to="/dashboard"
									className={({ isActive }) =>
										isActive
											? "hidden"
											: cn(
													"flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
													"text-slate-700 hover:bg-slate-100/50",
												)
									}
									end
								>
									<span>Dashboard</span>
								</NavLink>
							</div>

							<div className="ml-auto flex items-center space-x-4">
								<UserNav />
							</div>
						</div>
					</div>
				</div>

				<div className="hidden md:block h-full">
					<div className="grid lg:grid-cols-4 bg-background border-t h-full">
						<div className="col-span-3 lg:col-span-4 lg:border-l relative overflow-auto">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
