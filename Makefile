
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test publish

install:
	npm install

lint:
	$(shell npm bin)/eslint form-knox.js input.js mask.js tests/**

build: install lint
	mkdir -p dist
	# $(shell npm bin)/rollup src/bundle.js --output.format cjs --output.file dist/bundle.js
	cp src/bundle.cjs.js dist/bundle.js
	$(shell npm bin)/rollup src/bundle.js --output.format umd --output.file dist/bundle.umd.js -n formKnox

	$(shell npm bin)/rollup src/form-knox.js --output.format cjs --output.file dist/form-knox.js
	$(shell npm bin)/rollup src/input.js --output.format cjs --output.file dist/input.js
	$(shell npm bin)/rollup src/mask.js --output.format cjs --output.file dist/mask.js
	$(shell npm bin)/rollup src/env.js --output.format cjs --output.file dist/env.js

mocha:
	$(shell npm bin)/mocha tests

test: build mocha

# publish.release:
# 	@echo "\nrunning https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/\n"
# 	$(shell curl -fsSL https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/ -o - | sh -)

# release: build publish.release

npm.increaseVersion:
	npm version patch --no-git-tag-version

npm.pushVersion: npm.increaseVersion
	git commit -a -n -m "v$(shell node -e "process.stdout.write(require('./package').version + '\n')")" 2> /dev/null; true
	git push origin $(master_branch)

git.tag: export PKG_VERSION=$(shell node -e "process.stdout.write('v'+require('./package.json').version);")
git.tag:
	git pull --tags
	git add dist -f --all
	-git commit -n -m "${PKG_VERSION}" 2> /dev/null; true
	git tag -a $(PKG_VERSION) -m "$(PKG_VERSION)"
	git push --tags
	# git push origin $(git_branch)

npm.publish: test npm.pushVersion git.tag
	cp README.md dist/README.md
	cp package.json dist/package.json
	cp -r src dist/es6
	cd dist && npm publish

	git reset --soft HEAD~1
	git reset HEAD
	# git reset --hard origin/$(git_branch)
	@git checkout $(git_branch)

github.release: export PKG_NAME=$(shell node -e "console.log(require('./package.json').name);")
github.release: export PKG_VERSION=$(shell node -e "process.stdout.write('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/form-knox/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

release: npm.publish github.release

.DEFAULT_GOAL := build
