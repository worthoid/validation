module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {

			},
			files: ['Gruntfile.js', 'scripts/**/*.js']
		},

		sass: {
			dev: {
				options: {
					sourcemap: true,
					style: 'expanded'
				},
				files: [{
					expand: true,
					cwd: 'styles',
					src: ['*.scss'],
					dest: 'styles',
					ext: '.css'
				}]
			},
			dist: {
				options: {
					style: 'compressed'
				},
				files: [{
					expand: true,
					cwd: 'styles',
					src: ['*.scss'],
					dest: 'styles',
					ext: '.css'
				}]
			}
		},

		scsslint: {
			options: {
				config: 'styles/.scss-lint.yml'
			},
			all: 'styles/**/*.scss'
		},

		validation: {
			options: {
				//failHard: true,
				reportpath: false,
				reset: true
			},
			files: {
				src: ['register.html', 'styles/**/*.svg']
			}
		},

		watch: {
			html: {
				files: 'register.js',
				tasks: ['validation']
			},
			js: {
				files: ['Gruntfile.js', 'scripts/**/*.js'],
				tasks: ['jshint']
			},
			scss: {
				files: 'styles/**/*.scss',
				tasks: ['scss']
			},
			svg: {
				files: 'styles/**/*.svg',
				tasks: ['validation']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-html-validation');
	grunt.loadNpmTasks('grunt-scss-lint');

	grunt.registerTask('default', ['validation', 'scss', 'jshint']);
	grunt.registerTask('build', ['sass:dist']);
	grunt.registerTask('scss', [/*'scsslint',*/ 'sass:dev']);
};
