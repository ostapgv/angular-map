# UI Project Boilerplate

Gather round this shiny boilerplate. Everything you dreamt about at one place.

### This project uses:
* [JSCS](http://jscs.info) - programmatical style guide enforcer.
  * Basic configuration is in .jscsrc file.
  * Sublime text [plugin](https://packagecontrol.io/packages/SublimeLinter-jscs)
  * IntelliJ IDEA, RubyMine, WebStorm, PhpStorm, PyCharm [plugin](https://github.com/idok/jscs-plugin)
* [SCSS-Lint](https://github.com/causes/scss-lint) - The linter for scss files.
  * Requirements: Ruby 1.9.3+, Sass 3.4.1+, SCSS (not SASS) syntax
  * Lint your scss by running ``gulp scssLint`` task or by ``scss-lint [directories]`` command
  * Configuration options can be found in ``.scss-lint.yml``
  * Editor Integration: **Sublime**: [scss-lint plugin](https://sublime.wbond.net/packages/SublimeLinter-contrib-scss-lint); **Vim**: [Syntastic plugin](https://github.com/scrooloose/syntastic); **Atom**: [scss plugin](https://atom.io/packages/linter-scss-lint)
* [JSONLint](http://jsonlint.com/) - The JSON Validator.
  * Run ``gulp jsonLint`` to lint your json files.
  * Sublime text [plugin](https://packagecontrol.io/packages/JSONLint)
  * Vim Plugins:
    * [Syntastic](http://www.vim.org/scripts/script.php?script_id=2736)
    * [sourcebeautify](http://www.vim.org/scripts/script.php?script_id=4079)
