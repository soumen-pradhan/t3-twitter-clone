import { RouterOutputs } from "~/utils/api";

import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
    const { post, author } = props;

    return (
        <div className="flex gap-3 p-4 border-b border-slate-400" key={post.id}>
            <Image
                className="h-10 rounded-full"
                src={author.profileImageUrl}
                alt={`${author.username}'s profile picture`}
                width={40}
                height={40}
            />
            <div className="flex flex-col gap-2">
                <div>
                    <Link href={`/@${author.username}`}>
                        <span className="text-sm">{`@${author.username}`}</span>
                    </Link>
                    <Link href={`/post/${post.id}`}>
                        {" · "}
                        <span className="text-sm">
                            {dayjs(post.createdAt).format("YYYY-MM-DD · HH:MM")}
                        </span>
                    </Link>
                </div>
                <span className="text-xl">{post.content}</span>
            </div>
        </div>
    );
};
