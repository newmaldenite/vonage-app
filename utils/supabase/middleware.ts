import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session: initialSession } } = await supabase.auth
    .getSession();

  // Skip refresh if no session exists
  if (!initialSession) return NextResponse.next();

  // Refresh the session if needed
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data.session) {
    // Handle token refresh failure (e.g., redirect to sign-in)
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Update the session in cookies
  const response = NextResponse.next();
  response.cookies.set("token", data.session.access_token, {
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return response;
}

// export const updateSession = async (request: NextRequest) => {
//   // This `try/catch` block is only here for the interactive tutorial.
//   // Feel free to remove once you have Supabase connected.
//   try {
//     // Create an unmodified response
//     let response = NextResponse.next({
//       request: {
//         headers: request.headers,
//       },
//     });

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return request.cookies.getAll();
//           },
//           setAll(cookiesToSet) {
//             cookiesToSet.forEach(({ name, value }) =>
//               request.cookies.set(name, value),
//             );
//             response = NextResponse.next({
//               request,
//             });
//             cookiesToSet.forEach(({ name, value, options }) =>
//               response.cookies.set(name, value, options),
//             );
//           },
//         },
//       },
//     );

//     // This will refresh session if expired - required for Server Components
//     // https://supabase.com/docs/guides/auth/server-side/nextjs
//     const user = await supabase.auth.getUser();

//     // protected routes
//     if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
//       return NextResponse.redirect(new URL("/sign-in", request.url));
//     }

//     if (request.nextUrl.pathname === "/" && !user.error) {
//       return NextResponse.redirect(new URL("/protected", request.url));
//     }

//     return response;
//   } catch (e) {
//     // If you are here, a Supabase client could not be created!
//     // This is likely because you have not set up environment variables.
//     // Check out http://localhost:3000 for Next Steps.
//     return NextResponse.next({
//       request: {
//         headers: request.headers,
//       },
//     });
//   }
// };
