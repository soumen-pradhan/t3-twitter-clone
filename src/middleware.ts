import { withClerkMiddleware } from "@clerk/nextjs";
import { WithClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default withClerkMiddleware(() => NextResponse.next());

// Stop MIddleware running on static
export const config = {
    matcher: "/((?!_next/image|_next/static|favicon.ico).*)"
};
