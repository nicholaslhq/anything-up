import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PostFooter = () => {
  const pathname = usePathname();
  const isPostDetail = pathname?.startsWith('/posts/');

  return (
    <div className="flex flex-col items-center text-center text-sm text-text mb-10">
      {isPostDetail ? (
        <>
          <p>Your vote shapes AnythingUp for everyone else</p>
          <p><Link href="/" className="underline">Discover more</Link></p>
        </>
      ) : (
        <>
          <p>You&apos;ve reached the bottom,</p>
          <p>but there&apos;s always SomethingUp next</p>
        </>
      )}
    </div>
  );
};

export default PostFooter;
