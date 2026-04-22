import { describe, it, expect } from "vitest";
import {
  evaluateRequirements,
  findMinimum,
  formatRequirementValue,
  seedFiltersFromRequirements,
} from "./requirements";
import type { AthleteSearchHit, ProgramRequirements, SearchFilterSchema } from "@/services/types";

const schemas: SearchFilterSchema[] = [
  {
    field: "gpa_unweighted",
    filter_type: "range",
    value_type: "range",
    label: "GPA",
    min: 0,
    max: 4,
    step: 0.1,
    options_from_agg: false,
    group: "academics",
    order: 1,
    direction: "higher_is_better",
  },
  {
    field: "academic_index",
    filter_type: "range",
    value_type: "range",
    label: "Rosterly Academic Index",
    min: 96,
    max: 260,
    step: 1,
    options_from_agg: false,
    group: "academics",
    order: 2,
    direction: "higher_is_better",
  },
  {
    field: "rowing_best_2k_seconds",
    filter_type: "range",
    value_type: "range",
    label: "2K Erg",
    min: 300,
    max: 600,
    step: 1,
    unit: "seconds",
    display_format: "rowing_time",
    options_from_agg: false,
    group: "rowing",
    order: 1,
    direction: "lower_is_better",
  },
];

function hit(overrides: Partial<AthleteSearchHit> & Record<string, unknown>): AthleteSearchHit {
  return {
    id: 1,
    first_name: "A",
    last_name: "B",
    full_name: "A B",
    avatar_url: null,
    primary_sport: null,
    sports: [],
    position: null,
    school: null,
    high_school_name: null,
    high_school_state: null,
    graduation_year: null,
    gpa_unweighted: null,
    height_inches: null,
    weight_lbs: null,
    sat_total: null,
    act_composite: null,
    profile_completion_pct: 0,
    _score: 1,
    ...overrides,
  } as AthleteSearchHit;
}

describe("evaluateRequirements", () => {
  it("marks athlete as met when GPA exceeds the minimum", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "gpa_unweighted", min_value: 3.5 }],
    };
    const [result] = evaluateRequirements(hit({ gpa_unweighted: 3.7 }), requirements, schemas);
    expect(result.status).toBe("met");
    expect(result.athlete_value).toBe(3.7);
    expect(result.min_value).toBe(3.5);
    expect(result.label).toBe("GPA");
  });

  it("marks athlete as missed when GPA is below minimum", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "gpa_unweighted", min_value: 3.5 }],
    };
    const [result] = evaluateRequirements(hit({ gpa_unweighted: 3.2 }), requirements, schemas);
    expect(result.status).toBe("missed");
  });

  it("treats missing athlete value as unknown", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "gpa_unweighted", min_value: 3.5 }],
    };
    const [result] = evaluateRequirements(hit({ gpa_unweighted: null }), requirements, schemas);
    expect(result.status).toBe("unknown");
    expect(result.athlete_value).toBeNull();
  });

  it("respects lower_is_better direction for sport times", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "rowing_best_2k_seconds", min_value: 420 }],
    };
    const fastHit = hit({ rowing_best_2k_seconds: 400 });
    const slowHit = hit({ rowing_best_2k_seconds: 430 });
    const [fast] = evaluateRequirements(fastHit, requirements, schemas);
    const [slow] = evaluateRequirements(slowHit, requirements, schemas);
    expect(fast.status).toBe("met");
    expect(slow.status).toBe("missed");
    expect(fast.direction).toBe("lower_is_better");
  });

  it("returns empty for no minimums", () => {
    expect(evaluateRequirements(hit({}), null, schemas)).toEqual([]);
    expect(evaluateRequirements(hit({}), { minimums: [] }, schemas)).toEqual([]);
  });
});

describe("seedFiltersFromRequirements", () => {
  it("seeds [min, min_value] for lower_is_better ranges", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "rowing_best_2k_seconds", min_value: 420 }],
    };
    const seeded = seedFiltersFromRequirements(schemas, requirements, {});
    expect(seeded.rowing_best_2k_seconds).toEqual([300, 420]);
  });

  it("seeds [min_value, max] for higher_is_better ranges", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "gpa_unweighted", min_value: 3.5 }],
    };
    const seeded = seedFiltersFromRequirements(schemas, requirements, {});
    expect(seeded.gpa_unweighted).toEqual([3.5, 4]);
  });

  it("does not overwrite existing URL-supplied values", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "gpa_unweighted", min_value: 3.5 }],
    };
    const seeded = seedFiltersFromRequirements(schemas, requirements, {
      gpa_unweighted: [2.5, 3.5],
    });
    expect(seeded.gpa_unweighted).toEqual([2.5, 3.5]);
  });

  it("ignores unknown fields gracefully", () => {
    const requirements: ProgramRequirements = {
      minimums: [{ field_name: "nonsense_field", min_value: 1 }],
    };
    const seeded = seedFiltersFromRequirements(schemas, requirements, {});
    expect(seeded.nonsense_field).toBeUndefined();
  });
});

describe("formatRequirementValue", () => {
  it("formats rowing times as m:ss", () => {
    expect(formatRequirementValue(420, "rowing_time", "seconds")).toBe("7:00");
  });
  it("formats height as feet'inches", () => {
    expect(formatRequirementValue(72, "height_inches", null)).toBe("6'0\"");
  });
  it("pass-through with unit for plain numbers", () => {
    expect(formatRequirementValue(3.5, null, null)).toBe("3.50");
    expect(formatRequirementValue(200, null, null)).toBe("200");
  });
});

describe("findMinimum", () => {
  it("returns the matching minimum or undefined", () => {
    const requirements: ProgramRequirements = {
      minimums: [
        { field_name: "gpa_unweighted", min_value: 3.5 },
        { field_name: "academic_index", min_value: 200 },
      ],
    };
    expect(findMinimum(requirements, "gpa_unweighted")?.min_value).toBe(3.5);
    expect(findMinimum(requirements, "sat_total")).toBeUndefined();
    expect(findMinimum(null, "gpa_unweighted")).toBeUndefined();
  });
});
