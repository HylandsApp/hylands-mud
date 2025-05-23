#!/usr/bin/env node
'use strict';

const cp = require('child_process');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const gitRoot = cp.execSync('git rev-parse --show-toplevel').toString('utf8').trim();
process.chdir(gitRoot);

async function prompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Do you want to install the Hylands bundles? [Y/n] ', resolve);
  });
}

async function main() {

  try {
    let answer = await prompt();

    if (answer === 'n') {
      throw 'foo';
    }
  } catch (err) {
    console.log('Done.');
    process.exit(0);
  }

  const githubPath = 'https://github.com/HylandsApp/';
  const defaultBundles = [
    'https://github.com/HylandsApp/hylands-areas',
    'https://github.com/HylandsApp/hylands-channels',
    'https://github.com/HylandsApp/hylands-classes',
    'https://github.com/HylandsApp/hylands-combat',
    'https://github.com/HylandsApp/hylands-commands',
    'https://github.com/HylandsApp/hylands-debug',
    'https://github.com/HylandsApp/hylands-effects',
    'https://github.com/HylandsApp/hylands-input-events',
    'https://github.com/HylandsApp/hylands-lib',
    'https://github.com/HylandsApp/hylands-npc-behaviors',
    'https://github.com/HylandsApp/hylands-player-events',
    'https://github.com/HylandsApp/hylands-quests',
    'https://github.com/HylandsApp/hylands-crafting',
    'https://github.com/HylandsApp/hylands-vendor-npcs',
    'https://github.com/HylandsApp/hylands-player-groups',
    'https://github.com/HylandsApp/hylands-progressive-respawn',
    'https://github.com/HylandsApp/hylands-telnet-networking',
    'https://github.com/HylandsApp/hylands-websocket-networking',
  ];
  const enabledBundles = [];

  const modified = cp.execSync('git status -uno --porcelain').toString();
  if (modified) {
    console.warn('You have uncommitted changes. For safety setup-bundles must be run on a clean repository.');
    process.exit(1);
  }

  // add each bundle as a submodule
  for (const bundle of defaultBundles) {
    const bundlePath = `bundles/${bundle}`;
    cp.execSync(`npm run install-bundle ${bundle}`);
  }
  console.info('Done.');

  console.info('Enabling bundles...');
  const ranvierJsonPath = __dirname + '/../ranvier.json';
  const ranvierJson = require(ranvierJsonPath);
  ranvierJson.bundles = defaultBundles.map(bundle => bundle.replace(/^.+\/([a-z\-]+)$/, '$1'));
  fs.writeFileSync(ranvierJsonPath, JSON.stringify(ranvierJson, null, 2));
  console.info('Done.');

  cp.execSync('git add ranvier.json');

  console.info(`
-------------------------------------------------------------------------------
Example bundles have been installed as submodules. It's recommended that you now
run the following commands:

  git commit -m "Install bundles"

You've installed the Hylands bundles! See https://ranviermud.com for guides and engine and API references
`);

  process.exit(0);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
