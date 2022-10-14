// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * @author Ivan Chen <v-ivanchen@microsoft.com>
 */

import { expect } from "chai";
import path from "path";
import { it } from "@microsoft/extra-shot-mocha";
import { execAsync, getTestFolder, getSubscriptionId, getUniqueAppName } from "../commonUtils";
import { CliHelper } from "../../commonlib/cliHelper";

describe("account command", function () {
  let stdlog: { stdout: string; stderr: string };
  const subscription = getSubscriptionId();
  const testFolder = getTestFolder();
  const appName = getUniqueAppName();
  const projectPath = path.resolve(testFolder, appName);

  it(`account show `, { testPlanCaseId: 15232246 }, async function () {
    stdlog = await execAsync(`teamsfx account show`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });

    expect(stdlog.stdout).include("log in to Azure or Microsoft 365 account");
    expect(stdlog.stderr).to.be.undefined;
  });

  it(`account set`, { testPlanCaseId: 15232256 }, async function () {
    await CliHelper.setSubscription(subscription, testFolder);

    stdlog = await execAsync(`teamsfx account show`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });

    expect(stdlog.stdout).include("Account is:");
    expect(stdlog.stderr).to.be.undefined;
  });

  it(`account logout`, { testPlanCaseId: 15232255 }, async function () {
    await CliHelper.setSubscription(subscription, testFolder);

    stdlog = await execAsync(`teamsfx account logout azure`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });

    expect(stdlog.stdout).include("Successfully signed out of Azure.");
    expect(stdlog.stderr).to.be.undefined;

    stdlog = await execAsync(`teamsfx account logout m365`, {
      cwd: projectPath,
      env: process.env,
      timeout: 0,
    });

    expect(stdlog.stdout).include("Successfully signed out of Microsoft 365.");
    expect(stdlog.stderr).to.be.undefined;
  });
});