const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports to support modern library structures (like React Navigation 7)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
