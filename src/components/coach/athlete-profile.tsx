"use client";

import {
  BookOpen,
  Check,
  GraduationCap,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Trophy,
  User,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatHeight, formatSportCode } from "@/lib/format";
import { SportRenderer } from "./sports/sport-renderer";
import type { AthleteCoachView } from "@/services/types";

// ── Stat card ──

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-wider uppercase">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {label}
        </div>
        <p className="mt-1 text-lg font-semibold">
          {value ?? <span className="text-muted-foreground text-sm font-normal">—</span>}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Section wrapper ──

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ── Data row ──

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  const display =
    value === true ? "Yes" : value === false ? "No" : value != null ? String(value) : null;

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={display ? "font-medium" : "text-muted-foreground"}>{display ?? "—"}</span>
    </div>
  );
}

// ── Header ──

function ProfileHeader({
  athlete,
  inPipeline,
  isAdding,
  onAddToPipeline,
}: {
  athlete: AthleteCoachView;
  inPipeline?: boolean;
  isAdding?: boolean;
  onAddToPipeline?: () => void;
}) {
  const initials = (athlete.first_name?.[0] ?? "") + (athlete.last_name?.[0] ?? "");

  const primarySport = athlete.sports?.find((s) => s.is_primary);
  const sportLabel = primarySport?.sport_code
    ? formatSportCode(primarySport.sport_code)
    : athlete.sport
      ? formatSportCode(athlete.sport)
      : null;

  const school = athlete.academics?.high_school_name ?? athlete.school ?? null;
  const gradYear = athlete.academics?.graduation_year ?? athlete.graduation_year ?? null;

  return (
    <div className="mb-6 flex items-start gap-5">
      <Avatar className="h-20 w-20 shrink-0">
        {athlete.avatar_url && (
          <AvatarImage
            src={athlete.avatar_url}
            alt={`${athlete.first_name} ${athlete.last_name}`}
          />
        )}
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">
            {athlete.first_name} {athlete.last_name}
          </h1>
          {sportLabel && <Badge variant="secondary">{sportLabel}</Badge>}
        </div>
        <p className="text-muted-foreground mt-0.5">
          {[athlete.position, school, gradYear && `Class of ${gradYear}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-2">
          {inPipeline ? (
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              In Pipeline
            </Badge>
          ) : onAddToPipeline ? (
            <Button size="sm" className="gap-1.5" disabled={isAdding} onClick={onAddToPipeline}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Add to Pipeline
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──

function OverviewTab({ athlete }: { athlete: AthleteCoachView }) {
  const edu = athlete.academics;
  const test = athlete.academics;
  const pi = athlete.personal_info;

  const heightInches =
    pi?.height_feet != null && pi?.height_inches != null
      ? pi.height_feet * 12 + pi.height_inches
      : athlete.height_feet != null && athlete.height_inches != null
        ? athlete.height_feet * 12 + athlete.height_inches
        : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <StatCard
          label="Academic Index"
          value={edu?.academic_index?.toFixed(1)}
          icon={GraduationCap}
        />
        <StatCard label="GPA" value={edu?.gpa_unweighted?.toFixed(2)} icon={GraduationCap} />
        <StatCard label="SAT" value={test?.sat_total} icon={BookOpen} />
        <StatCard label="ACT" value={test?.act_composite} icon={BookOpen} />
        <StatCard
          label="Height"
          value={heightInches != null ? formatHeight(heightInches) : null}
          icon={Ruler}
        />
      </div>

      {/* Sport highlights */}
      {athlete.sports?.map((sport) => (
        <SportRenderer key={sport.id} sport={sport} />
      ))}

      {(athlete.bio || athlete.writing?.athletic_statement) && (
        <Section title="About" icon={User}>
          {athlete.bio && <p className="text-sm whitespace-pre-wrap">{athlete.bio}</p>}
          {athlete.writing?.athletic_statement && (
            <div className="mt-3">
              <p className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
                Athletic Statement
              </p>
              <p className="text-sm whitespace-pre-wrap">{athlete.writing.athletic_statement}</p>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

// ── Academics Tab ──

function AcademicsTab({ athlete }: { athlete: AthleteCoachView }) {
  const edu = athlete.academics;
  const test = athlete.academics;

  return (
    <div className="space-y-4">
      {edu?.academic_index != null && (
        <Section title="Academic Index" icon={GraduationCap}>
          <div className="divide-y">
            <DataRow label="Academic Index" value={edu.academic_index.toFixed(1)} />
            <DataRow label="CGS" value={edu.cgs} />
            {edu.rai_cgs != null && (
              <DataRow label="RAI (GPA Only)" value={edu.rai_cgs.toFixed(1)} />
            )}
            {edu.rai_sat != null && (
              <DataRow label="RAI (with SAT)" value={edu.rai_sat.toFixed(1)} />
            )}
            {edu.rai_act != null && (
              <DataRow label="RAI (with ACT)" value={edu.rai_act.toFixed(1)} />
            )}
          </div>
        </Section>
      )}

      <Section title="Education" icon={GraduationCap}>
        <div className="divide-y">
          <DataRow label="High School" value={edu?.high_school_name} />
          <DataRow
            label="Location"
            value={
              edu?.high_school_city && edu?.high_school_state
                ? `${edu.high_school_city}, ${edu.high_school_state}`
                : edu?.high_school_state
            }
          />
          <DataRow label="Graduation Year" value={edu?.graduation_year} />
          <DataRow label="GPA (Unweighted)" value={edu?.gpa_unweighted?.toFixed(2)} />
          <DataRow label="GPA (Weighted)" value={edu?.gpa_weighted?.toFixed(2)} />
          <DataRow label="GPA Scale" value={edu?.gpa_scale} />
          <DataRow
            label="Class Rank"
            value={
              edu?.class_rank && edu?.class_size
                ? `${edu.class_rank} / ${edu.class_size}`
                : edu?.class_rank
            }
          />
          <DataRow label="Academic Honors" value={edu?.academic_honors} />
          <DataRow label="NCAA Core GPA" value={edu?.ncaa_core_gpa?.toFixed(2)} />
          <DataRow label="NCAA Registered" value={edu?.ncaa_registered} />
          <DataRow label="NCAA ID" value={edu?.ncaa_id} />
        </div>
      </Section>

      <Section title="Test Scores" icon={BookOpen}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">SAT</p>
            <div className="divide-y">
              <DataRow label="Total" value={test?.sat_total} />
              <DataRow label="Reading/Writing" value={test?.sat_reading_writing} />
              <DataRow label="Math" value={test?.sat_math} />
              {test?.sat_date && (
                <DataRow label="Date" value={new Date(test.sat_date).toLocaleDateString()} />
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">ACT</p>
            <div className="divide-y">
              <DataRow label="Composite" value={test?.act_composite} />
              <DataRow label="English" value={test?.act_english} />
              <DataRow label="Math" value={test?.act_math} />
              <DataRow label="Reading" value={test?.act_reading} />
              <DataRow label="Science" value={test?.act_science} />
              {test?.act_date && (
                <DataRow label="Date" value={new Date(test.act_date).toLocaleDateString()} />
              )}
            </div>
          </div>
        </div>
        {test?.is_test_optional && (
          <p className="text-muted-foreground mt-3 text-xs">
            This athlete has opted for test-optional.
          </p>
        )}
      </Section>
    </div>
  );
}

// ── Athletic Tab ──

function AthleticTab({ athlete }: { athlete: AthleteCoachView }) {
  return (
    <div className="space-y-4">
      {athlete.sports?.length > 0 ? (
        athlete.sports.map((sport) => (
          <div key={sport.id}>
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="text-muted-foreground h-4 w-4" />
              <h3 className="font-semibold capitalize">{formatSportCode(sport.sport_code)}</h3>
              {sport.is_primary && (
                <Badge variant="outline" className="text-xs">
                  Primary
                </Badge>
              )}
              {sport.recruiting_status && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {sport.recruiting_status}
                </Badge>
              )}
            </div>
            <div className="mb-4 space-y-3">
              {(sport.years_experience || sport.current_club || sport.current_coach) && (
                <Card>
                  <CardContent className="divide-y p-4">
                    <DataRow label="Years Experience" value={sport.years_experience} />
                    <DataRow label="Current Club" value={sport.current_club} />
                    <DataRow label="Current Coach" value={sport.current_coach} />
                  </CardContent>
                </Card>
              )}
              <SportRenderer sport={sport} />
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground py-8 text-center text-sm">No sports added yet.</p>
      )}

      {athlete.activities && athlete.activities.length > 0 && (
        <Section title="Activities">
          <div className="divide-y">
            {athlete.activities.map((a) => (
              <div key={a.id} className="py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {a.activity_type.replace(/_/g, " ")}
                  </Badge>
                </div>
                {a.description && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{a.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Personal Tab ──

function PersonalTab({ athlete }: { athlete: AthleteCoachView }) {
  const contact = athlete.contact_details;
  const pi = athlete.personal_info;
  const demo = athlete.demographics;
  const family = athlete.family_info;
  const address = athlete.address;

  return (
    <div className="space-y-4">
      <Section title="Contact" icon={Mail}>
        <div className="divide-y">
          <DataRow label="Email" value={athlete.email || contact?.email_primary} />
          {contact?.email_secondary && (
            <DataRow label="Email (Secondary)" value={contact.email_secondary} />
          )}
          <DataRow label="Phone" value={contact?.phone_primary} />
          {contact?.phone_secondary && (
            <DataRow label="Phone (Secondary)" value={contact.phone_secondary} />
          )}
          {contact?.social_instagram && (
            <DataRow label="Instagram" value={contact.social_instagram} />
          )}
          {contact?.social_twitter && <DataRow label="Twitter" value={contact.social_twitter} />}
        </div>
      </Section>

      {(pi || athlete.height_feet != null) && (
        <Section title="Physical" icon={Ruler}>
          <div className="divide-y">
            {pi?.date_of_birth && (
              <DataRow
                label="Date of Birth"
                value={new Date(pi.date_of_birth).toLocaleDateString()}
              />
            )}
            <DataRow
              label="Height"
              value={
                (pi?.height_feet ?? athlete.height_feet) != null
                  ? formatHeight(
                      ((pi?.height_feet ?? athlete.height_feet) || 0) * 12 +
                        ((pi?.height_inches ?? athlete.height_inches) || 0)
                    )
                  : null
              }
            />
            <DataRow
              label="Weight"
              value={
                (pi?.weight_lbs ?? athlete.weight)
                  ? `${pi?.weight_lbs ?? athlete.weight} lbs`
                  : null
              }
            />
          </div>
        </Section>
      )}

      {address && (
        <Section title="Address" icon={MapPin}>
          <div className="divide-y">
            <DataRow label="Street" value={address.street_line_1} />
            <DataRow
              label="City/State"
              value={
                address.city && address.state_province
                  ? `${address.city}, ${address.state_province}`
                  : address.city || address.state_province
              }
            />
            <DataRow label="Postal Code" value={address.postal_code} />
            <DataRow label="Country" value={address.country} />
          </div>
        </Section>
      )}

      {demo && (
        <Section title="Demographics" icon={User}>
          <div className="divide-y">
            <DataRow label="Gender" value={demo.gender} />
            <DataRow label="Citizenship" value={demo.citizenship_status} />
            {demo.birth_country && <DataRow label="Birth Country" value={demo.birth_country} />}
            {demo.ethnicity && demo.ethnicity.length > 0 && (
              <DataRow label="Ethnicity" value={demo.ethnicity.join(", ")} />
            )}
            <DataRow label="Military Connected" value={demo.is_military_connected} />
          </div>
        </Section>
      )}

      {(athlete.parent_guardians?.length ?? 0) > 0 && (
        <Section title="Parent/Guardians" icon={Heart}>
          <div className="divide-y">
            {athlete.parent_guardians!.map((pg) => (
              <div key={pg.id} className="py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {pg.first_name} {pg.last_name}
                  </span>
                  <span className="text-muted-foreground capitalize">{pg.relation}</span>
                </div>
                <div className="text-muted-foreground mt-0.5 flex gap-4 text-xs">
                  {pg.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {pg.email}
                    </span>
                  )}
                  {pg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {pg.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {family && (
        <Section title="Family" icon={Heart}>
          <div className="divide-y">
            <DataRow label="First Generation College" value={family.is_first_gen_college} />
            <DataRow label="Financial Aid Needed" value={family.needs_financial_aid} />
            {family.sibling_count != null && (
              <DataRow label="Siblings" value={family.sibling_count} />
            )}
            {family.siblings_in_college != null && (
              <DataRow label="Siblings in College" value={family.siblings_in_college} />
            )}
            {family.legacy_schools && family.legacy_schools.length > 0 && (
              <DataRow label="Legacy Schools" value={family.legacy_schools.join(", ")} />
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Main Component ──

export interface AdditionalTab {
  value: string;
  label: string;
  content: React.ReactNode;
}

export function AthleteCoachProfile({
  athlete,
  inPipeline,
  isAdding,
  onAddToPipeline,
  beforeTabs,
  additionalTabs,
  defaultTab = "overview",
  className,
}: {
  athlete: AthleteCoachView;
  inPipeline?: boolean;
  isAdding?: boolean;
  onAddToPipeline?: () => void;
  beforeTabs?: React.ReactNode;
  additionalTabs?: AdditionalTab[];
  defaultTab?: string;
  className?: string;
}) {
  return (
    <div className={className ?? "max-w-4xl"}>
      <ProfileHeader
        athlete={athlete}
        inPipeline={inPipeline}
        isAdding={isAdding}
        onAddToPipeline={onAddToPipeline}
      />

      {beforeTabs}

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {additionalTabs?.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academics">Academics</TabsTrigger>
          <TabsTrigger value="athletic">Athletic</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          {additionalTabs?.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
          <TabsContent value="overview">
            <OverviewTab athlete={athlete} />
          </TabsContent>
          <TabsContent value="academics">
            <AcademicsTab athlete={athlete} />
          </TabsContent>
          <TabsContent value="athletic">
            <AthleticTab athlete={athlete} />
          </TabsContent>
          <TabsContent value="personal">
            <PersonalTab athlete={athlete} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
