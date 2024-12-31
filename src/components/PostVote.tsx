import React from 'react';
import { Button } from "./ui/button";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import PostVoteCount from "./PostVoteCount";

interface PostVoteProps {
  postId: string;
  upVotes: number;
  downVotes: number;
  expiresInDays: number;
  votedPosts: { [postId: string]: "up" | "down" | null };
  handleUpvote: (postId: string) => void;
  handleDownvote: (postId: string) => void;
}

const PostVote: React.FC<PostVoteProps> = ({
  postId,
  upVotes,
  downVotes,
  expiresInDays,
  votedPosts,
  handleUpvote,
  handleDownvote,
}) => {
  return (
    <div className="flex w-auto flex-col items-center">
      <PostVoteCount upVotes={upVotes} downVotes={downVotes} expiresInDays={expiresInDays} />
      <div className="flex gap-2 mt-2">
        <Button
          variant={votedPosts[postId] === "up" ? "default" : "neutral"}
          onClick={() => handleUpvote(postId)}
          size={"icon"}
        >
          <ArrowBigUp />
        </Button>
        <Button
          variant={votedPosts[postId] === "down" ? "default" : "neutral"}
          onClick={() => handleDownvote(postId)}
          size={"icon"}
        >
          <ArrowBigDown />
        </Button>
      </div>
    </div>
  );
};

export default PostVote;
