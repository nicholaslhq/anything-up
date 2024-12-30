import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { Plus } from "lucide-react";

interface PostSubmissionFormProps {
	onSubmit: (event: React.FormEvent) => void;
	content: string;
	setContent: React.Dispatch<React.SetStateAction<string>>;
}

const PostSubmissionForm: React.FC<PostSubmissionFormProps> = ({
	onSubmit,
	content,
	setContent,
}) => {
	const [showTagsInput, setShowTagsInput] = useState(false);

	return (
		<div className="mt-10 flex gap-3 md:gap-5 w-full sm:max-w-lg">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<form onSubmit={onSubmit} className="space-y-4">
						<Input
							id="content"
							placeholder="What’s happening in your world?"
							value={content}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) => setContent(e.target.value)}
						/>
					</form>
				</CardHeader>
				<CardFooter>
					<div className="flex flex-row gap-2">
						{showTagsInput ? (
							<Input
								placeholder="Tag"
								prefix="#"
								className="w-24"
							/>
						) : (
							""
						)}

						<div>
							<Button
								type="button"
								variant="neutral"
								size="icon"
								onClick={() => setShowTagsInput(true)}
							>
								<Plus />
							</Button>
						</div>
					</div>
				</CardFooter>
			</Card>
			<Button type="submit">Submit</Button>
		</div>
	);
};

export default PostSubmissionForm;
