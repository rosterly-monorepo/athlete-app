import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string | number;
  note?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            {stat.note && <p className="text-muted-foreground mt-1 text-xs">{stat.note}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
