## Setup

In order to start developing, the environment needs to be prepared and some hooks need to be configured.

### Requirements

- Python 3.8+

### Steps

- Clone this repo and `cd` into it
- Create a virtual environment with `python -m venv venv-gitmesh`
- Activate it on unix/Windows with Git Bash `source venv-gitmesh/bin/activate` or on Windows `venv-gitmesh\Scripts\activate.bat`
- Install all gitmesh modules in editable mode: `pip install -r requirements.internal.txt`
- Install the dev modules `pip install -r requirements.txt`
- Setup the pre-commit hook for formatting and linting `pre-commit install`
- Setup the pre-push testing hook on Unix `make` or on Unix/Windows `cp hooks/pre-push .git/hooks`
- TODO setup ENV variables
- verify that everything works with running `pytest`
