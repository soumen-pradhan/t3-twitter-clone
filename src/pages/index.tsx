import { SignInButton, SignOutButton, auth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { Layout } from "~/components/layout";
import { PostView } from "~/components/postview"

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
      <Layout>

        <div className="border-b border-slate-400 p-4 flex">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />

      </Layout>
    </>
  );
}
