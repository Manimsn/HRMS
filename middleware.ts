import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";
import { getCookie } from "./utils/utils"; // Adjust the import according to your project structure

const protectedRoutes = [
  "/employee-list",
  "/add-leave",
  "/leave-report",
  "/reimbursement",
];

const loggedInRoutes = ["/dashboard"];

const verifyToken = async (token: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/protected`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.user;
};

const refreshAccessToken = async (refreshToken: string) => {
  const refreshResponse = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/refresh-token`,
    {
      refreshToken,
    }
  );
  return refreshResponse.data.accessToken;
};

const handleRedirect = (url: URL, pathname: string) => {
  url.pathname = pathname;
  return NextResponse.redirect(url);
};

const setCookieAndReturnResponse = (
  response: NextResponse,
  key: string,
  value: string,
  options: any
) => {
  response.cookies.set(key, value, options);
  return response;
};

const handleProtectedRoute = async (
  url: URL,
  token: string | null,
  refreshToken: string | null
) => {
  if (!token) return handleRedirect(url, "/");

  try {
    const user = await verifyToken(token);
    if (user.role !== "admin") return handleRedirect(url, "/restricted");

    const response = NextResponse.next();
    return setCookieAndReturnResponse(response, "userRole", user.role, {
      path: "/",
    });
  } catch (error: any) {
    if (error.response?.status === 401 && refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        const user = await verifyToken(newAccessToken);
        if (user.role !== "admin") return handleRedirect(url, "/restricted");

        const response = NextResponse.next();
        response.cookies.set("accessToken", newAccessToken, { path: "/" });
        return setCookieAndReturnResponse(response, "userRole", user.role, {
          path: "/",
        });
      } catch {
        return handleRedirect(url, "/");
      }
    }
    return handleRedirect(url, "/");
  }
};

const handleLoggedInRoute = async (
  url: URL,
  token: string | null,
  refreshToken: string | null
) => {
  if (!token) return handleRedirect(url, "/");

  try {
    const { role } = await verifyToken(token);
    const response = NextResponse.next();
    return setCookieAndReturnResponse(response, "userRole", role, {
      path: "/",
    });
  } catch (error: any) {
    if (error.response?.status === 401 && refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        const user = await verifyToken(newAccessToken);

        const response = NextResponse.next();
        response.cookies.set("accessToken", newAccessToken, { path: "/" });
        return setCookieAndReturnResponse(response, "userRole", user.role, {
          path: "/",
        });
      } catch {
        return handleRedirect(url, "/");
      }
    }
    return handleRedirect(url, "/");
  }
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const cookies = request.headers.get("cookie") || "";
  const token = getCookie("accessToken", cookies);
  const refreshToken = getCookie("refreshToken", cookies);

  if (protectedRoutes.includes(url.pathname)) {
    return await handleProtectedRoute(url, token, refreshToken);
  }

  if (loggedInRoutes.includes(url.pathname)) {
    return await handleLoggedInRoute(url, token, refreshToken);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...loggedInRoutes],
};
