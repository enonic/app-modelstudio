import inject from '@rollup/plugin-inject';
import autoprefixer from 'autoprefixer';
import {readdirSync, readFileSync} from 'node:fs';
import cssnano from 'cssnano';
import path from 'path';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import {fileURLToPath} from 'url';
import {defineConfig, type Plugin, type UserConfig} from 'vite';

const allowedTargets = ['js', 'css'] as const;
type BuildTarget = (typeof allowedTargets)[number];

const isBuildTarget = (target: string | undefined): target is BuildTarget => {
  return allowedTargets.includes(target as BuildTarget);
};

const __dirname = path.dirname(fileURLToPath(import.meta.url)) ?? '';

export default defineConfig(({mode}) => {
  const {BUILD_TARGET} = process.env;
  const target = isBuildTarget(BUILD_TARGET) ? BUILD_TARGET : 'js';

  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  const IN_PATH = path.join(__dirname, 'src/main/resources/assets');
  const OUT_PATH = path.join(__dirname, 'build/resources/main/assets');
  const LIB_ADMIN_UI_PATH = path.join(__dirname, '.xp/dev/lib-admin-ui');

  const copyStatic = (dirs: string[]): Plugin => ({
    name: 'modelstudio:copy-static',
    apply: 'build',
    generateBundle() {
      const walk = (dir: string): string[] =>
        readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
          const full = path.join(dir, entry.name);
          return entry.isDirectory() ? walk(full) : [full];
        });

      for (const dir of dirs) {
        for (const file of walk(path.join(IN_PATH, dir))) {
          if (file.endsWith('.less')) {
            continue;
          }
          this.emitFile({
            type: 'asset',
            fileName: path.relative(IN_PATH, file).split(path.sep).join('/'),
            source: readFileSync(file)
          });
        }
      }
    }
  });

  const CONFIGS: Record<BuildTarget, UserConfig> = {
    js: {
      root: IN_PATH,
      base: './',

      plugins: [copyStatic(['icons'])],

      build: {
        outDir: OUT_PATH,
        emptyOutDir: false,
        target: 'ES2023',
        minify: isProduction,
        sourcemap: isDevelopment,
        modulePreload: false,
        ...(isProduction && {
          reportCompressedSize: true,
          chunkSizeWarningLimit: 2000
        }),
        rollupOptions: {
          plugins: [
            inject({
              $: 'jquery',
              jQuery: 'jquery',
              'window.jQuery': 'jquery'
            }),
          ],
          input: {
            'js/bundle': path.join(IN_PATH, 'js/main.ts')
          },
          output: {
            format: 'iife',
            entryFileNames: '[name].js',
            keepNames: true
          }
        }
      },
      resolve: {
        alias: {
          '@enonic/lib-admin-ui': LIB_ADMIN_UI_PATH
        },
        extensions: ['.ts', '.js']
      },
      ...(isProduction && {
        logLevel: 'warn'
      })
    },
    css: {
      root: IN_PATH,
      base: './',
      build: {
        outDir: OUT_PATH,
        emptyOutDir: false,
        minify: isProduction,
        sourcemap: isDevelopment,
        assetsInlineLimit: 0,
        rollupOptions: {
          input: {
            'styles/main': path.join(IN_PATH, 'styles/main.less')
          },
          output: {
            assetFileNames: (assetInfo) => {
              const assetName = assetInfo.names?.[0] ?? '';
              if (assetName.endsWith('.css')) {
                const name = assetName.replace(/\.(less|css)$/, '');
                return `${name}.css`;
              }
              if (/\.(woff|woff2|ttf|eot)$/.test(assetName)) {
                return 'icons/fonts/[name][extname]';
              }
              if (/\.(svg|png|jpg|gif|ico)$/.test(assetName)) {
                return 'icons/[name][extname]';
              }
              return '[name][extname]';
            }
          }
        }
      },
      resolve: {
        alias: {
          '~enonic-admin-artifacts': 'enonic-admin-artifacts/index.less'
        },
        extensions: ['.less', '.css']
      },
      css: {
        preprocessorOptions: {
          less: {
            javascriptEnabled: true
          }
        },
        postcss: {
          plugins: [
            autoprefixer(),
            postcssSortMediaQueries({sort: 'desktop-first'}),
            ...(isProduction ? [cssnano({preset: ['default', {normalizeUrl: false}]})] : [])
          ]
        }
      }
    }
  };

  return CONFIGS[target];
});
