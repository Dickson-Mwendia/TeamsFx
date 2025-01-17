// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import "mocha";
import * as chai from "chai";
import { AppLocalYmlGenerator } from "../../../../src/core/middleware/utils/debug/appLocalYmlGenerator";
import { ProjectSettings } from "@microsoft/teamsfx-api";
import * as yaml from "js-yaml";

describe("AppLocalYmlGenerator", () => {
  it("empty deploy", async () => {
    const appLocalYmlGenerator = new AppLocalYmlGenerator(generateProjectSettings(), {}, {});
    const res = await appLocalYmlGenerator.generateAppYml();
    const obj = yaml.load(res) as any;

    chai.assert.isUndefined(obj.deploy);
  });

  it("dev cert", async () => {
    const appLocalYmlGenerator = new AppLocalYmlGenerator(
      generateProjectSettings(),
      {
        deploy: { tools: { devCert: { trust: true } } },
      },
      {}
    );
    const res = await appLocalYmlGenerator.generateAppYml();
    const obj = yaml.load(res) as any;

    chai.assert.deepEqual(obj.deploy, [
      { uses: "prerequisite/install", with: { devCert: { trust: true } } },
    ]);
  });

  it("empty npm install", async () => {
    const appLocalYmlGenerator = new AppLocalYmlGenerator(
      generateProjectSettings(),
      {
        deploy: { npmCommands: [] },
      },
      {}
    );
    const res = await appLocalYmlGenerator.generateAppYml();
    const obj = yaml.load(res) as any;
    chai.assert.isNull(obj.deploy);
  });

  it("npm install", async () => {
    const appLocalYmlGenerator = new AppLocalYmlGenerator(
      generateProjectSettings(),
      {
        deploy: { npmCommands: [{ args: "install" }] },
      },
      {}
    );
    const res = await appLocalYmlGenerator.generateAppYml();
    const obj = yaml.load(res) as any;
    chai.assert.deepEqual(obj.deploy, [{ uses: "cli/runNpmCommand", with: { args: "install" } }]);
  });
});

function generateProjectSettings(): ProjectSettings {
  return {
    projectId: "",
    programmingLanguage: "typescript",
    solutionSettings: {
      name: "fx-solution-azure",
      hostType: "Azure",
      capabilities: [],
      azureResources: [],
      activeResourcePlugins: [],
    },
  };
}
