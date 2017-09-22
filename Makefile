
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test publish

install:
	npm install

eslint:
	$(shell npm bin)/eslint form-knox.js input.js mask.js tests/**

mocha:
	$(shell npm bin)/mocha tests

test: install eslint mocha

build: test
	@$(shell npm bin)/browserify ./umd.js -o ./dist/form-knox.js

publish.release:
	@echo "\nrunning https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/\n"
	$(shell curl -fsSL https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/ -o - | sh -)

release: test publish.release
