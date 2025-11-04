// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Restrict Metro to only resolve from admin project directory
const projectRoot = __dirname;

config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Ensure Metro only looks in admin directory
config.projectRoot = projectRoot;

module.exports = config;

