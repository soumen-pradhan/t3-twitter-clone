import { User } from "@clerk/nextjs/server";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "./api/root";
import { prisma } from "./db";
import superjson from "superjson";

export const filterUserForClient = (user: User) => ({
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl
});

export const serverHelper = () => createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
});
