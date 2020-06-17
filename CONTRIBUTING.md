# Contributing to Hex Engine

First off, thank you for your interest in contributing to Hex Engine!

The following is a set of guidelines for contributing. These are guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

#### Table Of Contents

- [Code of Conduct](#code-of-conduct)
- [How to contribute](#how-to-contribute)
  - [Install the project](#install-the-project)
  - [Project Structure](#project-structure)
  - [npm script reference](#npm-script-reference)

## Code of Conduct

By contributing to Hex Engine in any way, you pledge to uphold the standards listed in the [Contributor Covenant Code of Conduct Version 2.0](https://www.contributor-covenant.org/version/2/0/code_of_conduct).

Note that "in any way" includes, but is not limited to:

- Opening Pull Requests
- Opening Issues
- Commenting on Pull Requests or Issues
- Posting messages to the official Hex Engine Discord server

## How to contribute

Hex Engine greatly appreciates pull requests, but open an issue first to check if the change you want to make is in line with the project vision. Once you have, you can follow these instructions to clone the repo and work on it locally.

### Install the project

First, you need to fork the repository. For information about forking a repository, you can check [this GitHub help page](https://help.github.com/en/github/getting-started-with-github/fork-a-repo).

Once you have forked the repo, use the following command to clone it onto your local machine (replacing `<your-github-user-name>` with your GitHub username).

```
git clone https://github.com/<your-github-user-name>/hex-engine.git
```

Afterwards, `cd` into the newly-created `hex-engine` folder, and install the dependencies. Hex Engine use _yarn_ to manage dependencies. If you don't have _yarn_, you can install it with this command:

```
npm install -g yarn
```

And then you can install the dependencies with this command:

```
yarn install
```

Now you can run the Hex Engine project with the following command:

```
yarn start
```

### Project Structure

This project is separated as multiple packages which you can find in the _packages_ folder.

<!-- prettier-ignore -->
| Folder      | Description |
| ----------- | ----------- |
| `2d`        | Provides primitives for making a 2D game. This is published on npm as `@hex-engine/2d`. |
| `core`      | Core Entity and Component system. This is published on npm as `@hex-engine/core`. |
| `create`    | CLI to create a boilerplate project. This is published on npm as `create-hex-engine-game`. |
| `game`      | Example game built with with Hex Engine. This is not published on npm. |
| `inspector` | The debugging inspector that is included with Hex Engine. This is published on npm as `@hex-engine/inspector`. |
| `scripts`   | The `hex-engine-scripts` package, which is used to compile your game. |
| `website`   | Hex Engine's website (<https://hex-engine.dev>). |

### `package.json` script reference

<!-- prettier-ignore -->
| Command  | Function  |
| -------- | --------- |
| `yarn start`         | Builds all packages, watches them for changes, and rebuilds on change. Also, runs the sample game at port 8080, and the website at port 3000. |
| `yarn watch`         | Same as `yarn start`. |
| `yarn clean`         | Cleans all package build artifacts. |
| `yarn build`         | Builds all packages in a way that is suitable for production distribution. |
| `yarn typecheck`     | Runs TypeScript across the repo. |
| `yarn test-it`       | Runs [Test-It](https://github.com/suchipi/test-it) on the repo. |
| `yarn test`          | Runs `yarn typecheck` and then `yarn test-it`. |
| `yarn build-website` | Builds the website. The website is also built as part of `yarn build`, but this builds _only_ the website. This script is used to deploy the website. |
