import browserSync from 'browser-sync';

browserSync.init({
  proxy: 'http://localhost:3000',
  files: [
    'src/views/**/*.ejs',
    'src/public/css/**/*.css',
    'src/public/js/**/*.js',
  ],
  port: 3001,
  notify: false,
  open: true,
});
