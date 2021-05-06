/*
струткуру папкок

source_folder
    scss
        scss_blocks
    html_blocks
    js
    img
    fonts

project_folder
    css
    js
    img
    fonts
*/


const project_folder = 'dist';
const source_folder = '#src';

const preprocessor = 'scss';

const path = {

    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts"
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/**/_*.html'],
        css: [source_folder + '/' + preprocessor + '/*.' + preprocessor],
        js: source_folder + '/js/**/*.js',
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.{ttf,otf,woff}"
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + '/' + preprocessor + '/**/*.' + preprocessor,
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.{ttf,otf,woff}"
    },
    clean: './' + project_folder + '/',
    server: './' + project_folder + '/'
}


const { src, dest, series, parallel, watch } = require('gulp'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default,
    fileinclude = require('gulp-file-include'),
    htmlhint = require('gulp-htmlhint'),
    stripcomment = require('gulp-strip-comments'),
    scss = require('gulp-sass'),
    // less = require('gulp-less'), /* c  less  что-то странное, надо будет выяснить */
    autoprefixer = require('gulp-autoprefixer'),
    cssCommentsDel = require('gulp-strip-css-comments'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    sourcemap = require('gulp-sourcemaps');



const browsersync = () => {
    browserSync.init({
        server: { baseDir: path.server },
        /* baseDir: 'app/' папка которая используется в качестве сервера*/
        port: 3000,
        notify: false,
        online: true
    })
}

const images = () => {
    return src(path.src.img) /*путь по которому проводятся дальнейшие манипуляции */
        // .pipe(newer(project_folder + '/images')) /*проверяет наличие оптимизированных изображений, чтобы не оптимизировать их повторно*/
        .pipe(imagemin()) /*оптимизирует изображения */
        .pipe(dest(path.build.img)) /*выгрузка результата всех предыдущих манипуляций*/
        .pipe(browserSync.stream())
}

const fontcopy = () => {
    return src(path.src.fonts)
        .pipe(newer(path.build.fonts))
        .pipe(dest(path.build.fonts))
}

const html = () => {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(stripcomment())
        .pipe(htmlhint())
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}

const styles = () => {
    return src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(eval(preprocessor)())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(cssCommentsDel()) /*Удаление комментариев*/
        .pipe(dest(path.build.css))
        .pipe(cleancss(({
            level: { 1: { specialComments: 0 } },
            format: 'beautify' /*для чистого читаемого кода*/
        }))) /*cleancss минифицирует css*/
        .pipe(rename('styles.min.css')) /*переименование результата (это уже отдельный файл)*/
        .pipe(sourcemap.write('.')) /*сохраняет карту css кода, чтобы проблему было легко найти в исходнике scs или less*/
        .pipe(dest(path.build.css))
}

const scripts = () => {
    return src(path.src.js)
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}


const cleanimg = () => {
    return del(project_folder + '/img/**/*', { force: true }) /*удаление ненужных изображений */
}

// const cleandb = ()  => {
//     return del(source_folder + '/img/**/*.db', { force: true })
// }

const cleanProjDir = () => {
    return del(project_folder + '/**', { force: true }) /*удаление всех файлов в папке. Наличие параметра { force: true } обязательно, без него не сработает*/
}

const startwatch = () => {
    watch(path.watch.css, styles).on('change', browserSync.reload)
    watch(path.watch.html, html)
    watch(path.watch.js, scripts)
    watch(path.watch.img, images)
    watch(path.watch.fonts, fontcopy)
}



exports.cleanimg = cleanimg;
exports.scripts = scripts;
exports.html = html;
exports.styles = styles;
exports.browsersync = browsersync;
exports.cleanProjDir = cleanProjDir;
exports.default = parallel(fontcopy, cleanimg, images, html, styles, scripts, browsersync, startwatch);