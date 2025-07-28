# Notification Orchestrator

## Description

Another microservcie written in Node.js, to orchestrate notifications using DynamoDB database.

## API documentation:

Swagger documentation

## How to run?

### Node version

`v24.4.0`

### Install dependecies

Copy repo and run `npm i` command

### Provide .env file

Based on `.env.example` create `.env` file with correct enviroment variables

### Setup AWS CLI locally

You need to have AWS Cli configured. Follow [this instruction](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

Then run `aws configure`. Use local for region. Save all needed credentials in .env file.

### Start docker container

When you're ready, start your application by running:
`docker compose up -d`.

Your application will be available at http://localhost:4002.

### Generate Authorization token

To perform authorized requests, run `npm run generate-token` command. Use saved token in `Authorization: Bearer ...` header.

## DynamoDB Tables

## Assumptions
