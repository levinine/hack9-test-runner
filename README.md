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

```sudo docker build -t hack9-test-runner -t 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner:test .```

Publish to ECR

``` Bash
# Docker login
sudo $(aws ecr get-login --no-include-email --region eu-west-1)
# Push the image
sudo docker push 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner
```

## Run

```sudo docker run hack9-test-runner```

Additional environment variables can be specified when running Docker continer:

* `HACK9_JUDGE` - URL where the Judge application is running (default `http://localhost:3000/dev`)
* `HACK9_CLOUD_PROVIDER` - Cloud provider where test runner is running, one of: aws, azure or gcp (default `aws`)
* `HACK9_REGION` - Region in which test runner is running (default `eu-west-1`)
* `TEST_RUNNER_BASE_URL` - URL where test runner is exposed (default `http://localhost:3500`)
* `PORT` - Port that should be exposed by container (default `3500`)

For example:

```sudo docker run -e HACK9_JUDGE=https://5lu3e68nw8.execute-api.eu-west-1.amazonaws.com/dev -e HACK9_CLOUD_PROVIDER=aws -e HACK9_REGION=eu-west-1 745008152238.dkr.ecr.eu-west-1.amazonaws.com/levi9/hack9-test-runner```

```sudo docker run -e HACK9_JUDGE=https://8vddow5qzg.execute-api.eu-west-1.amazonaws.com/test -e HACK9_CLOUD_PROVIDER=gcp -e HACK9_REGION=eu-west-1 hack9-test-runner```

Judge URLs:
* test https://8vddow5qzg.execute-api.eu-west-1.amazonaws.com/test
* prod https://5lu3e68nw8.execute-api.eu-west-1.amazonaws.com/dev

## Run locally

```HACK9_JUDGE=https://8vddow5qzg.execute-api.eu-west-1.amazonaws.com/test node .```

This will run a test-runner locally, with API exposed at http://localhost:3500/

## Run on EC2 instance without Docker

After experiencing issues running tests in Docker containers - we changed approach to creating EC2 instance (C5a xLarge) and running it there.

Steps needed to setup the machine:

``` Bash
# Once the instance is created mark its external address, we need it:
export runner=<URL>
# Copy the project onto EC2 instance (would be wise to ommit .git and node_modules directories)
scp -i hack9.pem -r hack9-test-runner ec2-user@$runner:~/
# SSH to machine
ssh -i hack9.pem ec2-user@$runner
# install software
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
wget https://bintray.com/loadimpact/rpm/rpm -O bintray-loadimpact-rpm.repo
sudo mv bintray-loadimpact-rpm.repo /etc/yum.repos.d/
sudo yum -y install k6
npm i newman -g
# install dependencies
cd hack9-test-runner
npm i
# run Judge
HACK9_JUDGE=https://5lu3e68nw8.execute-api.eu-west-1.amazonaws.com/dev TEST_RUNNER_BASE_URL=$runner:3500 node .
```
