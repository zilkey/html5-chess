# Multiplayer Chess Spike

The goal of this app was to spike out a two-player browser chess game in JS using:

* pusher
* no frameworks other than jQuery
* native HTML5 dragdrop

## Setup

* `bundle`
* `rake db:create db:migrate`
* `cp .env{.example,}`
* Create a pusher app, turn on "Enable Client Events" in settings, and fill in `.env` with your keys / app id
* `rails s`

## Debugging

If the pusher stuff doesn't work, uncomment the lines in `application.js` that enable pusher logging

## Playing

* Open `http://localhost:3000` in one tab
* Enter a username and start a game
* Copy the link, and open that link in another browser, or in an incognito tab
* Enter a different username
* Play a white move in one tab, switch to the other to watch it take place
* Play a black move in the other tab