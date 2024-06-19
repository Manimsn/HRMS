import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

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

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const handleRedirect = (pathname: string) => {
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

  const handleProtectedRoute = async () => {
    if (!token) return handleRedirect("/");

    try {
      const user = await verifyToken(token);
      if (user.role !== "admin") return handleRedirect("/restricted");
      // Set user role in cookies
      const response = NextResponse.next();
      return setCookieAndReturnResponse(response, "userRole", user.role, {
        path: "/",
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (!refreshToken) return handleRedirect("/");

        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          // request.cookies.set("accessToken", newAccessToken);
          const user = await verifyToken(newAccessToken);
          if (user.role !== "admin") return handleRedirect("/restricted");
          const response = NextResponse.next();
          response.cookies.set("accessToken", newAccessToken, { path: "/" });
          return setCookieAndReturnResponse(response, "userRole", user.role, {
            path: "/",
          });
        } catch {
          return handleRedirect("/");
        }
      } else {
        return handleRedirect("/");
      }
    }
  };

  const handleLoggedInRoute = async () => {
    if (!token) return handleRedirect("/");

    try {
      const { role } = await verifyToken(token);
      console.log("handleLoggedInRoute try", role);
      const response = NextResponse.next();
      return setCookieAndReturnResponse(response, "userRole", role, {
        path: "/",
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (!refreshToken) return handleRedirect("/");

        try {
          const newAccessToken = await refreshAccessToken(refreshToken);
          // request.cookies.set("accessToken", newAccessToken);
          const user = await verifyToken(newAccessToken);
          console.log("handleLoggedInRoute catch try", user);
          // request.cookies.set("userRole", user.role); // Set user role in cookies
          const response = NextResponse.next();
          response.cookies.set("accessToken", newAccessToken, { path: "/" });
          return setCookieAndReturnResponse(response, "userRole", user.role, {
            path: "/",
          });
        } catch {
          return handleRedirect("/");
        }
      } else {
        return handleRedirect("/");
      }
    }
  };

  if (protectedRoutes.includes(url.pathname)) {
    return await handleProtectedRoute();
  }

  if (loggedInRoutes.includes(url.pathname)) {
    return await handleLoggedInRoute();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...loggedInRoutes],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import axios from "axios";

// const protectedRoutes = [
//   "/employee-list",
//   "/add-leave",
//   "/leave-report",
//   "/reimbursement",
// ];

// const loggedInRoutes = ["/dashboard"];

// export async function middleware(request: NextRequest) {
//   const url = request.nextUrl.clone();

//   if (protectedRoutes.includes(url.pathname)) {
//     console.log("protectedRoutes", protectedRoutes.includes(url.pathname));
//     const token = request.cookies.get("accessToken")?.value;

//     if (!token) {
//       console.log("No token");
//       url.pathname = "/";
//       return NextResponse.redirect(url);
//     }

//     try {
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/protected`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const { user } = response.data;
//       console.log("protectedRoutes", user);
//       if (user.role !== "admin") {
//         url.pathname = "/restricted";
//         return NextResponse.redirect(url);
//       }
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         try {
//           const refreshToken = request.cookies.get("refreshToken")?.value;
//           if (!refreshToken) {
//             url.pathname = "/";
//             return NextResponse.redirect(url);
//           }

//           const refreshResponse = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/api/refresh-token`,
//             {
//               refreshToken,
//             }
//           );

//           const newAccessToken = refreshResponse.data.accessToken;
//           request.cookies.set("accessToken", newAccessToken);

//           const userResponse = await axios.get(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/api/protected`,
//             {
//               headers: {
//                 Authorization: `Bearer ${newAccessToken}`,
//               },
//             }
//           );

//           const user = userResponse.data;

//           if (user.role !== "admin") {
//             url.pathname = "/restricted";
//             return NextResponse.redirect(url);
//           }

//           return NextResponse.next();
//         } catch (refreshError) {
//           url.pathname = "/";
//           return NextResponse.redirect(url);
//         }
//       } else {
//         url.pathname = "/";
//         return NextResponse.redirect(url);
//       }
//     }
//   }

//   if (loggedInRoutes.includes(url.pathname)) {
//     const token = request.cookies.get("accessToken")?.value;

//     if (!token) {
//       console.log("No token");
//       url.pathname = "/";
//       return NextResponse.redirect(url);
//     }

//     try {
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/protected`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         try {
//           const refreshToken = request.cookies.get("refreshToken")?.value;
//           if (!refreshToken) {
//             url.pathname = "/";
//             return NextResponse.redirect(url);
//           }

//           const refreshResponse = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/api/refresh-token`,
//             {
//               refreshToken,
//             }
//           );

//           const newAccessToken = refreshResponse.data.accessToken;
//           request.cookies.set("accessToken", newAccessToken);

//           const userResponse = await axios.get(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/api/protected`,
//             {
//               headers: {
//                 Authorization: `Bearer ${newAccessToken}`,
//               },
//             }
//           );

//           const user = userResponse.data;

//           if (user.role !== "admin") {
//             url.pathname = "/restricted";
//             return NextResponse.redirect(url);
//           }

//           return NextResponse.next();
//         } catch (refreshError) {
//           url.pathname = "/";
//           return NextResponse.redirect(url);
//         }
//       } else {
//         url.pathname = "/";
//         return NextResponse.redirect(url);
//       }
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [...protectedRoutes],
// };
