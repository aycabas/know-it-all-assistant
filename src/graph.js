require('isomorphic-fetch');
const azure = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client');
const authProviders =require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
let _config = undefined;
let _clientSecretCredential = undefined;
let _appClient = undefined;

function initializeGraphForAppOnlyAuth(config) {
  // Ensure settings isn't null
  if (!config) {
    throw new Error('Settings cannot be undefined');
  }

  _config = config;

  // Ensure config isn't null
  if (!_config) {
    throw new Error('Settings cannot be undefined');
  }

  if (!_clientSecretCredential) {
    _clientSecretCredential = new azure.ClientSecretCredential(
      _config.aadTenantId,
      _config.aadClientId,
     _config.aadClientSecret
    
    );
  }

  if (!_appClient) {
    const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
      _clientSecretCredential, {
        scopes: [ 'https://graph.microsoft.com/.default' ]
      });

    _appClient = graph.Client.initWithMiddleware({
      authProvider: authProvider
    });
  }
}
module.exports.initializeGraphForAppOnlyAuth = initializeGraphForAppOnlyAuth;

async function listChatMessages(chatId){
    if (!_appClient) {
        throw new Error('Graph has not been initialized for app-only auth');
    }

    try { 
      const listChatMessages = await _appClient?.api('/chats/'+ chatId +'/messages')
        .orderby('createdDateTime desc')
        .top(5)
        .get();
        
        return listChatMessages;
    }
    catch (error) {
        console.log(error);
    }
}
module.exports.listChatMessages = listChatMessages;