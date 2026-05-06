export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/library/:path*",
    "/media/:path*",
    "/global-variables/:path*",
    "/block-visual-templates/:path*",
    "/templates/:path*",
    "/visual-templates/:path*",
    "/proposals/:path*",
  ],
};
