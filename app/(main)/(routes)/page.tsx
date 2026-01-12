import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800 font-sans dark:bg-black">
      <p className=" text-3xl text-indigo-500 ">
        Room Chat: This is a Protected Route
      </p>
      <p>
        <UserButton />
      </p>
    </div>
  );
}
