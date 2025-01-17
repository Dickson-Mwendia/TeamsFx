export const projectProperties = {
  projectTypes: {
    taskpane: {
      displayname: "Outlook Taskpane Add-in (preview)",
      detail: "A ribbon button and taskpane for use with Outlook",
      manifestPath: "manifest.json",
      templates: {
        typescript: {
          repository: "https://github.com/OfficeDev/Office-Addin-TaskPane",
          branch: "json-preview-yo-office",
          prerelease: "json-preview-yo-office-prerelease",
        },
      },
      supportedHosts: ["Outlook"],
    },
  },
  hostTypes: {
    excel: {
      displayname: "Excel",
    },
    onenote: {
      displayname: "OneNote",
    },
    outlook: {
      displayname: "Outlook",
    },
    powerpoint: {
      displayname: "PowerPoint",
    },
    project: {
      displayname: "Project",
    },
    word: {
      displayname: "Word",
    },
  },
};
