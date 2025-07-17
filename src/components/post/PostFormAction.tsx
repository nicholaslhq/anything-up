import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
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
						<div className="text-sm text-center">
							<div className="sm:hidden">
								<p>{postContentLength}</p>
								<hr className="border-black dark:border-white opacity-80" />
								<p>{maxContentLength}</p>
							</div>
							<div className="hidden sm:flex">
								<p>
									{postContentLength}/{maxContentLength}
								</p>
							</div>
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<div className="flex gap-1 items-center">
						<PenLine />{" "}
						<p>
							{maxContentLength - postContentLength} character
							{maxContentLength - postContentLength === 1
								? ""
								: "s"}{" "}
							left
						</p>
					</div>
				</PopoverContent>
			</Popover>
			<div className="flex flex-col sm:flex-row gap-2 mt-2">
				<Button
					type="submit"
					size="mobileIcon"
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
					size="mobileIcon"
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
