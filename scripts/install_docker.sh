#!/bin/bash

# Check if the script is running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo."
  exit 1
fi

# Check for the current user's home directory
USER_HOME=$(eval echo ~$SUDO_USER)

# Function to install Docker using the official script
install_docker() {
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
}

# Function to start the Docker daemon
start_docker_daemon() {
  systemctl start docker
  systemctl enable docker
}

# Function to initialize Docker Swarm
initialize_swarm() {
  docker swarm init
}

# Check if Docker is already installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Docker is not installed. Installing Docker..."
  # Install Docker based on the distribution
  case $DISTRIBUTION in
    ubuntu)
      install_docker
      ;;
    debian)
      install_docker
      ;;
    fedora)
      install_docker
      ;;
    centos)
      install_docker
      ;;
    rhel)
      install_docker
      ;;
    *)
      echo "Unsupported Linux distribution. You'll need to install Docker manually."
      exit 1
      ;;
  esac
fi

# Check if the Docker daemon is running
if ! systemctl is-active --quiet docker; then
  echo "Docker daemon is not running. Starting Docker..."
  start_docker_daemon
fi

# Check if Docker Swarm is already initialized
if ! docker info | grep -q "Swarm: active"; then
  echo "Docker Swarm is not initialized. Initializing Docker Swarm..."
  initialize_swarm
fi

# Add the current user to the Docker group to run Docker without sudo (if applicable)
if [ "$USER_HOME" != "/root" ]; then
  if ! groups $SUDO_USER | grep -q "\bdocker\b"; then
    usermod -aG docker $SUDO_USER
    echo "Added $SUDO_USER to the Docker group. You may need to log out and back in for the changes to take effect."
  fi
fi

echo "Docker has been successfully installed, started, and Docker Swarm is initialized."
