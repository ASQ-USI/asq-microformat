#modified from express.js
# https://github.com/visionmedia/express/blob/9a45f7bd3d46c4278561c8bc6f254ce272ac0046/Makefile

TESTS = test/*.js
REPORTER = spec

test: test-unit test-cov

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: istanbul cover ./node_modules/mocha/bin/_mocha

.PHONY: test test-unit test-acceptance benchmark clean