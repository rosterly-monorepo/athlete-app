import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account, security, and subscription.</p>
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none border border-border rounded-xl",
          },
        }}
      />
    </div>
  );
}
