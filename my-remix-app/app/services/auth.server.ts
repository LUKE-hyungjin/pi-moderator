import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [process.env.SESSION_SECRET || "s3cr3t"],
        secure: process.env.NODE_ENV === "production",
    },
});

export const getSession = (request: Request) => {
    return sessionStorage.getSession(request.headers.get("Cookie"));
};

export async function requireAuth(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");

    if (!userId) {
        throw redirect("/login");
    }

    return userId;
}

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await sessionStorage.getSession();
    session.set("userId", userId);

    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
} 