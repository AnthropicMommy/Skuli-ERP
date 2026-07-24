import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login",
  "/invite(.*)",
  "/portal(.*)",
  "/student-login(.*)",
  "/student(.*)",
  "/onboarding",
  "/api/schools(.*)",
  "/api/auth(.*)",
  "/api/parent(.*)",
  "/api/staff/invite(.*)",
  "/api/classes(.*)",
  "/api/enrollments(.*)",
  "/api/claim-class(.*)",
  "/api/mwalimu(.*)",
  "/report(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
