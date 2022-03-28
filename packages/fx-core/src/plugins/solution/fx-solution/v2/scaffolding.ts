import {
  v2,
  Inputs,
  FxError,
  Result,
  ok,
  err,
  Void,
  AutoGeneratedReadme,
  Json,
  SystemError,
} from "@microsoft/teamsfx-api";
import {
  AzureSolutionQuestionNames,
  BotOptionItem,
  MessageExtensionItem,
  TabOptionItem,
} from "../question";
import { executeConcurrently, NamedThunk } from "./executor";
import {
  getAzureSolutionSettings,
  getSelectedPlugins,
  fillInSolutionSettings,
  isAzureProject,
} from "./utils";
import { isVSProject } from "../../../../common/projectSettingsHelper";
import path from "path";
import fs from "fs-extra";
import {
  DEFAULT_PERMISSION_REQUEST,
  SolutionError,
  SolutionTelemetryComponentName,
  SolutionTelemetryEvent,
  SolutionTelemetryProperty,
  SolutionTelemetrySuccess,
} from "../constants";
import { ResourcePluginsV2 } from "../ResourcePluginContainer";
import { Container } from "typedi";
import { scaffoldLocalDebugSettings } from "../debug/scaffolding";
import { getTemplatesFolder } from "../../../../folder";
import { getLocalizedString } from "../../../../common/localizeUtils";

export async function scaffoldSourceCode(
  ctx: v2.Context,
  inputs: Inputs
): Promise<Result<Void, FxError>> {
  if (inputs.projectPath === undefined) {
    return err(
      new SystemError("Solution", SolutionError.InternelError, "projectPath is undefined")
    );
  }
  const lang = inputs[AzureSolutionQuestionNames.ProgrammingLanguage] as string;
  if (lang) {
    ctx.projectSetting.programmingLanguage = lang;
  }
  const solutionSettings = getAzureSolutionSettings(ctx);
  const fillinRes = fillInSolutionSettings(ctx.projectSetting, inputs);
  if (fillinRes.isErr()) return err(fillinRes.error);
  const plugins = getSelectedPlugins(ctx.projectSetting);

  let thunks: NamedThunk<Void>[] = plugins
    .filter((plugin) => !!plugin.scaffoldSourceCode)
    .map((plugin) => {
      return {
        pluginName: `${plugin.name}`,
        taskName: "scaffoldSourceCode",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        thunk: () => plugin.scaffoldSourceCode!(ctx, inputs),
      };
    });

  ///SPFx plugin will be executed last, so remove it from the thunks.
  const SPFxPlugin = Container.get<v2.ResourcePlugin>(ResourcePluginsV2.SpfxPlugin);
  if (thunks.map((p) => p.pluginName === SPFxPlugin.name).length > 0) {
    thunks = thunks.filter((p) => p.pluginName !== SPFxPlugin.name);
  }
  const result = await executeConcurrently(thunks, ctx.logProvider);
  if (result.kind === "success") {
    const capabilities = solutionSettings?.capabilities || [];
    const azureResources = solutionSettings?.azureResources || [];

    // TODO: move this to if/else part when unify config job is completed
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scaffoldLocalDebugSettingsResult = await scaffoldLocalDebugSettings(ctx, inputs);
    if (scaffoldLocalDebugSettingsResult.isErr()) {
      return scaffoldLocalDebugSettingsResult;
    }
    if (!isVSProject(ctx.projectSetting)) {
      await scaffoldReadme(capabilities, azureResources, inputs.projectPath!);
    }
    if (isAzureProject(solutionSettings)) {
      await fs.writeJSON(`${inputs.projectPath}/permissions.json`, DEFAULT_PERMISSION_REQUEST, {
        spaces: 4,
      });
      ctx.telemetryReporter?.sendTelemetryEvent(SolutionTelemetryEvent.Create, {
        [SolutionTelemetryProperty.Component]: SolutionTelemetryComponentName,
        [SolutionTelemetryProperty.Success]: SolutionTelemetrySuccess.Yes,
        [SolutionTelemetryProperty.Resources]: (solutionSettings?.azureResources || []).join(";"),
        [SolutionTelemetryProperty.Capabilities]: (solutionSettings?.capabilities || []).join(";"),
        [SolutionTelemetryProperty.ProgrammingLanguage]:
          ctx.projectSetting?.programmingLanguage ?? "",
        "host-type": "azure",
      });
    } else {
      //For SPFx plugin, execute it alone lastly
      if (SPFxPlugin.scaffoldSourceCode) {
        const spfxRes = await SPFxPlugin.scaffoldSourceCode(ctx, inputs);
        if (spfxRes.isErr()) {
          return err(spfxRes.error);
        }
        ctx.telemetryReporter?.sendTelemetryEvent(SolutionTelemetryEvent.Create, {
          [SolutionTelemetryProperty.Component]: SolutionTelemetryComponentName,
          [SolutionTelemetryProperty.Success]: SolutionTelemetrySuccess.Yes,
          [SolutionTelemetryProperty.Capabilities]: (solutionSettings?.capabilities || []).join(
            ";"
          ),
          [SolutionTelemetryProperty.ProgrammingLanguage]:
            ctx.projectSetting?.programmingLanguage ?? "",
          "host-type": "spfx",
        });
      }
    }
    ctx.userInteraction.showMessage(
      "info",
      `Success: ${getLocalizedString("core.create.successNotice")}`,
      false
    );
    return ok(Void);
  } else {
    return err(result.error);
  }
}

