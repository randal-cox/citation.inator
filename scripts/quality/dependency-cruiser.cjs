module.exports = {
  forbidden: [
    {
      name: "no-circular-modules",
      severity: "error",
      from: { path: "^src/" },
      to: { circular: true },
    },
    {
      name: "library-does-not-import-tooling",
      severity: "error",
      from: { path: "^src/" },
      to: { path: "^(scripts|test|learn|demos)/" },
    },
    {
      name: "portable-library-has-no-node-builtins",
      severity: "error",
      from: { path: "^src/" },
      to: { dependencyTypes: ["core"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: "(?:^|/)(?:[^/]* [0-9]+\\.[^/]+)$",
    moduleSystems: ["es6", "cjs"],
    tsPreCompilationDeps: false,
  },
};
