function buildcopy() {
    return src([
            'app/js/*.min.js',
            'app/css/*.min.css',
            'app/*.html',
            'app/images/dest/*'
        ], { base: 'app' })
        .pipe(dest('dist/'))
}

console.log('Привет из прошлого! Толя, ты сейчас богат!)')