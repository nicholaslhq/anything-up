import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import the Textarea component
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PostFormAction from "@/components/post/PostFormAction";
import {
	SETTING_POST_NEW_TAG_LIMIT,
	SETTING_POST_MAX_TAG_LENGTH,
	SETTING_POST_MAX_CONTENT_LENGTH
} from "@/lib/settings";

interface PostSubmissionFormProps {
	handleSubmit: (event: React.FormEvent, tags: string[]) => Promise<void>;
	content: string;
	setContent: React.Dispatch<React.SetStateAction<string>>;
}

const PostSubmissionForm = React.forwardRef<
	HTMLFormElement,
	PostSubmissionFormProps
>(({ handleSubmit, content, setContent }, ref) => {
	const [postContentLength, setPostContentLength] = useState(0);
	const [tagInputs, setTagInputs] = useState<string[]>([]);
	const [tagErrors, setTagErrors] = useState<string[]>([]);

	const clearForm = React.useCallback(() => {
		setContent("");
		setPostContentLength(0);
		setTagInputs([]);
		setTagErrors([]);
	}, [setContent, setPostContentLength, setTagInputs, setTagErrors]);

	useEffect(() => {
		clearForm();
	}, [clearForm]);

	const tagInputRefs = useRef<HTMLInputElement[]>([]);

	const addTagInput = () => {
		if (tagInputs.length < SETTING_POST_NEW_TAG_LIMIT) {
			setTagInputs([...tagInputs, ""]);
			setTagErrors([...tagErrors, ""]);
			// Focus on the last input after it's added
			setTimeout(() => {
				if (!tagInputRefs.current) {
					tagInputRefs.current = [];
				}
				if (tagInputRefs.current.length > 0) {
					tagInputRefs.current[tagInputs.length].focus();
				}
			}, 0);
		}
	};

	const handleTagInputChange = (index: number, value: string) => {
		const newTagInputs = [...tagInputs];
		const newTagErrors = [...tagErrors];
		if (value.length > SETTING_POST_MAX_TAG_LENGTH) {
			return;
		}
		const regex = /[^a-zA-Z0-9]/g;
		if (regex.test(value)) {
			newTagErrors[index] = "Only alphanumeric characters are allowed.";
		} else {
			newTagErrors[index] = "";
		}
		newTagInputs[index] = value;
		setTagInputs(newTagInputs);
		setTagErrors(newTagErrors);
	};

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const tagsToAdd = tagInputs
			.map((input) => input.trim())
			.filter((tag) => tag !== "");
		const uniqueTagsToAdd = [...new Set(tagsToAdd)]; // Eliminate duplicates
		await handleSubmit(event, uniqueTagsToAdd);
		setContent("");
		setPostContentLength(0);
		setTagInputs([]);
		setTagErrors([]);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<form
			ref={ref}
			onSubmit={onSubmit}
			className="flex gap-3 md:gap-5 w-full sm:max-w-lg"
		>
			<Card className="w-full max-w-lg">
				<CardHeader>
					<Textarea
						id="content"
						placeholder="AnythingUp in your world?"
						value={content}
						onChange={(
							e: React.ChangeEvent<HTMLTextAreaElement>
						) => {
							const inputValue = e.target.value;
							if (
								inputValue.length <=
								SETTING_POST_MAX_CONTENT_LENGTH
							) {
								setContent(inputValue);
								setPostContentLength(inputValue.length);
							} else {
								setContent(
									inputValue.slice(
										0,
										SETTING_POST_MAX_CONTENT_LENGTH
									)
								);
								setPostContentLength(
									SETTING_POST_MAX_CONTENT_LENGTH
								);
							}
						}}
						autoExpand
						minHeight={40}
						maxHeight={200}
					/>
				</CardHeader>
				<CardFooter>
					<div className="flex flex-row gap-2 flex-wrap break-all">
						{tagInputs.length > 0 &&
							tagInputs.map((tagInput, index) => (
								<div key={index}>
									<Input
										ref={(el) => {
											if (el) {
												if (!tagInputRefs.current) {
													tagInputRefs.current = [];
												}
												tagInputRefs.current[index] =
													el;
											}
										}}
										placeholder="Tag"
										prefix="#"
										className={`w-24 ${
											tagErrors[index]
												? "bg-red-300 dark:bg-red-800"
												: ""
										}`}
										value={tagInput}
										onChange={(e) => {
											if (
												e.target.value.length <=
												SETTING_POST_MAX_TAG_LENGTH
											) {
												handleTagInputChange(
													index,
													e.target.value
												);
											}
										}}
									/>
								</div>
							))}
						{tagInputs.length < SETTING_POST_NEW_TAG_LIMIT && (
							<div>
								<Button
									type="button"
									variant="neutral"
									size="icon"
									onClick={addTagInput}
									disabled={
										tagInputs.some(
											(input) => input.trim() === ""
										) && tagInputs.length > 0
									}
								>
									<Plus />
								</Button>
							</div>
						)}
					</div>
				</CardFooter>
			</Card>
			<PostFormAction
				postContentLength={postContentLength}
				maxContentLength={SETTING_POST_MAX_CONTENT_LENGTH}
				clearForm={clearForm}
				tagErrors={tagErrors}
				content={content}
			/>
		</form>
	);
});

PostSubmissionForm.displayName = "PostSubmissionForm";

export default PostSubmissionForm;
