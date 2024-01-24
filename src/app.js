const { MemoryStorage, ActivityTypes } = require("botbuilder");
const config = require("./config");
const graph = require("./graph");

initializeGraph(config);

function initializeGraph(config) {
  graph.initializeGraphForAppOnlyAuth(config);
}

// See https://aka.ms/teams-ai-library to learn more about the Teams AI library.
const { Application, AI, preview } = require("@microsoft/teams-ai");

// See README.md to prepare your own OpenAI Assistant
if (!config.openAIKey || !config.openAIAssistantId) {
  throw new Error(
    "Missing OPENAI_API_KEY or OPENAI_ASSISTANT_ID. See README.md to prepare your own OpenAI Assistant."
  );
}

// Create AI components
// Use OpenAI
const planner = new preview.AssistantsPlanner({
  apiKey: config.openAIKey,
  assistant_id: config.openAIAssistantId,
});

// Define storage and application
const storage = new MemoryStorage();
const app = new Application({
  storage,
  ai: {
    planner,
  },
});

app.activity(ActivityTypes.Message, async (context, state) => {
  const messageArray = [];
  const chatMessages = await graph.listChatMessages(
    context.activity.conversation.id
  );
  for (const message of chatMessages.value) {  
    //check if the message is from the bot
    if(!message.from.application)
    {
      messageArray.push(message.body.content);
    } 
  }
  console.log(messageArray);
  state.temp.input = messageArray.toString();
  const result = await planner.beginTask(context,state);
  console.log(result.commands[0].response);
  await context.sendActivity(result.commands[0].response);
});

app.message("/reset", async (context, state) => {
  state.deleteConversationState();
  await context.sendActivity("Ok lets start this over.");
});

app.ai.action(AI.HttpErrorActionName, async (context, state, data) => {
  await context.sendActivity("An AI request failed. Please try again later.");
  return AI.StopCommandName;
});

module.exports = app;
