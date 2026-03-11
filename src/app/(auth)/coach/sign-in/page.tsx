import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function CoachSignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Coach Sign In</h1>
        <p className="text-muted-foreground">Sign in to manage your team and recruit athletes.</p>
      </div>

      <SignIn
        forceRedirectUrl="/coach/dashboard"
        appearance={{
          elements: {
            footerAction: { display: "none" },
          },
        }}
      />

      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
