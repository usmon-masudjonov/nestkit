#!/bin/bash

# Check if the system is using APT (Debian/Ubuntu)
if [ -x "$(command -v apt-get)" ]; then
  sudo apt-get update
  sudo apt-get install -y curl

# Check if the system is using YUM (Red Hat/CentOS/Fedora)
elif [ -x "$(command -v yum)" ]; then
  sudo yum install -y curl

# Check if the system is using DNF (Fedora)
elif [ -x "$(command -v dnf)" ]; then
  sudo dnf install -y curl

# Check if the system is using Zypper (openSUSE)
elif [ -x "$(command -v zypper)" ]; then
  sudo zypper install -y curl

# Check if the system is using Pacman (Arch Linux)
elif [ -x "$(command -v pacman)" ]; then
  sudo pacman -Syu --noconfirm curl

# If none of the above package managers are found, display an error message
else
  echo "Error: Unsupported Linux distribution. Please install curl manually."
  exit 1
fi

echo "curl is now installed on your system."
