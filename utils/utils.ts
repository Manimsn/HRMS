// export function getCookie(name: string) {
//   const cookies = document.cookie.split("; ");
//   for (const cookie of cookies) {
//     const [cookieName, cookieValue] = cookie.split("=");
//     if (cookieName === name) {
//       return cookieValue;
//     }
//   }
//   return null;
// }

export function getCookie(name: string, cookies: string | undefined) {
  if (typeof document !== "undefined") {
    // Client-side
    cookies = document.cookie;
  }

  if (!cookies) {
    return null;
  }

  const cookieArr = cookies.split("; ");
  for (const cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export function parseStringFilters(queryParams: URLSearchParams): any {
  const filter: any = {};
  queryParams.forEach((value, key) => {
    if (
      key !== "type" &&
      key !== "page" &&
      key !== "limit" &&
      value.trim() !== ""
    ) {
      // This checks that the value is not just empty spaces
      filter[key] = {
        contains: value,
        mode: "insensitive", // Case-insensitive partial match
      };
    }
  });
  return filter;
}
