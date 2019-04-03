module.exports = function (grunt) {

  grunt.initConfig({
    nwjs: {
      options: {
          platforms: ['win64','osx64', 'linux64'],
          buildDir: './dist', // Where the build version of my NW.js app is saved
      },
      src: ['./build/**'] // Your NW.js app
    },
  })

  // then we load task package via "grunt.loadNpmTasks"
  grunt.loadNpmTasks('grunt-nw-builder');

  // optionally we can add a task to some named group, such as "default build"

};  