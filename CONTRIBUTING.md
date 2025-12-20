# Contributing to GitMesh

Thank you for your interest in contributing to GitMesh! This document provides guidelines for contributing to the project.

## Developer Certificate of Origin (DCO)

All commits must include a "Signed-off-by" line to certify that you have the right to submit the code under the project's license. This is done using the Developer Certificate of Origin (DCO).

To sign your commits, use the `-s` flag with git commit:

```shell
git commit -s -m "Your commit message"
```

This will add a line like:
```
Signed-off-by: Your Name <your.email@example.com>
```

**Important:** All commits in your PR must have DCO sign-off. PRs without proper sign-off will not pass the required DCO check.

If you forget to sign your commits, you can amend your last commit with:
```shell
git commit --amend -s
```

Or sign all commits in your branch:
```shell
git rebase --signoff main
```

## Getting Started

1. Get the mono repo from GitHub

```shell
git clone [YOUR_REPOSITORY_URL]
```

2. Run the start script:

```shell
cd scripts
./cli prod
```

For hot reloading, you can run:
```shell
cd scripts
./cli clean-dev
```

The app will be available at http://localhost:8081

### Running services individually

To optimize resource usage during development, we would suggest starting only the necessary services and leveraging hot reloading where applicable. 

1. Start the scaffold service, including the necessary components like the database, etc:

```shell
./cli scaffold up 
```

This will set up the foundational services required for the project.

2. If you are primarily working on the frontend but also need the API without hot reloading:


```shell
DEV=1 ./cli service frontend up
./cli service api up
```

By selectively starting the frontend and API services without enabling hot reloading, helps reduce resource usage. 