"use client";
import Title from "@/components/Title";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-24 md:gap-32 items-center">
      <Title />
      <div className="flex flex-col items-center text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-4">404</h1>
          <p className="mb-8">The page you are looking for does not exist</p>
          <Link href="/" className="text-sm text-text underline hover:opacity-80">
            Back to Home
          </Link>
        </div>
    </main>
  </div>
  );
};

export default NotFoundPage;