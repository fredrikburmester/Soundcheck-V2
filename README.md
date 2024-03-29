# Soundcheck V2 - A Music Game for Friends

A remake of our original [Soundcheck game](https://github.com/fredrikburmester/Soundcheck).

![Soundcheck Logo](https://raw.githubusercontent.com/fredrikburmester/Soundcheck/master/frontend/src/assets/soundcheck-logo.png)

## 🚀 Website

|Branch      |Environment|URL                           |
|------------|-----------|------------------------------|
|main        |prod       |<https://soundcheckgame.com>|

## 🔎 Info

This remake of the game aims to refactor the code, switch backend framework and enable more features!

## 🧑🏻‍💻 Features

Here are some features that are available.

- Play Soundcheck and guess your friends favorite songs
- Chat with your friends during a game
- Save songs as a playlist: save the songs in a Soundcheck game in a spotify playlist after the game.

## 📈 New features

Here are some added features not present in the old version of the game

- A whole new way of playing music, utilizing spotifys web sdk
  - Seeking in a song
  - Disable or enable seeking for a game
- Invite online players to a room
- Check out your favorite tracks and artists on Spotify
  - Save a playlist containing those favorite songs
- See who has guessed on a player duing the game
- A new fresh design using Tailwind and DaisyUI

## 🌐 How to run

Create `.env` for front- and back-end with all necessary enviroment variables (available privatly in the repo).

```
cd ./frontend && npm i && cd .. && cd ./backend && npm i && cd .. && npm i
npm i pm2 -g
pm2 start <production|development>.json
```
