const express = require("express");
const app = express();
require("dotenv").config();

const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: process.env.token,
  channelSecret: process.env.secretcode,
};

const client = new line.Client(config);
var message=""

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all([req.body.events.map(handleEvents)]).then((result) =>
    res.json(result)
  );
});

function handleEvents(event) {
  console.log(event);
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  const word = event.message.text;

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((response) => {
      if (!response.ok) {
        //throw new Error("have some problem while connecting");
        callback("dont have this word on this bot",event)
      }
      return response.json();
    })
    .then((data) => {
      for (var i = 0; i < data[0].meanings.length; i++) {

        const partOfSpeech = data[0].meanings[i].partOfSpeech;
        var meanings = data[0].meanings[i].definitions[i].definition;

        if(partOfSpeech==="noun"||partOfSpeech==="verb"){
                message += partOfSpeech +" : "+meanings
                callback(message,event)
        }
        message=""
      }
    })
    .catch((error) => {
      console.error("Have problem with ", error);
    });
  
}

function callback(message,event){
    return client.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `${message}`,
        },
      ]);
}

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.listen(8080, () => console.log("Start listening on port : 8080"));
