import { SignInButton, SignOutButton, auth, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import dayjs from "dayjs";

import { RouterOutputs, api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.posts.getAll.invalidate();
    },
    onError: (err) => {
      const errMsg = err.data?.zodError?.fieldErrors.content?.join(".")
        ?? "Failed to Post. Try Again.";
      toast.error(errMsg);
    }
  });

  return (
    <div className="flex gap-3 w-full">
      <Image
        className="h-10 rounded-full"
        src={user.profileImageUrl}
        alt={`${user.username}'s Profile Image`}
        width={40}
        height={40}
      />
      <input
        className="bg-transparent grow outline-none"
        placeholder="Type some reactions"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input.length > 0) {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input.length > 0 && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <LoadingSpinner />
      )}
    </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="flex gap-3 p-4 border-b border-slate-400">
      <Image
        className="h-10 rounded-full"
        src={author.profileImageUrl}
        alt={`${author.username}'s profile picture`}
        width={40}
        height={40}
      />
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-sm">{`@${author.username}`}</span>
          {" · "}
          <span className="text-sm">
            {dayjs(post.createdAt).format("YYYY-MM-DD · HH:MM")}
          </span>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: feedLoading } = api.posts.getAll.useQuery();

  if (feedLoading) return <LoadingPage />;
  if (!data) return <div>No data found</div>;

  return (
    <div className="flex flex-col">
      {data?.map(fullPost => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // start fetch early to cache
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="md:max-w-2xl w-full border-x border-slate-400 h-screen">

          <div className="border-b border-slate-400 p-4 flex">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
}
