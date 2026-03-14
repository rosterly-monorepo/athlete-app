import { AthleteSearchPage } from "@/components/search/athlete-search-page";

export default function CoachSearchPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Athlete Search</h1>
        <p className="text-muted-foreground mt-1">
          Find and filter athletes for your recruiting pipeline
        </p>
      </div>
      <AthleteSearchPage />
    </div>
  );
}
