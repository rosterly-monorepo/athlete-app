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
    <div className="grid sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            {stat.note && (
              <p className="text-xs text-muted-foreground mt-1">{stat.note}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
