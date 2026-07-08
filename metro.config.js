const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK's package.json "exports" field resolves to a build that
// breaks initializeAuth() under Metro's package-exports resolution.
// https://github.com/firebase/firebase-js-sdk/issues/8107
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
