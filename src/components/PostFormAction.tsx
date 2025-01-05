import React, { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Send, Eraser, PenLine } from "lucide-react";

interface PostFormActionProps {
	postContentLength: number;
	maxContentLength: number;
	clearForm: () => void;
	tagErrors: string[];
	content: string;
}

const PostFormAction: React.FC<PostFormActionProps> = ({
	postContentLength,
	maxContentLength,
	clearForm,
	tagErrors,
	content,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex w-auto flex-col items-center">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="neutral" className="w-full">
						<div className="text-sm">
							{postContentLength}/{maxContentLength}
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<div className="flex gap-1 items-center">
						<PenLine /> <p>{maxContentLength - postContentLength} character{maxContentLength - postContentLength === 1 ? "" : "s"} left</p>
					</div>
				</PopoverContent>
			</Popover>
			<div className="flex gap-2 mt-2">
				<Button
					type="submit"
					size="icon"
					variant="neutral"
					className="[&_svg]:size-5"
					disabled={
						tagErrors.some((error) => error !== "") ||
						content.trim() === ""
					}
				>
					<Send />
				</Button>
				<Button
					type="button"
					size="icon"
					variant="neutral"
					className="[&_svg]:size-5"
					onClick={(e) => {
						e.preventDefault();
						clearForm();
					}}
					disabled={content.trim() === ""}
				>
					<Eraser />
				</Button>
			</div>
		</div>
	);
};

export default PostFormAction;
