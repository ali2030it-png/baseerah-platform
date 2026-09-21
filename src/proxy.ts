import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return redirectTo(request, "/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    return redirectTo(request, "/account-status");
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardHome = pathname === "/dashboard";

  if (isAdminPath && profile.role !== "super_admin") {
    return redirectTo(request, "/dashboard");
  }

  if (isDashboardHome && profile.role === "super_admin") {
    return redirectTo(request, "/admin");
  }

  return response;
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/reports/:path*",
    "/templates/:path*",
  ],
};
