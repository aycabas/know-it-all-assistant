const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  openAIKey: process.env.OPENAI_API_KEY,
  openAIAssistantId: process.env.OPENAI_ASSISTANT_ID,
  aadClientId: process.env.AAD_CLIENT_ID,
  aadClientSecret: process.env.AAD_CLIENT_SECRET,
  aadTenantId: process.env.AAD_TENANT_ID,
  AZURE_OPENAI_SERVICE_NAME: process.env.AZURE_OPENAI_SERVICE_NAME,
  AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
  AZURE_SEARCH_ENDPOINT: process.env.AZURE_SEARCH_ENDPOINT,
  AZURE_SEARCH_ADMIN_KEY: process.env.AZURE_SEARCH_ADMIN_KEY,
  AZURE_SEARCH_INDEX_NAME: process.env.AZURE_SEARCH_INDEX_NAME
};

module.exports = config;
