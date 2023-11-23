#!/bin/bash

# Check if the script is running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo."
  exit 1
fi

# Detect the Linux distribution
if [ -f /etc/os-release ]; then
  source /etc/os-release
  DISTRIBUTION=$ID
elif [ -f /etc/lsb-release ]; then
  source /etc/lsb-release
  DISTRIBUTION=$DISTRIB_ID
else
  echo "Unsupported Linux distribution. You'll need to install Docker Compose manually."
  exit 1
fi

# Install Docker Compose
install_docker_compose() {
  if [ -x "$(command -v docker-compose)" ]; then
    echo "Docker Compose is already installed."
    return
  fi

  # Download Docker Compose binary
  curl -fsSL https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose

  # Make it executable
  chmod +x /usr/local/bin/docker-compose

  echo "Docker Compose has been successfully installed."
}

# Install Docker Compose based on the distribution
case $DISTRIBUTION in
  ubuntu|debian|fedora|centos|rhel)
    install_docker_compose
    ;;
  *)
    echo "Unsupported Linux distribution. You'll need to install Docker Compose manually."
    exit 1
    ;;
esac

echo "Docker Compose has been successfully installed."
