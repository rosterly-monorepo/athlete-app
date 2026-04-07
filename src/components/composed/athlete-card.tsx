import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Athlete } from "@/services/types";

interface AthleteCardProps {
  athlete: Athlete;
  variant?: "compact" | "full";
}

export function AthleteCard({ athlete, variant = "compact" }: AthleteCardProps) {
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;

  return (
    <Card className="hover:border-primary/30 transition-all duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={athlete.avatarUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">
            {athlete.firstName} {athlete.lastName}
          </h3>
          {athlete.position && (
            <p className="text-muted-foreground truncate text-sm">{athlete.position}</p>
          )}
        </div>
        {athlete.position && <Badge variant="secondary">{athlete.position}</Badge>}
      </CardHeader>
      {variant === "full" && athlete.bio && (
        <CardContent>
          <p className="text-muted-foreground text-sm">{athlete.bio}</p>
        </CardContent>
      )}
    </Card>
  );
}
