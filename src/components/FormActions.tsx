import React from "react";
import { Button } from "./ui/button";
import { Send, Eraser } from "lucide-react";

interface FormActionsProps {
	postContentLength: number;
	maxContentLength: number;
	clearForm: () => void;
	tagErrors: string[];
	content: string;
}

const FormActions: React.FC<FormActionsProps> = ({
	postContentLength,
	maxContentLength,
	clearForm,
	tagErrors,
	content,
}) => {
	return (
		<div className="flex w-auto flex-col items-center">
			<Button
				className="w-full"
				variant="neutral"
				onClick={(e) => {
					e.preventDefault();
				}}
			>
				<div className="text-sm">
					{postContentLength}/{maxContentLength}
				</div>
			</Button>
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

export default FormActions;
