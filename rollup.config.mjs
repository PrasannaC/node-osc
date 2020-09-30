import { promises } from 'fs';

const { readdir, stat } = promises;

async function walk(root, result=[]) {
  const rootURL = new URL(root, import.meta.url);
  const paths = await readdir(rootURL);
  for (const path of paths) {
    const stats = await stat(new URL(path, rootURL));
    if (stats.isDirectory()) {
      await walk(`${root}${path}/`, result);
    }
    else {
      result.push({
        input: `${root}${path}`,
        dir: `dist/${root}`
      });
    }
  }
  return result;
}

async function walkLib(config) {
  const files = await walk('./lib/');
  files.forEach(({input, dir}) => {
    config.push({
      input,
      output: {
        entryFileNames: '[name].js',
        dir,
        format: 'cjs',
        exports: 'auto'
      },
      preserveModules: true,
      external: [
        'dgram',
        'events',
        'osc-min',
        '#internal/decode',
        '#internal/types',
        'jspack'
      ]
    });
  });
}

async function walkTest(config) {
  const tests = await walk('./test/');
  tests.forEach(({input, dir}) => {
    config.push({
      input,
      output: {
        entryFileNames: '[name].js',
        dir,
        format: 'cjs',
      },
      preserveModules: true,
      external: [
        'get-port',
        'node-osc',
        '#internal/decode',
        '#internal/types',
        'tap'
      ]
    })
  });
}

const config = [];

await Promise.all([
  walkLib(config),
  walkTest(config)
]);

export default config;
