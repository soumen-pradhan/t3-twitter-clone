import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

import Image from "next/image";

const ProfilePage = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    // const router = useRouter();

    // let username = router.query.slug;
    // if (typeof username !== "string") {
    //     throw new Error("No slug");
    // }

    // username = username.replace("@", "");

    const { username } = props;

    const { data, isLoading } = api.profile.getUserByUserName.useQuery({
        username
    });

    if (isLoading) return <LoadingPage />;
    if (!data) return <div>404</div>;

    return (
        <>
            <Head>
                <title>Profile</title>
            </Head>
            <Layout>
                <div className="relative h-48 bg-slate-600 mb-14">
                    <Image
                        className="h-28 w-auto rounded-full absolute bottom-0 left-0 -mb-14 ml-6 border-4 border-teal-900"
                        src={data.profileImageUrl}
                        alt={`${data.username}'s profile image`}
                        width={40}
                        height={40}
                    />
                </div>
                <div className="p-4 pt-2 text-xl">@{data.username ?? ""}</div>

                <div className="border-b border-slate-400 w-full"></div>
            </Layout>
        </>
    );
};

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

export const getServerSideProps = async (
    context: GetServerSidePropsContext<{ slug: string }>
) => {

    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: superjson,
    });

    const slug = context.params?.slug;
    console.log(slug);
    if (typeof slug !== "string") {
        throw new Error("No slug");
    }

    const username = slug.replace("@", "");

    await helpers.profile.getUserByUserName.prefetch({ username });
    return {
        props: {
            trpcState: helpers.dehydrate(),
            username
        }
    }
}


export default ProfilePage;
