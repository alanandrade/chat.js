test: acceptance
	@NODE_ENV=test ./node_modules/.bin/mocha

acceptance:
	@NODE_ENV=test ./node_modules/.bin/mocha-phantomjs test/test.html

dev:
	@NODE_ENV=development npm start

prod:
	@NODE_ENV=production npm start

.PHONY: test
