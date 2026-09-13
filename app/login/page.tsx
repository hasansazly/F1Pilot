import Link from "next/link";
import Brand from "@/components/brand";
import AuthForm from "@/components/auth-form";
export default function Page() {
  return (
    <main className="auth-page">
      <header>
        <Brand />
        <Link href="/">Back to F1Pilot ↗</Link>
      </header>
      <AuthForm />
      <footer>PRIVATE BY DEFAULT · PREPARED TOGETHER</footer>
    </main>
  );
}
