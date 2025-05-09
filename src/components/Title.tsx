import { ArrowBigUp } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Dispatch, SetStateAction } from "react";

interface TitleProps {
	setRefreshPosts?: Dispatch<SetStateAction<boolean>>;
	loading?: boolean;
}

const Title: React.FC<TitleProps> = ({ setRefreshPosts, loading }) => {
	const [isHovering, setIsHovering] = useState(false);

	const handleClick = () => {
		if (setRefreshPosts) {
			setRefreshPosts((prev) => !prev);
		}
	};

	return (
		<Link href="/" onClick={handleClick}>
			<h1
				className="text-2xl font-bold text-text"
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
			>
				Anything
				<span className="relative inline-block h-[1em] w-[1.1em]">
					<span
						className={`absolute top-0 transition-all ${
							loading
								? "hidden"
								: isHovering
								? "-translate-y-full opacity-0"
								: "translate-y-0 opacity-100"
						}`}
					>
						Up
					</span>
					<span
						className={`absolute bottom-0 transition-all ${
							loading
								? "slide-up-loop"
								: isHovering
								? "translate-y-0 opacity-100"
								: "translate-y-full opacity-0"
						}`}
					>
						<ArrowBigUp
							className="inline"
							style={{
								height: "1.5em",
								width: "1.5em",
								marginBottom: "-0.4em",
							}}
						/>
					</span>
				</span>
			</h1>
		</Link>
	);
};

export default Title;
