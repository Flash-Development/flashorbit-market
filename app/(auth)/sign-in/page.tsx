import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

type SignInPageProps = {
  searchParams: Promise<{ verified?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { verified } = await searchParams;
  return (
    <section className="auth-card">
      <Link className="auth-brand" href="/">Flash Orbit</Link>
      <div>
        <span className="auth-eyebrow">Welcome back</span>
        <h1>Sign in to Flash Orbit</h1>
        <p>Manage your store, stock and finances from one workspace.</p>
      </div>
      <AuthForm mode="signin" emailVerified={verified === "1"} />
      <p className="auth-switch">New to Flash Orbit? <Link href="/sign-up">Create an account</Link></p>
    </section>
  );
}
