const fs = require('fs'); // import the ability to read files


/**
 * This is the main Node.js server script for your project
 */

const path = require("path");

// load up the state info
let rawdata = fs.readFileSync('stateinfo.json')
let stateInfo = JSON.parse(rawdata)

// load up the questions
rawdata = fs.readFileSync('questions.json')
let questions = JSON.parse(rawdata)

// load the law sample data
rawdata = fs.readFileSync('laws.json')
let laws = JSON.parse(rawdata)




// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

/**
 * Our API endpoint test for state name
 *
 * Reply back some info 
 */
fastify.get("/state", function (request, reply) {
  
  console.log(request.query); // click the logs button at the bottom of the screen to keep an eye on this

  let stateFromUrl = request.query['{last_user_msg}'];  // parse out the ?variableFromBotsify=something from the URL
  
  // now that we have a state, grab the right info from the JSON file
  let requestedState = stateInfo.states.filter(s => s.state.toLowerCase() == stateFromUrl)[0] 
  
  //console.log(stateFromUrl);
  // console.log(requestedState)

  let myData = [{  // relay back the info parsed from the url
    text: "Looks like you're in..."+ stateFromUrl
  },
  {
    text: requestedState['description']
  }];


  
  // console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});


/**
 * Our API endpoint test to confirm state
 *
 * Reply back some info 
 */
/*
fastify.get("/confirm", function (request, reply) {
  
  console.log(request.query); // click the logs button at the bottom of the screen to keep an eye on this

  let stateFromUrl = request.query['{last_user_msg}'];  // parse out the ?variableFromBotsify=something from the URL
  
  // now that we have a state, grab the right info from the JSON file
  let requestedState = stateInfo.states.filter(s => s.state.toLowerCase() == stateFromUrl)[0]
  
  //console.log(stateFromUrl);
  // console.log(requestedState)
  
  let myData = [{  // relay back the info parsed from the url
    text: "Looks like you're in ... "+ stateFromUrl
  },
  {
    text: requestedState['description'],
  }];
  
  console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});
*/


/**
 * Send back with the question text based on the questionID
 */
fastify.get("/choices", function (request, reply) {
  
  console.log(request.query); // click the logs button at the bottom of the screen to keep an eye on this

  let questionID = request.query['{user/questionID}[0]'];
  
  console.log(questionID)
  
  // now that we have a question ID, grab the right question from the JSON file
  let questionToAsk = questions.questions.filter(q => q.id == questionID)[0]["question"]
  console.log(questionToAsk)

  
  let myData = [{text: questionToAsk}];  

  
  console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});


/**
 * Deal with a question response
 */
fastify.get("/handle-answer", function (request, reply) {
  
  console.log(request.query); // click the logs button at the bottom of the screen to keep an eye on this

  let response = request.query['{last_user_msg}'];
  let questionID = request.query['{user/questionID}[0]'];
  
  console.log(response);
  console.log(questionID);
  let responseId;
  if (response == "1") {
    responseId = 'r1';
  } else if (response == "2") {
      responseId = 'r2';
  } else {
      responseId = 'r3'
  }
  console.log(responseId)

  
  // now that we have a question ID, grab the right question from the JSON file
  let question = questions.questions.filter(q => q.id == questionID)[0];
  let nextQuestionId = question.responses[responseId];
  console.log(nextQuestionId);
  let nextQuestionText = questions.questions.filter(q => q.id == nextQuestionId)[0]["question"]

  
  let myData = [{text: nextQuestionText}];  

  
  console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});





/**
 * Deal with the user choosing the law path
 */
fastify.get("/laws", function (request, reply) {
  
  console.log(request.query); 
  
  let response = request.query['{last_user_msg}'];
  let questionID = request.query['{user/questionID}[0]'];
  
  console.log(response);
  console.log(questionID);
  let responseId;
  if (response == "1") {
    responseId = 'r1';
  } else if (response == "2") {
      responseId = 'r2';
  } else {
      responseId = 'r3'
  }
  console.log(responseId)

  // now that we have a question ID, grab the right question from the JSON file
  let question = questions.questions.filter(q => q.id == questionID)[0];
  let nextQuestionId = question.responses[responseId];
  console.log(nextQuestionId);
  let nextQuestionText = questions.questions.filter(q => q.id == nextQuestionId)[0]["question"]
  
  let myData = [{text: nextQuestionText}]; 

  
  console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});







/**
 * Deal with printing laws based off the laws sheet (temporarily, should be stateInfo)
 */
fastify.get("/print-laws", function (request, reply) {
  
  console.log(request.query); 
  
  let userState = request.query['{user/state}[0]'];
  console.log(userState);
  let requestedState = laws.laws.filter(l => l.state.toLowerCase() == userState)[0] 
  console.log(requestedState);
  
  let myData = [{text: requestedState['laws_prep']}, {text: requestedState['restrictive_laws']},
               {text: requestedState['expansive_laws']}]; 

  
  console.log(myData);

  reply.header("Content-Type", "application/json"); // tell the computer that asked that this is JSON
  reply.send(myData);  // send the data back to the server that asked
});



// Run the server and report out to the logs
fastify.listen(process.env.PORT, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