export async function scaffoldByPlugins(
  ctx: v2.Context,
  inputs: Inputs,
  localSettings: Json,
  plugins: v2.ResourcePlugin[]
): Promise<Result<Void, FxError>> {
  if (plugins.length === 0) return ok(Void);
  ctx.logProvider?.info(`start scaffolding ${plugins.map((p) => p.name).join(",")}.....`);
  const thunks: NamedThunk<Void>[] = plugins
    .filter((plugin) => !!plugin.scaffoldSourceCode)
    .map((plugin) => {
      return {
        pluginName: `${plugin.name}`,
        taskName: "scaffoldSourceCode",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        thunk: () => plugin.scaffoldSourceCode!(ctx, inputs),
      };
    });

  const result = await executeConcurrently(thunks, ctx.logProvider);
  const solutionSettings = getAzureSolutionSettings(ctx);
  if (result.kind === "success") {
    const capabilities = solutionSettings?.capabilities || [];
    const azureResources = solutionSettings?.azureResources || [];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await scaffoldReadme(capabilities, azureResources, inputs.projectPath!);

    ctx.userInteraction.showMessage(
      "info",
      `Success: ${getLocalizedString("core.create.successNotice")}`,
      false
    );
    ctx.logProvider?.info(`finish scaffolding ${plugins.map((p) => p.name).join(",")}!`);
    return ok(Void);
  } else {
    ctx.logProvider?.info(`failed to scaffold ${plugins.map((p) => p.name).join(",")}!`);
    return err(result.error);
  }
}

export async function scaffoldReadme(
  capabilities: string[],
  azureResources: string[],
  projectPath: string
): Promise<void> {
  capabilities = capabilities || [];
  azureResources = azureResources || [];
  const hasBot = capabilities.includes(BotOptionItem.id);
  const hasMsgExt = capabilities.includes(MessageExtensionItem.id);
  const hasTab = capabilities.includes(TabOptionItem.id);
  if (hasTab && (hasBot || hasMsgExt)) {
    const readme = path.join(getTemplatesFolder(), "plugins", "solution", "README.md");
    if (await fs.pathExists(readme)) {
      await fs.copy(readme, `${projectPath}/${AutoGeneratedReadme}`);
    }
  }
}
