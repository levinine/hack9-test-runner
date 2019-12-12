# Hack9 test runner

The app that negotiates with hack9-judge what needs to be tested, execute different kinds of tests, gathers reports and submits reports back to judge.

Tests that needs to be run can be put here, or have their own repo and imported into runner.

## How it works

1. Check for pending test request: invoked periodically, but it can also be triggered via HTTP endpoint from the outside.

2. Contact Judge Thread and ask if there are requested tests for my cloud platform and region.

3. If there is a test request - run it and submit results back.

## Build

Install dependencies

```npm install```

Application is packed in Docker image.

```sudo docker build -t hack9-test-runner .```

## Run

```sudo docker run hack9-test-runner```

Additional environment variables can be specified when running Docker continer:

* `HACK9_JUDGE` - URL where the Judge application is running (default `http://localhost:3000/dev`)
* `HACK9_CLOUD_PROVIDER` - Cloud provider where test runner is running, one of: aws, azure or gcp (default `aws`)
* `HACK9_REGION` - Region in which test runner is running (default `eu-west-1`)
* `TEST_RUNNER_BASE_URL` - URL where test runner is exposed (default `http://localhost:3500`)

For example:

```sudo docker run -e HACK9_JUDGE=https://5lu3e68nw8.execute-api.eu-west-1.amazonaws.com/dev -e HACK9_CLOUD_PROVIDER=aws -e HACK9_REGION=eu-west-1 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner```

## Publish to ECR

``` Bash
# Get Docker login command
aws ecr get-login --no-include-email --region eu-west-1
# Execute output of previous command
sudo docker login -u AWS -p <password> https://745008152238.dkr.ecr.eu-west-1.amazonaws.com
# Create repository; this was done already
aws ecr create-repository --repository-name levi9/hack9-test-runner
# Tag Docker image 
sudo docker tag hack9-test-runner 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner
# Push the image
sudo docker push 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner
```

## Run locally

```node .```

This will run a test-runner locally, with API exposed at http://localhost:3500/

