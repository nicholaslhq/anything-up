import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex relative items-center justify-center rounded-base text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-start",
	{
		variants: {
			variant: {
				default:
					"text-mtext bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
				noShadow: "text-mtext bg-main border-2 border-border",
				neutral:
					"bg-bw text-text border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
				reverse:
					"text-mtext bg-main border-2 border-border hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow",
			},
			size: {
				default: "min-h-10 px-4 py-2",
				sm: "min-h-9 px-3",
				lg: "min-h-11 px-8",
				icon: "min-h-10 w-10",
				mobileIcon: "min-h-10 w-16 sm:w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	prefix?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, prefix, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(
					buttonVariants({ variant, size, className }),
					prefix ? "pl-6 items-center" : ""
				)}
				ref={ref}
				{...props}
			>
				{prefix && (
					<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-text">
						{prefix}
					</div>
				)}
				{props.children}
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
