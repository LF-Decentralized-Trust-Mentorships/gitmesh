# GitMesh - Community Edition

## Requirements

- [Node.js](https://nodejs.org/en) v20.0.0
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

```shell
git clone [YOUR_REPO]
cd scripts
./cli prod
```

The application will be available at `http://localhost:8081`

## CLI Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `./cli prod` | Start all services (production mode) |
| `./cli dev` | Start with development mode (hot reloading) |
| `./cli clean-dev` | Clean start with development mode |

### Backend-Only Commands

| Command | Description |
|---------|-------------|
| `./cli prod-backend` | Start backend services only (production) |
| `./cli dev-backend` | Start backend with development mode |
| `./cli clean-dev-backend` | Clean start backend with development mode |

### E2E Testing

| Command | Description |
|---------|-------------|
| `./cli start-e2e` | Start services for E2E testing |
| `./cli start-be` | Start backend for testing |

### Scaffold Management

| Command | Description |
|---------|-------------|
| `./cli scaffold up` | Start infrastructure services |
| `./cli scaffold down` | Stop infrastructure services |
| `./cli scaffold destroy` | Remove all volumes and data |
| `./cli scaffold reset` | Destroy and restart infrastructure |
| `./cli scaffold up-test` | Start test infrastructure |

### Database Operations

| Command | Description |
|---------|-------------|
| `./cli scaffold create-migration <name>` | Create new migration files |
| `./cli scaffold migrate-up` | Apply database migrations |
| `./cli db-backup <name>` | Backup database to file |
| `./cli db-restore <name>` | Restore database from backup |

### Service Management

| Command | Description |
|---------|-------------|
| `./cli service <name> up` | Start a specific service |
| `./cli service <name> down` | Stop a specific service |
| `./cli service <name> restart` | Restart a specific service |
| `./cli service <name> logs` | View service logs |
| `./cli service <name> status` | Check service status |
| `./cli service list` | List all running services |
| `./cli service up-all` | Start all services |

### Build Commands

| Command | Description |
|---------|-------------|
| `./cli build <service> [version]` | Build a service image |
| `./cli build-and-push <service> [version]` | Build and push to registry |

## Utility Commands

Kill all Docker containers:
```bash
docker rm -f $(docker ps -aq)
```