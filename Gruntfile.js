module.exports = function (grunt) {
  const CONFIG = {
    uglify: {
      tracker: {
        options: {
          report: 'min',
          mangle: true,
          compress: true
        },
        src: [
          './src/tracking.js'
        ],
        dest: './public/min.js'
      }
    },
    clean: {
      tracker: {
        src: ['./public/min.js']
      }
    }
  };

  grunt.initConfig(CONFIG);

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks
  grunt.registerTask('build', ['clean:tracker', 'uglify:tracker']);
  grunt.registerTask('default', ['build']);
};
