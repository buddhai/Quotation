
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-black text-slate-900 mb-8">ModuQuote</h1>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        The modern way to manage quotations and agreements.
        Sign in to manage your documents.
      </p>
      <LoginButton />
    </main>
  );
}
