import React, { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { ArrowBigUp, ArrowBigDown, Hourglass } from "lucide-react";

interface PostVoteCountProps {
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
}

const PostVoteCount: React.FC<PostVoteCountProps> = ({
	upVotes,
	downVotes,
	expiresInDays,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="neutral" className="w-full">
					<p>{upVotes - downVotes}</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex gap-1 items-center">
					<ArrowBigUp /> {upVotes}
				</div>
				<div className="flex gap-1 items-center">
					<ArrowBigDown /> {downVotes}
				</div>
				<div className="flex gap-1 items-center [&_svg]:p-1">
					<Hourglass /> {expiresInDays} day{expiresInDays === 1 ? "" : "s"}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PostVoteCount;
