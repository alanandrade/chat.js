test:
	@NODE_ENV=test ./node_modules/.bin/mocha

dev:
	@NODE_ENV=development npm start

prod:
	@NODE_ENV=production npm start

.PHONY: test
