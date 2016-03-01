module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compass: {                  // Task
        dist: {                 // Target
            options: {          // Target options
                sassDir: 'assets/sass',
                cssDir: 'assets/css',
                imagesDir: 'assets/imgs',
                fontsDir: 'assets/fonts',
                outputStyle: 'expanded'
            }
        }
    },

    watch: {
  		sass: {
  			files: ['assets/sass/**/*.scss'],
  			tasks: ['compass','cssmin'],
  			options: {
  			  spawn: false,
  			}
  		}
  	},

  	cssmin: {
        options: {
            keepSpecialComments: 0,
            report: 'gzip'
        },
        minify: {
            src: ['assets/css/style.css'],
            dest: 'assets/css/style.min.css',
        }
    },

    imagemin: {
  		all: {
  			files: [{
  				expand: true,
  				cwd: 'assets/imgs',
  				src: ['**/*.{png,jpg,gif}'],
  				dest: 'assets/imgs'
  			}]
  		}
  	},

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  grunt.registerTask('css', ['compass','cssmin','imagemin']);
  grunt.registerTask('default', ['watch']);
};