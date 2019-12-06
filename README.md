# Hack9 test runner

The app that negotiates with hack9-judge what needs to be tested, execute different kinds of tests, gathers reports and submits reports back to judge.

Tests that needs to be run can be put here, or have their own repo and imported into runner.

## How it works

1. Check for pending test request: invoked periodically, but it can also be triggered via HTTP endpoint from the outside.

2. Contact Judge Thread and ask if there are requested tests for my cloud platform and region.

3. If there is a test request - run it and submit results back.


## Build

Application is packed in Docker image.

```sudo docker build -t hack9-test-runner .```

## Run

```sudo docker run hack9-test-runner```

## Run locally

```node .```

This will run a test-runner locally, with API exposed at http://localhost:3500/

