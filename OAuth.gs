// TO-DO: Esta página es Kosovo. Hay que ordenar todo y borrar varias de las cosas que están completamente al pedo.

// Crea la toolbar
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [
    { name: "Upload to SalesForce", functionName: "salesforceEntryPoint" },
    { name: "Query Salesforce", functionName: "getDataSQL" },
  ];
  ss.addMenu("Salesforce.com", menuEntries);
}

// Recibe las GET Request a la aplicación (el token) y se encarga de dirigirlo para su guardado
function doGet(e) {
  var HTMLToOutput;
  if (e.parameters.code) {
    //if we get "code" as a parameter in, then this is a callback. we can make this more explicit
    getAndStoreAccessToken(e.parameters.code);
    HTMLToOutput =
      "<html><h1>Finished with oAuth</h1>You can close this window.</html>";
  }
  return HtmlService.createHtmlOutput(HTMLToOutput);
}

function salesforceEntryPoint() {
  if (isAccessTokenValid() && isRefreshTokenValid()) {
    HTMLToOutput = "<html><h1>Already have token</h1></html>";
  } else if (!isAccessTokenValid() && isRefreshTokenValid()) {
    getTokenUsingRefresh();
    HTMLToOutput = "<html><h1>Finished.</h1></html>";
  }
  SpreadsheetApp.getActiveSpreadsheet().show(
    HtmlService.createHtmlOutput(HTMLToOutput)
  );
}

// Desecha el Token para volver a generarlo, en caso de ser necesario.
function logOut() {
  PropertiesService.getUserProperties().deleteProperty(tokenPropertyName);
}

// ------------------------------------ ** PROCESO DE OAUTH (SOLO SE EJECUTA SI NO HAY UN REFRESH TOKEN DISPONIBLE) ** ------------------------------------

//this is the user propety where we'll store the token, make sure this is unique across all user properties across all scripts
var tokenPropertyName = "SALESFORCE_OAUTH_TOKEN";
var baseURLPropertyName = "SALESFORCE_INSTANCE_URL";
var refreshToken = "REFRESH_TOKEN";

//this is the URL where they'll authorize with salesforce.com
//may need to add a "scope" param here. like &scope=full for salesforce
function getURLForAuthorization() {
  const CLIENT_ID = PropertiesService.getScriptProperties().getProperty(
    "SALESFORCE_CLIENT_ID"
  );
  const REDIRECT_URL =
    PropertiesService.getScriptProperties().getProperty("REDIRECT_URL");
  const AUTHORIZE_URL =
    PropertiesService.getScriptProperties().getProperty("AUTHORIZE_URL");

  return (
    AUTHORIZE_URL +
    "?response_type=code&client_id=" +
    CLIENT_ID +
    "&redirect_uri=" +
    REDIRECT_URL
  );
}

function getAndStoreAccessToken(code) {
  const CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty(
    "SALESFORCE_CLIENT_SECRET"
  );
  const CLIENT_ID = PropertiesService.getScriptProperties().getProperty(
    "SALESFORCE_CLIENT_ID"
  );
  const REDIRECT_URL =
    PropertiesService.getScriptProperties().getProperty("REDIRECT_URL");
  const TOKEN_URL =
    PropertiesService.getScriptProperties().getProperty("TOKEN_URL");
  const REFRESH_TOKEN =
    PropertiesService.getUserProperties().getProperty("REFRESH_TOKEN");
  const ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var nextURL =
    TOKEN_URL +
    "?client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
    "&grant_type=authorization_code&redirect_uri=" +
    REDIRECT_URL +
    "&code=" +
    code;

  if (!REFRESH_TOKEN) {
    var response = UrlFetchApp.fetch(nextURL).getContentText();
    var tokenResponse = JSON.parse(response);

    ss.getRange(1, 1).setValue(response);

    //salesforce requires you to call against the instance URL that is against the token (eg. https://na9.salesforce.com/)
    PropertiesService.getUserProperties().setProperty(
      baseURLPropertyName,
      tokenResponse.instance_url
    );
    //store the token for later retrival
    PropertiesService.getUserProperties().setProperty(
      tokenPropertyName,
      tokenResponse.access_token
    );
    // Store refresh token
    PropertiesService.getUserProperties().setProperty(
      refreshToken,
      tokenResponse.refresh_token
    );
  } else {
  }
}

function getTokenUsingRefresh() {
  const CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty(
    "SALESFORCE_CLIENT_SECRET"
  );
  const CLIENT_ID = PropertiesService.getScriptProperties().getProperty(
    "SALESFORCE_CLIENT_ID"
  );
  const REFRESH_TOKEN =
    PropertiesService.getUserProperties().getProperty("REFRESH_TOKEN");
  let url =
    "https://login.salesforce.com/services/oauth2/token?" +
    "grant_type=refresh_token&client_id=" +
    CLIENT_ID +
    "&client_secret=" +
    CLIENT_SECRET +
    "&refresh_token=" +
    REFRESH_TOKEN;

  let response = UrlFetchApp.fetch(url).getContentText();
  var tokenResponse = JSON.parse(response);
  PropertiesService.getUserProperties().setProperty(
    tokenPropertyName,
    tokenResponse.access_token
  );
}

// TO-DO: Estas funciones son redundantes. Tienen los minutos contados ya...

function isRefreshTokenValid() {
  var token = PropertiesService.getUserProperties().getProperty(refreshToken);
  if (!token) {
    //if its empty or undefined
    return false;
  }
  return true; //naive check
}

function isAccessTokenValid() {
  var token =
    PropertiesService.getUserProperties().getProperty(tokenPropertyName);
  if (!token) {
    //if its empty or undefined
    return false;
  }
  return true; //naive check
}
