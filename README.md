# aws-serverless-demo

This is my code from a follow-along demo for a serverless application in the *AWS for Developers: Data-Driven Serverless Applications with Kinesis* LinkedIn  Learning course.

The application is for a company that takes orders, fulfills the orders, and then sends them to a delivery company, and it has three HTTP POST endpoints and four lambda functions. It utilizes DynamoDB, S3, Kinesis, SES, and SQS services.



# libraries/packages
npm: serverless, serverless pseudo-parameters, uuidv1/v1

aws-sdk

	npm install serverless --save
	npm install serverless-pseudo-parameters --save
