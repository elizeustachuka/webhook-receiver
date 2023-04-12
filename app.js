require('dotenv').config()
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var amqp = require('amqplib/callback_api');

const port = process.env.PORT || 3000;
const queue = process.env.QUEUE_NAME;
var counter = 0;

app.use(bodyParser.json())

app.listen(port, () => {
  console.log(`A API está sendo executada na porta ${port}`);
});

app.get('/', (req, res) => {
  res.send('Tente usar POST /webhook para enviar um hook');
});

app.post('/webhook', (req, res) => {

  var msg = JSON.stringify(req.body);
  res.status(200).send('Sent ' + msg);

  sendToQueue(msg)
  
  function sendToQueue(msg) {

    counter++

    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0;
      }

      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        channel.assertQueue(queue, {
          durable: false
        });

        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
        console.log("========> count: " + counter)
      });

      setTimeout(function () {
        connection.close();
        //process.exit(0);
      }, 500);
    });

  }

});