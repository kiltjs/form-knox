
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test publish

install:
	npm install

lint:
	$(shell npm bin)/eslint src/** tests/**

mocha:
	$(shell npm bin)/mocha --require babel-core/register tests

test: lint mocha

build: install test
	@# $(shell npm bin)/rollup src/form-knox.js --output.format cjs --output.file dist/form-knox.js

	mkdir -p dist

	$(shell npm bin)/babel src --out-dir dist
	$(shell npm bin)/rollup src/bundle.js --output.format umd --output.file dist/bundle.umd.js -n formKnox


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
	- cd dist && npm publish --access public
	- node -e "var fs = require('fs'); var pkg = require('./package.json'); pkg.name = 'form-knox'; fs.writeFile('./package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	- cd dist && npm publish

github.release: export REPOSITORY="kiltjs/form-knox"
github.release: export PKG_VERSION=$(shell node -e "process.stdout.write('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}

	git reset --soft HEAD~1
	git reset HEAD
	# git reset --hard origin/$(git_branch)
	@git checkout $(git_branch)
	@echo "\nhttps://github.com/kiltjs/jqnano/releases/tag/${PKG_VERSION}\n"

release: npm.publish github.release

.DEFAULT_GOAL := build
