import { describe, expect, it, vi } from "vitest";
import { syncTabBarVisibility } from "./tab-bar-visibility";

describe("tab bar visibility", () => {
  it("hides tabs only while onboarding is active", () => {
    const show = vi.fn();
    const hide = vi.fn();
    syncTabBarVisibility(true, { show, hide });
    expect(hide).toHaveBeenCalledOnce();
    expect(show).not.toHaveBeenCalled();
  });

  it("explicitly restores tabs after onboarding or a simulator refresh", () => {
    const show = vi.fn();
    const hide = vi.fn();
    syncTabBarVisibility(false, { show, hide });
    expect(show).toHaveBeenCalledOnce();
    expect(hide).not.toHaveBeenCalled();
  });
});
