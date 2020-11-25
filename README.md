# BEARS
Basic Event Api Recording System

Stores http PUT events to a DynamoDB table.

It uses AWS HTTP-API and a Lambda function to store the event metadata to a DynamoDB table. The stack is built using the [serverless.com](https://serverless.com) framework.

## Dependencies
* An AWS account
* An access to AWS with a named profile with enough rights
  * Lambda
  * DynamoDB
  * API Gateway
  * IAM
  * CloudWatch Logs
  * Cloudformation
  * ... probably more
* sls
  `npm -g i serverless`

## Deploy
```bash
git clone https://github.com/DanielMuller/bears
cd bears
npm ci
cp -a stages/dev.sample.yml stages/dev.yml
vi stages/dev.yml # Change profile and region
sls deploy
```

## Usage
```bash
curl -X PUT -H "Content-Type: application/json" -d '{"key1":"val1","key2":"val2"}' https://<api-id>.execute-api.<region>.amazonaws.com/events/<eventName>`
```
