#!/bin/bash

source .env

mkdir -p ./config/gitlab-runner

# Create the GitLab Runner configuration file using a heredoc
cat <<EOF > ./config/gitlab-runner/config.toml
[[runners]]
  name = "$GITLAB_RUNNER_NAME"
  url = "$GITLAB_CI_SERVER_URL"
  token = "$GITLAB_RUNNER_REGISTRATION_TOKEN"
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "docker:dind"
    privileged = false
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    shm_size = 0
EOF
