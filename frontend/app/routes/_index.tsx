import { redirect } from "react-router";
import { getUser } from "~/session.server";
import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => [{ title: "TaskTracker" }];

export async function loader({ request }: Route.LoaderArgs) {
	const user = await getUser(request);

	if (!user) {
		return redirect("/login");
	}

	return redirect("/dashboard");
}
