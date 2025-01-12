import Link from "next/link";
import { usePathname } from "next/navigation";

const PostFooter = () => {
	const pathname = usePathname();
	const isPostDetail = pathname?.startsWith("/posts/");

	const scrollToTop = () => {
		window.scrollTo({ top: 0 });
	};

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
					<p onClick={scrollToTop} className="underline cursor-pointer">
						Got AnythingUp to share?
					</p>
				</div>
			)}
		</div>
	);
};

export default PostFooter;
