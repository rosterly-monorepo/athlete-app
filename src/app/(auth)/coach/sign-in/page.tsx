import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function CoachSignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Coach Sign In</h1>
        <p className="text-muted-foreground">
          Sign in to manage your team and recruit athletes.
        </p>
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
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
