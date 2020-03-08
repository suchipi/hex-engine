# Contributing to Hex Engine

First off, thanks for taking the time to contribute !

The following is a set of guidelines for contributing to Hex Engine. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

#### Table Of Contents

* [Code of Conduct](#code-of-conduct)
* [How to contribute](#how-to-contribute)
    * [Install the project](#install-the-project)
    * [Project Structure](#project-structure)
    * [npm script reference](#npm-script-reference)

## Code of Conduct

By participating to Hex Engine, you pledge to uphold the standards listed in the Contributor Covenant Code of Conduct, as found here: https://www.contributor-covenant.org/version/2/0/code_of_conduct

## How to contribute

Hex Engine greatly appreciates pull requests, but open an issue first to check if the change you want to make are in line with the project vision.

### Install the project

In first you need to fork and clone this repository.
```
git clone https://github.com/<your-gh-user-name>/hex-engine.git
```

Afterwards install the dependencies. Hex Engine use *yarn* to manage dependencies. If you don't have *yarn* just install it with this command : 
```
npm install -g yarn 
```

And you can install the dependencies with this command line : 

```
yarn install
```
Now you can run the Hex Engine project with the following command : 

```
yarn start
```

### Project Structure

This project is separated in multiple packages which you can find in the *packages* folder.

| Package                      | Description                             |
| ---------------------------- | --------------------------------------- |
| `2d`                         | Provide primitives for making a 2D game.|
| `core`                       | Core Entity and Component system.       |
| `create`                     | Cli to create boilerplate project.      |
| `game`                       | Example of use case with Hex Engine.    |
| `inspector`                 | Integrate the inspector to debug Hex Engine projects. |
| `scripts`                    | CLI for Hex Engine.                     |
| `website`                    | Hex Engine website.                     |

### Npm script reference

| Command                      | Function                                |
| ---------------------------- | --------------------------------------- |
| `npm run start`              |                                         |
| `npm run watch`              |                                         |
| `npm run clean`              |                                         |
| `npm run build`              |                                         |
| `npm run typecheck`          |                                         |
| `npm run test-it`            |                                         |
| `npm run test`               |                                         |
| `npm run build-website`      |                                         |
