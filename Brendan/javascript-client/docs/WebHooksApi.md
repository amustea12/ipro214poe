# GatewaySoftwareApi.WebHooksApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webHooksDelete**](WebHooksApi.md#webHooksDelete) | **DELETE** /applicationkeys/{applicationKeyId}/webhooks/{webHookId} | Unregisters a web hook
[**webHooksGetAll**](WebHooksApi.md#webHooksGetAll) | **GET** /applicationkeys/{applicationKeyId}/webhooks | Gets a list of all web hooks in the system
[**webHooksGetById**](WebHooksApi.md#webHooksGetById) | **GET** /applicationkeys/{applicationKeyId}/webhooks/{webHookId} | Gets a web hook
[**webHooksRegister**](WebHooksApi.md#webHooksRegister) | **POST** /applicationkeys/{applicationKeyId}/webhooks | Registers a web hook
[**webHooksSupportedEvents**](WebHooksApi.md#webHooksSupportedEvents) | **GET** /webhooks/supported-events | Gets a list of supported web hook events
[**webHooksUpdate**](WebHooksApi.md#webHooksUpdate) | **PUT** /applicationkeys/{applicationKeyId}/webhooks/{webHookId} | Updates a web hook


<a name="webHooksDelete"></a>
# **webHooksDelete**
> webHooksDelete(applicationKeyId, webHookId)

Unregisters a web hook

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var applicationKeyId = 56; // Number | the ID of the application key

var webHookId = 56; // Number | the ID of the web hook


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.webHooksDelete(applicationKeyId, webHookId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKeyId** | **Number**| the ID of the application key | 
 **webHookId** | **Number**| the ID of the web hook | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="webHooksGetAll"></a>
# **webHooksGetAll**
> ListDtoWebHookDto webHooksGetAll(applicationKeyId)

Gets a list of all web hooks in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var applicationKeyId = 56; // Number | the ID of the application key


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.webHooksGetAll(applicationKeyId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKeyId** | **Number**| the ID of the application key | 

### Return type

[**ListDtoWebHookDto**](ListDtoWebHookDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="webHooksGetById"></a>
# **webHooksGetById**
> WebHookDto webHooksGetById(applicationKeyId, webHookId)

Gets a web hook

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var applicationKeyId = 56; // Number | the ID of the application key

var webHookId = 56; // Number | the ID of the web hook


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.webHooksGetById(applicationKeyId, webHookId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKeyId** | **Number**| the ID of the application key | 
 **webHookId** | **Number**| the ID of the web hook | 

### Return type

[**WebHookDto**](WebHookDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="webHooksRegister"></a>
# **webHooksRegister**
> webHooksRegister(applicationKeyId, webHook)

Registers a web hook

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var applicationKeyId = 56; // Number | the ID of the application key

var webHook = new GatewaySoftwareApi.CreateWebHookDto(); // CreateWebHookDto | the web hook to register


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.webHooksRegister(applicationKeyId, webHook, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKeyId** | **Number**| the ID of the application key | 
 **webHook** | [**CreateWebHookDto**](CreateWebHookDto.md)| the web hook to register | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="webHooksSupportedEvents"></a>
# **webHooksSupportedEvents**
> ListDtoString webHooksSupportedEvents()

Gets a list of supported web hook events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.webHooksSupportedEvents(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoString**](ListDtoString.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="webHooksUpdate"></a>
# **webHooksUpdate**
> webHooksUpdate(applicationKeyId, webHookId, webHook)

Updates a web hook

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.WebHooksApi();

var applicationKeyId = 56; // Number | the ID of the application key

var webHookId = 56; // Number | the ID of the web hook

var webHook = new GatewaySoftwareApi.UpdateWebHookDto(); // UpdateWebHookDto | a web hook containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.webHooksUpdate(applicationKeyId, webHookId, webHook, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKeyId** | **Number**| the ID of the application key | 
 **webHookId** | **Number**| the ID of the web hook | 
 **webHook** | [**UpdateWebHookDto**](UpdateWebHookDto.md)| a web hook containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

