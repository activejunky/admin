deployStaging:
	npm run build:staging && firebase deploy -P staging

deployProd:
	npm run build:prod && firebase deploy -P prod

