import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	prefix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, prefix, ...props }, ref) => {
		return (
			<div className="relative">
				{prefix && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-text">
						{prefix}
					</div>
				)}
				<input
					type={type}
					className={cn(
						"flex h-10 w-full rounded-base border-2 text-text shadow-shadow focus:shadow-none font-base selection:bg-main selection:text-mtext border-border bg-bw px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
						prefix ? "pl-6" : "",
						className
					)}
					ref={ref}
					{...props}
				/>
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
