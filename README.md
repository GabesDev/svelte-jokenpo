# Svelte Jokenpo

Simple project to put in practice some svelte and socket.io knowledge 😁

Live project can be seen [here](https://5ed933ed94c8361c465b1457--svelte-jokenpo.netlify.app/ "Netlify").

You can open two tabs to see it in action, if nobody is there.
Use **arrow keys** to walk, press **space** to change char and **esc** to close modals.

The chat/recording system uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API). 

Works better on Chrome (to see the API in action using Firefox, you have to change some flags under about:config) 😑

It is possible to give some commands using that API, but I did not go too deep in that. You can test it by saying "alerta".

> client/src/components/Chat.svelte#44, **isCommand** function

Front end part was uploaded to Netlify, and backend part to Heroku.