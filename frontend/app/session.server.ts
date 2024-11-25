import { createCookieSessionStorage, redirect } from "react-router";
import invariant from "tiny-invariant";
import { type User, getUserById } from "~/models/user.server";
import { userApi } from "./models/api.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === "production",
	},
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
	const cookie = request.headers.get("Cookie");
	return sessionStorage.getSession(cookie);
}

export async function getUserId(
	request: Request,
): Promise<User["id"] | undefined> {
	const session = await getSession(request);
	const userId = session.get(USER_SESSION_KEY);
	return userId;
}

export async function getUser(request: Request) {
	const userId = await getUserId(request);
	if (userId === undefined) {
		return null;
	}

	const user = await getUserById(userId);
	if (!user) {
		throw await logout(request);
	}

	return user;
}

export async function requireUser(
	request: Request,
	redirectTo: string = new URL(request.url).pathname,
) {
	const userId = await getUserId(request);
	if (!userId) {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}

	const { data: user, error } = await userApi.getById(userId);
	if (error || !user) {
		throw await logout(request);
	}

	return user;
}

export async function createUserSession({
	request,
	userId,
	remember,
	redirectTo,
}: {
	request: Request;
	userId: string;
	remember: boolean;
	redirectTo: string;
}) {
	const session = await getSession(request);
	session.set(USER_SESSION_KEY, userId);

	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await sessionStorage.commitSession(session, {
				maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
			}),
		},
	});
}

export async function logout(request: Request) {
	const session = await getSession(request);
	return redirect("/", {
		headers: {
			"Set-Cookie": await sessionStorage.destroySession(session),
		},
	});
}
