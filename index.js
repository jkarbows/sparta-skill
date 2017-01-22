// PLANTS
'use strict';

var AlexaSkill = require('./AlexaSkill');
var request = require('request');
var secrets = require('./secrets');

var APP_ID = secrets.alexa;

var Plants = function() {
    AlexaSkill.call(this, APP_ID);
};

Plants.prototype = Object.create(AlexaSkill.prototype);
Plants.prototype.constructor = Plants;

Plants.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session, response) {
    console.log('My Plants onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: ' + session.sessionId);

    /*if(session.user.accessToken) {
        var token = session.user.accessToken;
        var tokens = token.split('ILOVEYOU');
        userToken = tokens[0];
        userSecret = tokens[1];
        console.log('tokens' + tokens[0] + ' :: ' + tokens[1])
    } else {
        var speechOutput = "You must have a Blooming account to use this skill. "
            + "Click on the card in the Alexa app to link your account now.";
        response.reject(speechOutput);
    }*/
};

Plants.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log('Plants onLaunch requestId' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
    var speechOutput = "Welcome to Plants. Your plants are fine, relax kid.";
    var cardTitle = "My Plants";
    response.tellWithCard(speechOutput, cardTitle, speechOutput);
};

Plants.prototype.intentHandlers = {
    "StatusIntent": function(intent, session, response) {
        var speechOutput = "";
        var cardTitle = "My Plants";

        get('status', response, function(data) {
          var plantCondition = "healthy";
          
          speechOutput = "Your " + /*data.type*/'onion' + " is " + plantCondition;
            get('light/status/Light', response, function(data) {
              var lightState = false;
              if (data[0].power === "on") {
                lightState = true;
              }
              speechOutput += ". The lights are " + (lightState ? 'shining bright' : 'off')
                + ", and the temperature is good.";
              response.tellWithCard(speechOutput, "Plant Condition", speechOutput);
            });
        });
    },
    "DetailStatusIntent": function(intent, session, response) {
        var speechOutput = "";
        var cardTitle = "My Plants";
        
        get('status', response, function(data) {
          var lumens = data.lumens;
          var plantCondition = "healthy";
          
          speechOutput = "Here's the data on your " + /*data.type*/ "onion" + ": "
            + "It is currently " + data.temperature + " degrees in the room. "
            + "Humidity is at " + data.humidity + " percent. ";
          get('light/status/Light', response, function(data) {
            var lightState = false;
            if (data[0].power === "on") {
              lightState = true;
            }
            speechOutput += "The lights are " + (lightState ? 'on, ' : 'off, ');
            if (lightState) {
              speechOutput += ", and shining at " + lumens + " lumens, ";
            }
            speechOutput += " and your soil is dry.";
            
            response.tellWithCard(speechOutput, "Plant Condition", speechOutput);
          });
        });
    },
    "LightOnIntent": function(intent, session, response) {
        var speechOutput = "";
        var postData = {
          name: 'Light',
          power: 'on'
        }
        
        get('light/status/Light', response, function(data) {
          if (data[0].power === "on") {
            speechOutput = "The lights are already on.";
            response.tell(speechOutput);
          }
          post('light/update', postData, response, function(data) {
            speechOutput = "The light on your onion has been turned on."
            response.tell(speechOutput);
          });
        });
    },
    "LightOffIntent": function(intent, session, response) {
        var speechOutput = "";
        var postData = {
          name: 'Light',
          power: 'off'
        }
        
        get('light/status/Light', response, function(data) {
          if (data[0].power === "off") {
            speechOutput = "The lights are already off.";
            response.tell(speechOutput);
          }
          post('light/update', postData, response, function(data) {
            speechOutput = "The light on your onion has been turned off.";
            response.tell(speechOutput);
          });
        });
    },
    "PumpOnIntent": function(intent, session, response) {
        var speechOutput = "";
        var postData = {
          name: 'Pump',
          power: 'on'
        }
        
        post('pump/update', postData, response, function(data) {
          speechOutput = "The water pump for your " + /*data.type*/"onion" + " has been turned on.";
          response.tell(speechOutput);
        });
    },
    "PumpOffIntent": function(intent, session, response) {
        var speechOutput = "";
        var postData = {
          name: 'Pump',
          power: 'off'
        }
        
        post('pump/update', postData, response, function(data) {
          speechOutput = "The water pump for your " + /*data.type*/"onion" + " has been turned off.";
          response.tell(speechOutput);
        });
    },
    "AMAZON.HelpIntent": function(intent, session, response) {
        var speechOutput = "Welcome to Plants. I can perform a range of actions on plants linked "
          + "to me through the Blooming, as well as provide general information on your plants.";
        var cardTitle = "My Plants";
        response.askWithCard(speechOutput, speechOutput, cardTitle, speechOutput);
    }
};

exports.handler = function(event, context) {
    var PlantsHelper = new Plants();
    PlantsHelper.execute(event, context);
};

function get(endpoint, response, callback) {
  request.get({
    url: 'http://45.56.106.120/' + endpoint,
    json: true
  }, function (err, res, data) {
    if (err) {
      console.log(err);
      var speechOutput = "I'm having trouble communicating with the plant world. Try again later.";
      response.tell(speechOutput);
    }
    console.log(data);
    callback(data);
  });
}

function post(endpoint, postData, response, callback) {
  request.post({
    url: 'http://45.56.106.120/' + endpoint,
    json: true,
    body: postData
  }, function(err, res, data) {
    if (err) {
      console.log(err);
      var speechOutput = "I'm having trouble communicating with the plant world. Try again later.";
      response.tell(speechOutput);
    }
    console.log(data);
    callback(data);
  });
}