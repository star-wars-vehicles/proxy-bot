import del from 'del';
import path from 'path';

import { src, dest, watch, series, parallel } from 'gulp';

import typescript from 'gulp-typescript';
import tslint from 'gulp-tslint';
import sourcemaps from 'gulp-sourcemaps';
import nodemon from 'gulp-nodemon';
import alias from 'gulp-ts-alias';

const project = typescript.createProject('tsconfig.json');
const linter = require('tslint').Linter.createProgram('tsconfig.json');

function lint() {
  return src('src/**/*.ts')
    .pipe(tslint({ configuration: 'tslint.json', formatter: 'verbose', program: linter }))
    .pipe(tslint.report());
}

function build() {
  del.sync(['./build/**']);

  src('src/**/*.json')
    .pipe(dest('build/'));

  const compiled = src('src/**/*.ts')
    .pipe(alias({ configuration: project.config.compilerOptions }))
    .pipe(sourcemaps.init())
    .pipe(project());

  return compiled.js
    .pipe(sourcemaps.write({ sourceRoot: (file: any) => path.relative(path.join(file.cwd, file.path), file.base) }))
    .pipe(dest('build/'));
}

function update() {
  watch('src/**/*.ts', series(lint, build));
}

function start() {
  return nodemon({
    script: 'build/index.js',
    watch: ['build/index.js'],
  });
}

function serve() {
  return nodemon({
    script: 'build/index.js',
    watch: ['build/'],
  });
}

exports.lint = lint;
exports.build = series(lint, build);
exports.watch = series(lint, build, update);
exports.start = series(lint, build, start);
exports.serve = series(lint, build, parallel(update, serve));
exports.default = series(lint, build);
