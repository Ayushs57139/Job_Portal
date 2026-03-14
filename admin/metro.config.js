// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Restrict Metro to only resolve from admin project directory
const projectRoot = __dirname;
const parentRoot = path.resolve(projectRoot, '..');
const parentSrcRoot = path.resolve(parentRoot, 'src');

// Watch both admin and parent src directories
config.watchFolders = [projectRoot, parentSrcRoot, parentRoot];

// Allow resolving from parent directories
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(parentRoot, 'node_modules'),
];

// Add parent src to resolver source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts];

// Ensure Metro can resolve from parent src
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure Metro only looks in admin directory for project root
config.projectRoot = projectRoot;

module.exports = config;

