const axios = require("axios");
const fs = require("fs");
const {
  SearchClient,
  AzureKeyCredential,
} = require("@azure/search-documents");
const config = require("./config");


async function doSemanticHybridSearch(query) {

  const searchServiceEndpoint = config.AZURE_SEARCH_ENDPOINT;
  const searchServiceApiKey = config.AZURE_SEARCH_ADMIN_KEY;
  const searchIndexName = config.AZURE_SEARCH_INDEX_NAME;

  const searchClient = new SearchClient(
    searchServiceEndpoint,
    searchIndexName,
    new AzureKeyCredential(searchServiceApiKey)
  );

  try{
    const response = await searchClient.search(query, {
      vectors: {
        value: await generateEmbeddings(query),
        k: 3,
        fields: ["vector"],
      },
      select: ["title", "chunk", "vector"],
      queryType: "simple",
      queryLanguage: "en-us",
      semanticSearchOptions: {
        configurationName: "default",
      },
      top: 1,
    });
    
    for await (const result of response.results) {
      console.log(result); // process each result
      return result;
    }
  }
  catch (error) {
    console.log("Error when creating the search client: ", error);
  }
  
}

async function generateEmbeddings(text) {
  // Set Azure OpenAI API parameters from environment variables
  const apiKey = config.AZURE_OPENAI_API_KEY;
  const apiBase = `https://${config.AZURE_OPENAI_SERVICE_NAME}.openai.azure.com`;
  const apiVersion = config.AZURE_OPENAI_API_VERSION;
  const deploymentName = config.AZURE_OPENAI_DEPLOYMENT_NAME;

  const response = await axios.post(
    `${apiBase}/openai/deployments/${deploymentName}/embeddings?api-version=${apiVersion}`,
    {
      input: text,
      engine: "text-embedding-ada-002",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    }
  );

  const embeddings = response.data.data[0].embedding;
  return embeddings;
}
  
module.exports = { doSemanticHybridSearch};