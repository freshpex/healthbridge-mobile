import { describe, expect, it } from "vitest";
import { canOpenEmergency, homeForRole } from "./rbac";

describe("mobile rbac", () => {
  it("maps users to protected homes", () => {
    expect(homeForRole.patient).toBe("patient");
    expect(homeForRole.hospital_admin).toBe("hospital");
  });

  it("limits emergency tool access", () => {
    expect(canOpenEmergency("emergency_staff")).toBe(true);
    expect(canOpenEmergency("hospital_admin")).toBe(false);
  });
});
