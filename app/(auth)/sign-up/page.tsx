import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <section className="auth-card">
      <Link className="auth-brand" href="/">Flash Orbit</Link>
      <div>
        <span className="auth-eyebrow">Start with Flash Orbit</span>
        <h1>Create your account</h1>
        <p>Set up the account you will use to run and switch businesses.</p>
      </div>
      <AuthForm mode="signup" />
      <p className="auth-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </section>
  );
}
