import { auth, clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers";

const addUserDataToPosts = async (posts: Post[]) => {
  const userId = posts.map(p => p.authorId);

  const users = (await clerkClient.users.getUserList({
    userId: userId,
    limit: 100
  }))
    .map(filterUserForClient);

  return posts.map(post => {
    const author = users.find(u => u.id === post.authorId);

    if (!author) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`
      });
    }

    return {
      post,
      author: { ...author, username: author.username ?? "(no username)" }
    };
  });
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.post
        .findMany({
          take: 100,
          orderBy: [{ createdAt: "desc" }]
        });

      return addUserDataToPosts(posts);
    }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post
        .findMany({
          where: { authorId: input.userId },
          take: 100,
          orderBy: [{ createdAt: "desc" }]
        })
        .then(addUserDataToPosts)
    }),

  create: privateProcedure
    .input(z.object({
      content: z.string().emoji("Only Emojis allowed").min(1).max(255)
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          authorId: ctx.userId,
          content: input.content
        }
      });

      return post;
    })
});
