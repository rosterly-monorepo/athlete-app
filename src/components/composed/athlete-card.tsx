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
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={athlete.avatarUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {athlete.firstName} {athlete.lastName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {athlete.school} &middot; Class of {athlete.graduationYear}
          </p>
        </div>
        <Badge variant="secondary">{athlete.sport}</Badge>
      </CardHeader>
      {variant === "full" && athlete.bio && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{athlete.bio}</p>
        </CardContent>
      )}
    </Card>
  );
}
