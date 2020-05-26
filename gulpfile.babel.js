import gulp from 'gulp'
import yargs from 'yargs'
import postcss from 'gulp-postcss'
import sass from 'gulp-sass'
// import cleancss from 'gulp-clean-css'
import sourcemaps from 'gulp-sourcemaps'
// import rename from 'gulp-rename'
import gulpif from 'gulp-if'
import imageMin from 'gulp-imagemin'
import del from 'del'
import webpack from 'webpack-stream'
import named from 'vinyl-named'
import BrowserSync from 'browser-sync'
import zip from 'gulp-zip'
import replace from 'gulp-replace'
import info from './package.json'

// import postcssFunction from './postcss.config'
import webpackConfig from './webpack.config'

const PRODUCTION = yargs.argv.prod
// const postcssConfig = postcssFunction(PRODUCTION)

const browserSync = BrowserSync.create()
export const serve = (done) => {
  browserSync.init({
    proxy: 'sites.local/wordpress/starter'
  })
  done()
}

export const reload = (done) => {
  browserSync.reload()
  done()
}

const paths = {
  styles: {
    src: 'sass/*.scss',
    dest: 'dist/styles',
    watchsrc: 'sass/**/*.scss'
  },
  scripts: {
    src: ['js/app.js', 'js/admin.js'],
    watchsrc: 'js/**/*.js',
    dest: 'dist/scripts'
  },
  images: {
    src: 'src/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/images'
  },
  others: {
    src: ['src/**/*', '!src/{images,js,scss}', '!src/{images,js,scss}/**/*'],
    dest: 'dist'
  },
  pack: {
    src: ['**/*', '!node_modules{,/**}', '!bundle{,/**}', '!src{,/**}', '!gulpfile.babel.js', '!package.json', '!package-lock.json', '!vendor{,/**}', '!phpcs.xml.dist', '!postcss.config.js', '!webpack.config.js', '!composer.json', '!composer.lock', 'LICENSE'],
    dest: 'bundle'
  }
}

export const styles = () => {
  return gulp.src(paths.styles.src)
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(PRODUCTION, postcss([require('autoprefixer'), require('cssnano')])))
    // .pipe(gulpif(PRODUCTION, cleancss({ compatibility: 'ie8' })))
    // .pipe(postcss(postcssConfig.plugins, postcssConfig.options))
    // .pipe(rename({
    // extname: '.css'
    // }))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

export const scripts = () => {
  return gulp.src(paths.scripts.src)
    .pipe(named())
    .pipe(webpack(webpackConfig(PRODUCTION)))
    .pipe(gulp.dest(paths.scripts.dest))
}
export const images = () => {
  return gulp.src(paths.images.src)
    .pipe(gulpif(PRODUCTION, imageMin()))
    .pipe(gulp.dest(paths.images.dest))
}

export const copy = () => {
  return gulp.src(paths.others.src)
    .pipe(gulp.dest(paths.others.dest))
}

export const clean = () => del(['dist'])

export const watch = () => {
  gulp.watch(paths.styles.watchsrc, styles)
  gulp.watch(paths.scripts.watchsrc, gulp.series(scripts, reload))
  gulp.watch('**/*.php', reload)
  gulp.watch(paths.images.src, gulp.series(images, reload))
  gulp.watch(paths.others.src, gulp.series(copy, reload))
}

export const pack = () => {
  return gulp.src(paths.pack.src)
    .pipe(replace('ft', info.name))
    .pipe(zip(`${info.name}.zip`))
    .pipe(gulp.dest(paths.pack.dest))
}

export const dev = gulp.series(clean, gulp.parallel(styles, scripts, images, copy), serve, watch)
export const build = gulp.series(clean, gulp.parallel(styles, scripts, images, copy))
export const bundle = gulp.series(build, pack)
export default dev
