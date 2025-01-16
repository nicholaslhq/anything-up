import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PostFooterProps {
	postFormRef: React.RefObject<HTMLFormElement | null>;
}

const PostFooter: React.FC<PostFooterProps> = ({ postFormRef }) => {
	const pathname = usePathname();
	const isPostDetail = pathname?.startsWith("/posts/");

	return (
		<div className="flex items-center text-center text-sm text-text mb-10">
			{isPostDetail ? (
				<div className="flex flex-col gap-2">
					<p>Your vote shapes AnythingUp for everyone else</p>
					<p>
						<Link href="/" className="underline">
							Discover more
						</Link>
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<p>That&apos;s all for now</p>
					<p
						onClick={() => {
							window.scrollTo({ top: 0 });
							postFormRef?.current?.classList.add("flash");
							setTimeout(() => {
								postFormRef?.current?.classList.remove("flash");
							}, 2000);
						}}
						className="underline cursor-pointer"
					>
						Got AnythingUp to share?
					</p>
				</div>
			)}
		</div>
	);
};

export default PostFooter;
