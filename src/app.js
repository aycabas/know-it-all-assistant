const { MemoryStorage, ActivityTypes, CardFactory } = require("botbuilder");
const config = require("./config");
const graph = require("./graph");
const {doSemanticHybridSearch} = require("./aisearch");
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
    //check if the message is from the bot application
    if(!message.from.application & message.chatId != null)
    {
      messageArray.push(message.body.content);
    } 
  }

  // add previous messages in the group chat into the input
  state.temp.input = messageArray.toString();

  // send user query and previous messages in the chat to OpenAI
  const result = await planner.beginTask(context,state);
  await context.sendActivity(result.commands[0].response);
  
  // search the user query in Azure AI Search
  const aiSearch = await doSemanticHybridSearch(context.activity.text);
  await context.sendActivity("Searching in the documentation...🤖...Bip...Bap...Bop...");
  await context.sendActivity(aiSearch.document.chunk);
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
