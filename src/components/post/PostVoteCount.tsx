import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { ArrowBigUp, ArrowBigDown, Hourglass } from "lucide-react";

interface PostVoteCountProps {
	upVotes: number;
	downVotes: number;
	expiresInDays: number;
}

const formatCount = (count: number): string => {
	const sign = count < 0 ? "-" : "";
	const absoluteCount = Math.abs(count);
	if (absoluteCount >= 1000) {
		const value = absoluteCount / 1000;
		const integerPart = Math.floor(value);
		if (integerPart >= 10) {
			return sign + integerPart + "k";
		}
		return sign + Math.floor(value * 10) / 10 + "k";
	}
	return sign + absoluteCount.toString();
};

const PostVoteCount: React.FC<PostVoteCountProps> = ({
	upVotes,
	downVotes,
	expiresInDays,
}) => {
	const [open, setOpen] = useState(false);
	const voteCount = upVotes - downVotes;
	const formattedVoteCount = formatCount(voteCount);
	const formattedUpVotes = formatCount(upVotes);
	const formattedDownVotes = formatCount(downVotes);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="neutral" className="w-full">
					<p>{formattedVoteCount}</p>
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="flex gap-1 items-center">
					<ArrowBigUp /> {formattedUpVotes}
				</div>
				<div className="flex gap-1 items-center">
					<ArrowBigDown /> {formattedDownVotes}
				</div>
				<div className="flex gap-1 items-center [&_svg]:p-1">
					<Hourglass /> {expiresInDays} day
					{expiresInDays === 1 ? "" : "s"}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PostVoteCount;
