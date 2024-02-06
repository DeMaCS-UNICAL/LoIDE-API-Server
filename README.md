[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DeMaCS-UNICAL/LoIDE-API-Server/master/LICENSE)
[![GitHub release](https://img.shields.io/github/release/DeMaCS-UNICAL/LoIDE-API-Server.svg)](https://github.com/DeMaCS-UNICAL/LoIDE-API-Server/releases/latest)
[![GitHub issues](https://img.shields.io/github/issues/DeMaCS-UNICAL/LoIDE-API-Server.svg)](https://github.com/DeMaCS-UNICAL/LoIDE-API-Server/issues)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/DeMaCS-UNICAL/LoIDE-API-Server)

# LoIDE-API-Server
An API server for LoIDE clients.
It receives requests from LoIDE clients and forwards them to the server-side(executors) components of LoIDE. It also receives the responses from the server-side components and forwards them to the clients.

# Getting Started

These instructions will get you a copy of the project up and running on your local machine.

## Prerequisites

To run LoIDE API Server you need to have Node.js and npm installed on your system. You can download and install Node.js from the [official website](https://nodejs.org/).

If you want to use the server-side features of LoIDE, you need to have a server that can execute Logic programs. If you like it, you can use our [PythonESE](https://github.com/DeMaCS-UNICAL/PythonESE).

## Installation

To install LoIDE API Server, first clone the repository using the following command:

```bash
git clone https://github.com/DeMaCS-UNICAL/LoIDE-API-Server.git
```

Navigate to the cloned repository directory and install the required dependencies with npm:

```bash
npm install
```

Now you can run the application in development or production mode.

## Run the Application

In the project directory, you can run:

```bash
npm start
```

This will start the server and it will be immediately ready to receive requests.

# Dockerization

This repository provides also Docker containerization for LoIDE API Server.
Docker enables the encapsulation of the LoIDE API Module within a lightweight, portable container, ensuring smooth deployment across various environments.

## Getting Started

Deploying the LoIDE API Server using Docker is straightforward:

### Installation

Ensure Docker is installed on your system (refer to the [official Docker documentation](https://docs.docker.com/get-docker/) for installation instructions). Then, clone this repository using the following command:

```bash
git clone https://github.com/DeMaCS-UNICAL/LoIDE-API-Server.git
```

### Building the Docker Image

A Docker image is a package that contains all the necessary to run application and it's used to create Docker containers. To create one navigate to the cloned repository directory and build the Docker image using the provided Dockerfile:

```bash
docker build -t loide-api .
```

### Running the Docker Container

Once the Docker image is built, you can run a Docker container using the following command:

```bash
docker run -d --network host --mount type=bind,source=[your/path/to/config],target=/app/config loide-api
```

The `--network host` option in the docker run command tells Docker to use the host network for the container. This means the container shares the same network stack as the host and can access network services running on the host directly.

The `--mount type=bind, source=[your/path/to/config], target=/app/config` option is used to create a bind mount. A bind mount is a type of mount that allows you to map a host file or directory to a container file or directory (for more information refer to the [official Docker documentation](https://docs.docker.com/storage/bind-mounts/)).
In this case we use mounts to provide the configuration file to the container. 

The configuration files are JSON files containing the configuration of the LoIDE API Server. They must be placed in a directory on the host and the _full_ path to this directory must be specified in the source option of the --mount option. The JSON schemas needs also to be in the same directory.

For examples on how to create or modify the configuration file refer to the next section. If no configuration file is provided the default configuration will be used.


# Configuration

## app-config.json
This configuration file is used to set up the server ports and SSL certificate paths for the application.

~~~json
{
  "port": {
    "http": 8084,
    "https": 8085
  },
  "path": {
    "key": "path/to/ssl/key",
    "cert": "path/to/ssl/cert"
  }
}
~~~
**Port:**
This object contains the ports on which the HTTP and HTTPS servers will listen.

**Path:**
This object contains the paths to the SSL certificate and key for the HTTPS server. If no SSL certificate is provided, the server will run in HTTP mode.

## services.json
This configuration file is used to define the programming languages, solvers, executors, and options supported by the application.

### Structure

The configuration file is structured as a JSON object with a single property: `languages`. This property is an array where each object represents a programming language.

### Languages

Each language object has three properties:

- `name` is the display name of the language.
- `value` is the value that represents the language.
- `solvers` is an array of solver objects that are supported by the language.

### Solvers

Each solver object within a language has four properties:

- `name` is the display name of the solver.
- `value` is the value that represents the solver.
- `executors` is an array of executor objects that are supported by the solver.
- `options` is an array of option objects that are supported by the solver.

### Executors

Each executor object within a solver has six properties:

- `protocol` is the protocol used by the executor (e.g., "ws" for WebSocket).
- `url` is the URL of the executor.
- `name` is the display name of the executor.
- `value` is the value that represents the executor.
- `path` is the path on the executor's server.
- `port` is the port on which the executor's server is listening.

### Options

Each option object within a solver has four properties:

- `name` is the display name of the option.
- `value` is the value that represents the option.
- `word_argument` is a boolean indicating whether the option requires an argument.
- `description` is a description of the option.

## Versioning

We use [Semantic Versioning](http://semver.org) for versioning. For the versions available, see the [releases on this repository](https://github.com/DeMaCS-UNICAL/LoIDE-API-Server/releases).

## Credits

- Stefano Germano (_Coordinator_)
- Rocco Palermiti
- Marco Duca

From the [Department of Mathematics and Computer Science](https://www.mat.unical.it) of the [University of Calabria](http://unical.it)

## License

This project is licensed under the [MIT License](LICENSE)
