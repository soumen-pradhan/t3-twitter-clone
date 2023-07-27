import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import { Layout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { serverHelper } from "~/server/helpers";
import { api } from "~/utils/api";

const SinglePostPage = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    const { id } = props;

    const { data, isLoading } = api.posts.getById
        .useQuery({ id });

    if (isLoading) return <LoadingPage />;
    if (!data) return <div>404</div>;

    return (
        <>
            <Head>
                <title>{`${data.post.content} @${data.author.username}`}</title>
            </Head>
            <Layout>
                <PostView {...data} />
            </Layout>
        </>
    );
};

export const getServerSideProps = async (
    context: GetServerSidePropsContext<{ id: string }>
) => {

    const helpers = serverHelper();

    const id = context.params?.id;
    if (typeof id !== "string") {
        throw new Error("No slug");
    }

    console.log(id);

    await helpers.posts.getById.prefetch({ id });
    return {
        props: {
            trpcState: helpers.dehydrate(),
            id
        }
    }
}

export default SinglePostPage;
