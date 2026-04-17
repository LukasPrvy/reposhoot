#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const {execSync} = require('child_process');

const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

const extensions = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
  '.jsx',
  '.tsx',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.styl',
  '.vue',
  '.svelte',
  '.astro',
  '.c',
  '.cpp',
  '.cc',
  '.cxx',
  '.h',
  '.hpp',
  '.hxx',
  '.hh',
  '.rs',
  '.go',
  '.zig',
  '.nim',
  '.v',
  '.d',
  '.java',
  '.kt',
  '.kts',
  '.scala',
  '.groovy',
  '.gradle',
  '.cs',
  '.fs',
  '.vb',
  '.cshtml',
  '.razor',
  '.xaml',
  '.csproj',
  '.fsproj',
  '.sln',
  '.py',
  '.pyi',
  '.rb',
  '.php',
  '.lua',
  '.pl',
  '.pm',
  '.t',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.psm1',
  '.bat',
  '.cmd',
  '.r',
  '.R',
  '.jl',
  '.tcl',
  '.awk',
  '.sed',
  '.hs',
  '.lhs',
  '.ml',
  '.mli',
  '.fs',
  '.fsi',
  '.fsx',
  '.clj',
  '.cljs',
  '.cljc',
  '.edn',
  '.ex',
  '.exs',
  '.erl',
  '.hrl',
  '.elm',
  '.purs',
  '.rkt',
  '.scm',
  '.ss',
  '.lisp',
  '.cl',
  '.el',
  '.ocaml',
  '.re',
  '.rei',
  '.swift',
  '.m',
  '.mm',
  '.dart',
  '.kt',
  '.json',
  '.jsonc',
  '.json5',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.ini',
  '.cfg',
  '.conf',
  '.properties',
  '.env.example',
  '.graphql',
  '.gql',
  '.proto',
  '.thrift',
  '.avsc',
  '.md',
  '.mdx',
  '.rst',
  '.adoc',
  '.tex',
  '.typ',
  '.org',
  '.wiki',
  '.txt',
  '.sql',
  '.hql',
  '.cql',
  '.prisma',
  '.tf',
  '.hcl',
  '.nix',
  '.dhall',
  '.dockerfile',
  '.containerfile',
  '.cmake',
  '.mk',
  '.makefile',
  '.meson',
  '.bzl',
  '.bazel',
  '.buck',
  '.wasm',
  '.wat',
  '.sol',
  '.vy',
  '.move',
  '.sv',
  '.svh',
  '.vhd',
  '.vhdl',
  '.pde',
  '.ino',
  '.r',
  '.rmd',
  '.qmd',
  '.tf',
  '.tfvars',
  '.pp',
  '.erb',
  '.hx',
  '.as',
  '.pas',
  '.dpr',
  '.f90',
  '.f95',
  '.f03',
  '.f',
  '.for',
  '.cob',
  '.cbl',
  '.cpy',
  '.ada',
  '.adb',
  '.ads',
  '.pro',
  '.P',
  '.4th',
  '.fs',
  '.fth',
  '.coffee',
  '.litcoffee',
  '.cr',
  '.gd',
  '.wren',
  '.odin',
  '.jai',
]);

const skipDirs = new Set([
  'node_modules',
  '.git',
  'vendor',
  'dist',
  'build',
  '__pycache__',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.output',
  '.vercel',
  '.netlify',
  'target',
  'out',
  'bin',
  'obj',
  'pkg',
  '.idea',
  '.vscode',
  '.vs',
  '.eclipse',
  'coverage',
  '.cache',
  '.parcel-cache',
  '.turbo',
  '.tox',
  '.mypy_cache',
  '.pytest_cache',
  '.ruff_cache',
  'venv',
  '.venv',
  'env',
  '.env',
  '_build',
  'deps',
  '.elixir_ls',
  '.stack-work',
  '.cabal-sandbox',
  'Pods',
  '.gradle',
  '.dart_tool',
  '.pub-cache',
  'bower_components',
  'jspm_packages',
  '.terraform',
  '.pulumi',
  'CMakeFiles',
  '_deps',
]);

function printInfo(msg) {
  console.log(`${colors.cyan}${msg}${colors.reset}`);
}

function printSuccess(msg) {
  console.log(`${colors.green}${msg}${colors.reset}`);
}

function printError(msg) {
  console.error(`${colors.red}${msg}${colors.reset}`);
}

