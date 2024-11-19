import { useEffect, useRef } from "react";
import type { MetaFunction } from "react-router";
import { Form, Link, data, redirect, useSearchParams } from "react-router";
import { userApi } from "~/models/api.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";
import type { Route } from "./+types/login";

export const loader = async ({ request }: Route.LoaderArgs) => {
	const userId = await getUserId(request);
	if (userId) {
		return redirect("/");
	}

	return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const email = formData.get("email");
	const password = formData.get("password");
	const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
	const remember = formData.get("remember");

	if (!validateEmail(email)) {
		return data(
			{ errors: { email: "Email is invalid", password: null } },
			{ status: 400 },
		);
	}

	if (typeof password !== "string" || password.length === 0) {
		return data(
			{ errors: { email: null, password: "Password is required" } },
			{ status: 400 },
		);
	}

	if (password.length < 8) {
		return data(
			{ errors: { email: null, password: "Password is too short" } },
			{ status: 400 },
		);
	}

	const { data: user, error } = await userApi.login({ email, password });

	if (error || !user) {
		return data(
			{ errors: { email: "Invalid email or password", password: null } },
			{ status: 400 },
		);
	}

	const response = await createUserSession({
		redirectTo,
		remember: remember === "on",
		request,
		userId: user.id,
	});

	if (!response) {
		return data(
			{ errors: { email: "Invalid email or password", password: null } },
			{ status: 400 },
		);
	}

	throw response;
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage({ actionData }: Route.ComponentProps) {
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/";
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (actionData?.errors?.email) {
			emailRef.current?.focus();
		} else if (actionData?.errors?.password) {
			passwordRef.current?.focus();
		}
	}, [actionData]);

	return (
		<div className="bg-blue-400 h-screen w-screen">
			<div className="flex flex-col items-center flex-1 h-full justify-center px-4 sm:px-0">
				<div
					className="flex rounded-lg shadow-lg w-full sm:w-3/4 lg:w-1/2 bg-white sm:mx-0"
					style={{ height: "500px" }}
				>
					<div className="flex flex-col w-full md:w-1/2 p-4">
						<div className="flex flex-col flex-1 justify-center mb-8">
							<h1 className="text-4xl text-center font-thin">Welcome Back</h1>
							<div className="w-full mt-4">
								<Form
									className="form-horizontal w-3/4 mx-auto"
									method="POST"
									action="#"
								>
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700"
										>
											Email address
										</label>
										<div className="mt-1">
											<input
												ref={emailRef}
												id="email"
												required
												name="email"
												type="email"
												autoComplete="email"
												aria-invalid={
													actionData?.errors?.email ? true : undefined
												}
												aria-describedby="email-error"
												className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
											/>
											{actionData?.errors?.email ? (
												<div className="pt-1 text-red-700" id="email-error">
													{actionData.errors.email}
												</div>
											) : null}
										</div>
									</div>

									<div className="mt-4">
										<label
											htmlFor="password"
											className="block text-sm font-medium text-gray-700"
										>
											Password
										</label>
										<div className="mt-1">
											<input
												id="password"
												ref={passwordRef}
												name="password"
												type="password"
												autoComplete="current-password"
												aria-invalid={
													actionData?.errors?.password ? true : undefined
												}
												aria-describedby="password-error"
												className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
											/>
											{actionData?.errors?.password ? (
												<div className="pt-1 text-red-700" id="password-error">
													{actionData.errors.password}
												</div>
											) : null}
										</div>
									</div>

									<input type="hidden" name="redirectTo" value={redirectTo} />
									<div className="flex flex-col mt-8">
										<button
											type="submit"
											className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded"
										>
											Login
										</button>
									</div>
								</Form>
								<div className="text-center mt-4">
									<Link
										className="underline text-blue-dark text-base"
										to="/join"
									>
										Register
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div
						className="hidden md:block md:w-1/2 rounded-r-lg"
						style={{
							background:
								"url('https://images.unsplash.com/photo-1518976024611-28bf4b48222e?q=80&w=2785&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
							backgroundSize: "cover",
							backgroundPosition: "center center",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
