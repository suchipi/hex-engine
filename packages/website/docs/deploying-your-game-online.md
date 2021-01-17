---
title: Deploying Your Game Online
---

One of the best things about making browser games is that they're so easy to share with others. This guide will show you how to use [Vercel](https://vercel.com/) to quickly and easily get your game onto the internet so you can share it with your friends. It should only take about 5 minutes to get everything set up.

## Installing and Setting Up Vercel

First, add the Vercel CLI to your game by opening a terminal emulator or command prompt, `cd`ing to your game's folder, and running this command:

```
npm install --save-dev vercel
```

Once that command is done running, edit your `package.json`, and add a `deploy` script to it (add the highlighted line):

```json {17}
{
  "name": "my-hex-engine-game",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "@hex-engine/2d": "^0.8.1"
  },
  "devDependencies": {
    "hex-engine-scripts": "^0.8.1",
    "typescript": "^3.9.2",
    "vercel": "^21.1.0"
  },
  "scripts": {
    "start": "hex-engine-scripts dev",
    "dev": "hex-engine-scripts dev",
    "build": "hex-engine-scripts build",
    "deploy": "vercel dist",
    "test": "hex-engine-scripts test"
  }
}
```

## Creating a Vercel Account and Logging in

If you haven't already, create an account on [Vercel's website](https://vercel.com/signup). You'll need one to upload your game.

Once you've created an account, run the following command to log in:

```
npm run deploy
```

It'll ask for your email and then give you instructions on how to authenticate. You should only need to do this once.

## Uploading Your Game

Now that your game is set up with Vercel and you have an account, you can use these steps each time you want to upload it.

If you haven't already, open a terminal emulator or command prompt and `cd` to your game's folder.

Once there, run the `build` script from your `package.json` to compile a production-ready version of your game into the `dist` folder:

```
npm run build
```

> The production version of the game is better optimized than your local development version, and doesn't include the [Inspector Bar](http://localhost:3000/docs/first-time-setup#the-inspector-bar).

Then, run the `deploy` script from your `package.json` to upload the contents of the `dist` folder to a web server:

```
npm run deploy
```

The first time you do a deployment, it'll ask you some questions, so answer those. Once it's done, it'll output a URL where your game has been uploaded! Open it in your browser; there's your game, on the internet :D

In the future, when you want to upload a new version of your game, you only need to perform the steps in the "Uploading Your Game" section.