function printWarning(msg) {
  console.log(`${colors.yellow}${msg}${colors.reset}`);
}

function showHelp() {
  console.log(`
${colors.cyan}REPOSHOOT${colors.reset} - Space shooter built from your code

${colors.yellow}Usage:${colors.reset}
  reposhoot [options]

  Run inside any code repository. The current directory's source files
  become the walls of the game corridor.

${colors.yellow}Options:${colors.reset}
  --port <number>   Port to run the server on (default: 3000)
  --no-open         Don't automatically open the browser
  --help            Show this help message

${colors.yellow}Examples:${colors.reset}
  cd my-project && reposhoot
  reposhoot --port 8080
`);
  process.exit(0);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    port: 3000,
    openBrowser: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help') {
      showHelp();
    } else if (arg === '--port') {
      result.port = parseInt(args[++i], 10);
      if (isNaN(result.port)) {
        printError('Error: --port requires a valid number');
        process.exit(1);
      }
    } else if (arg === '--no-open') {
      result.openBrowser = false;
    }
  }

  return result;
}

function walkDirectory(dir, baseDir) {
  if (!baseDir) baseDir = dir;
  const files = [];

  try {
    const entries = fs.readdirSync(dir, {withFileTypes: true});

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        files.push(...walkDirectory(fullPath, baseDir));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();

        if (extensions.has(ext)) {
          const stats = fs.statSync(fullPath);
          if (stats.size > 100 * 1024) continue;
          files.push({
            name: relativePath,
            fullPath: fullPath,
          });
        }
      }
    }
  } catch (err) {}

  return files;
}

function openBrowserWindow(port) {
  const platform = os.platform();
  const serverUrl = `http://localhost:${port}`;

  try {
    if (platform === 'darwin') {
      execSync(`open "${serverUrl}"`, {stdio: 'ignore'});
    } else if (platform === 'linux') {
      execSync(`xdg-open "${serverUrl}"`, {stdio: 'ignore'});
    } else if (platform === 'win32') {
      execSync(`start "" "${serverUrl}"`, {stdio: 'ignore', shell: true});
    }
    printSuccess(`Browser opened at ${serverUrl}`);
  } catch (err) {
    printWarning('Could not open browser automatically');
    printInfo(`Open ${serverUrl} in your browser`);
  }
}

function main() {
  process.on('SIGINT', () => {
    printInfo('\nShutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    process.exit(0);
  });

  console.log(`
${colors.cyan}REPOSHOOT${colors.reset}
${colors.cyan}==========${colors.reset}
`);

  try {
    const opts = parseArgs();
    const repoDir = process.cwd();

    printInfo(`Scanning ${repoDir} ...`);
    const files = walkDirectory(repoDir);

    if (files.length === 0) {
      printError('No code files found in current directory');
      process.exit(1);
    }

    // Group by parent directory, shuffle within each, then round-robin
    // so the stream shows a varied mix from across the repo
    const dirGroups = {};
    for (const file of files) {
      const dir = path.dirname(file.name) || '.';
      if (!dirGroups[dir]) dirGroups[dir] = [];
      dirGroups[dir].push(file);
    }

    const groupKeys = Object.keys(dirGroups);
    for (const key of groupKeys) {
      const group = dirGroups[key];
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]];
      }
    }
    for (let i = groupKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
    }

    const filePaths = [];
    let more = true;
    let ri = 0;
    while (more) {
      more = false;
      for (const key of groupKeys) {
        if (ri < dirGroups[key].length) {
          filePaths.push(dirGroups[key][ri]);
          more = true;
        }
      }
      ri++;
    }

    printInfo(`Found ${filePaths.length} source files`);
    printInfo(`Starting server on port ${opts.port}...`);
    const {startServer} = require('../src/server');
    startServer(filePaths, opts.port, function (actualPort, err) {
      if (err) {
        printError('Could not start server: ' + err.message);
        process.exit(1);
      }
      if (actualPort !== opts.port) {
        printWarning(`Port ${opts.port} in use, using ${actualPort} instead`);
      }
      printSuccess(`Server running at http://localhost:${actualPort}`);
      if (opts.openBrowser) {
        openBrowserWindow(actualPort);
      } else {
        printInfo(`Open http://localhost:${actualPort} in your browser`);
      }
    });
  } catch (err) {
    printError(err.message || 'An error occurred');
    process.exit(1);
  }
}

main();
