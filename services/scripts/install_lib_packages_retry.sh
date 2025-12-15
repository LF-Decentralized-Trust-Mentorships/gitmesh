#!/usr/bin/env bash
if [[ ${TERM} == "" || ${TERM} == "dumb" ]]; then
    RED=""
    GREEN=""
    GREY=""
    YELLOW=""
    RESET=""
else
    RED=`tput setaf 1`
    GREEN=`tput setaf 2`
    GREY=`tput setaf 7`
    YELLOW=`tput setaf 3`
    RESET=`tput sgr0`
fi

set -e
CLI_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

FLAGS=$1
MAX_RETRIES=3

install_with_retry() {
    local dir=$1
    local name=$2
    local attempt=1
    
    while [ $attempt -le $MAX_RETRIES ]; do
        printf "${YELLOW}Installing packages for $name (attempt $attempt/$MAX_RETRIES)${RESET}\n"
        if (cd "$dir" && npm ci $FLAGS --prefer-offline --no-audit); then
            printf "${GREEN}Successfully installed $name${RESET}\n"
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $attempt -le $MAX_RETRIES ]; then
            printf "${RED}Failed to install $name, retrying...${RESET}\n"
            sleep 2
        fi
    done
    
    printf "${RED}Failed to install $name after $MAX_RETRIES attempts${RESET}\n"
    return 1
}

# Install libs
for dir in $CLI_HOME/../libs/*/; do
    if [ -f "$dir/package.json" ]; then
        lib=$(basename "$dir")
        install_with_retry "$dir" "library: $lib" || exit 1
    fi
done

# Install archetypes
for dir in $CLI_HOME/../archetypes/*/; do
    if [ -f "$dir/package.json" ]; then
        archetype=$(basename "$dir")
        install_with_retry "$dir" "archetype: $archetype" || exit 1
    fi
done

printf "${GREEN}All library packages installed!${RESET}\n"
