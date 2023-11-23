install_curl:
	chmod +x ./scripts/install_curl.sh && ./scripts/install_curl.sh

install_docker:
	chmod +x ./scripts/install_docker.sh && ./scripts/install_docker.sh

install_docker_compose:
	chmod +x ./scripts/install_docker_compose.sh && ./scripts/install_docker_compose.sh

generate_config:
	chmod +x ./scripts/generate_gitlab_runner_config.sh && ./scripts/generate_gitlab_runner_config.sh

install_dependencies: install_curl install_docker install_docker_compose
