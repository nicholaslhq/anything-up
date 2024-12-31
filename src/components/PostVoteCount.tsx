import React from 'react';
import { Card, CardContent } from "./ui/card";

interface PostVoteCountProps {
  votes: number;
}

const PostVoteCount: React.FC<PostVoteCountProps> = ({ votes }) => {
  return (
    <Card className="w-full text-center">
      <CardContent>
        <p>{votes}</p>
      </CardContent>
    </Card>
  );
};

export default PostVoteCount;
