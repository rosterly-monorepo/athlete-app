import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAthleteById } from "@/services/athlete";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ISR: revalidate every 60 seconds for fresh-but-cached SEO pages
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const athlete = await getAthleteById(id);
    return {
      title: `${athlete.firstName} ${athlete.lastName} — ${athlete.sport} | Rosterly`,
      description: athlete.bio || `View ${athlete.firstName}'s athlete profile on Rosterly.`,
    };
  } catch {
    return { title: "Athlete Not Found | Rosterly" };
  }
}

export default async function AthleteProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let athlete;
  try {
    athlete = await getAthleteById(id);
  } catch {
    // API not connected or athlete not found
    notFound();
  }

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={athlete.avatarUrl ?? undefined} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">
              {athlete.firstName} {athlete.lastName}
            </h1>
            <Badge variant="secondary">{athlete.sport}</Badge>
          </div>
          <p className="text-muted-foreground">
            {athlete.position && `${athlete.position} · `}
            {athlete.school} · Class of {athlete.graduationYear}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sport</p>
            <p className="text-lg font-semibold mt-1">{athlete.sport}</p>
          </CardContent>
        </Card>
        {athlete.position && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Position</p>
              <p className="text-lg font-semibold mt-1">{athlete.position}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Class Of</p>
            <p className="text-lg font-semibold mt-1">{athlete.graduationYear}</p>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {athlete.bio ? (
            <p className="text-sm whitespace-pre-wrap">{athlete.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              This athlete hasn&apos;t added a bio yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Competition Results placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Competition Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Competition results will appear here once the athlete adds them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
