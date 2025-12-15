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

#### Running services individually

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