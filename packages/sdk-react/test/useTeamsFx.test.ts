// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react-hooks";
import * as useTeams from "../src/useTeams";
import * as useData from "../src/useData";
import { useTeamsFx } from "../src/useTeamsFx";
import { teamsTheme } from "@fluentui/react-northstar";
import { TeamsFx } from "@microsoft/teamsfx";

describe("useTeamsFx() hook tests", () => {
  let spyUseTeams: jest.SpyInstance;
  let spyUseData: jest.SpyInstance;

  beforeEach(() => {
    spyUseTeams = jest.spyOn(useTeams, "useTeams");
    spyUseTeams.mockImplementation(() => {
      return [
        { inTeams: true, theme: teamsTheme, themeString: "default" },
        { setTheme: (undefined) => {} },
      ];
    });
    spyUseData = jest.spyOn(useData, "useData");
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("returns default teamsfx instance", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTeamsFx({}));
    expect(result.current.teamsfx).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(true);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");

    await waitForNextUpdate();
    expect(result.current.teamsfx).toBeInstanceOf(TeamsFx);
    expect(result.current.error).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");
  });

  it("returns useData() error", async () => {
    spyUseData.mockImplementation(() => {
      return { error: "useData error", loading: false };
    });
    const { result } = renderHook(() => useTeamsFx({}));
    expect(result.current.teamsfx).toBeUndefined;
    expect(result.current.error).toBe("useData error");
    expect(result.current.loading).toBe(false);
    expect(result.current.inTeams).toBe(true);
    expect(result.current.themeString).toBe("default");
  });
});
