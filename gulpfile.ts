import del from 'del';
import path from 'path';

import { src, dest, watch, series, parallel } from 'gulp';

import typescript from 'gulp-typescript';
import sourcemaps from 'gulp-sourcemaps';
import nodemon from 'gulp-nodemon';
import alias from 'gulp-ts-alias';

const project = typescript.createProject('tsconfig.json');

function clean(cb: Function) {
    del.sync(['./build/**']);
    cb();
}

function build() {
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
    return watch('src/**/*.*', series(build));
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

exports.clean = clean;
exports.build = series(clean, build);
exports.watch = series(clean, build, update);
exports.start = series(clean, build, start);
exports.serve = series(clean, build, parallel(update, serve));
exports.default = series(clean, build);
