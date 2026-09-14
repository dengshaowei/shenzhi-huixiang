import { describe, expect, it } from "vitest";
import { COMPETENCY_DOMAINS, COMPETENCY_GROUPS, findCompetencyDomain } from "./content";

describe("competency learning map", () => {
  it("exposes nine inspectable domains with module outlines", () => {
    expect(COMPETENCY_DOMAINS).toHaveLength(9);
    for (const domain of COMPETENCY_DOMAINS) {
      expect(domain.modules.length).toBeGreaterThanOrEqual(4);
      expect(domain.learningOutcome.length).toBeGreaterThan(0);
      expect(domain.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("finds a domain by id without inventing missing domains", () => {
    expect(findCompetencyDomain("sensors")?.title).toBe("感知与传感器");
    expect(findCompetencyDomain("missing")).toBeNull();
  });

  it("places every domain exactly once in the overview mind map", () => {
    const groupedIds = COMPETENCY_GROUPS.reduce<string[]>((ids, group) => [...ids, ...group.domainIds], []);
    expect(groupedIds).toHaveLength(COMPETENCY_DOMAINS.length);
    expect(new Set(groupedIds).size).toBe(COMPETENCY_DOMAINS.length);
    expect(groupedIds.sort()).toEqual(COMPETENCY_DOMAINS.map((domain) => domain.id).sort());
  });
});
