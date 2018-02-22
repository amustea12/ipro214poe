# GatewaySoftwareApi.ActionsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**actionsDelete**](ActionsApi.md#actionsDelete) | **DELETE** /actionsets/{actionSetId}/actions/{actionId} | Deletes an action from the system
[**actionsExecute**](ActionsApi.md#actionsExecute) | **POST** /actionsets/{actionSetId}/actions/{actionId}/execute | Executes an action
[**actionsGet**](ActionsApi.md#actionsGet) | **GET** /actionsets/{actionSetId}/actions | Gets a list of actions contained within an action set
[**actionsGetAction**](ActionsApi.md#actionsGetAction) | **GET** /actionsets/{actionSetId}/actions/{actionId} | Gets an action
[**actionsGetEvents**](ActionsApi.md#actionsGetEvents) | **GET** /actionsets/{actionSetId}/actions/{actionId}/events | Gets a list of action events
[**actionsPost**](ActionsApi.md#actionsPost) | **POST** /actionsets/{actionSetId}/actions | Creates an action
[**actionsPut**](ActionsApi.md#actionsPut) | **PUT** /actionsets/{actionSetId}/actions/{actionId} | Updates an action


<a name="actionsDelete"></a>
# **actionsDelete**
> actionsDelete(actionSetId, actionId)

Deletes an action from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var actionId = 56; // Number | the ID of the action to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionsDelete(actionSetId, actionId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **actionId** | **Number**| the ID of the action to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="actionsExecute"></a>
# **actionsExecute**
> actionsExecute(actionSetId, actionId)

Executes an action

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var actionId = 56; // Number | the ID of the action to be executed


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionsExecute(actionSetId, actionId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **actionId** | **Number**| the ID of the action to be executed | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="actionsGet"></a>
# **actionsGet**
> ListDtoActionDto actionsGet(actionSetId)

Gets a list of actions contained within an action set

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionsGet(actionSetId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set to be retrieved | 

### Return type

[**ListDtoActionDto**](ListDtoActionDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionsGetAction"></a>
# **actionsGetAction**
> ActionDto actionsGetAction(actionSetId, actionId)

Gets an action

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var actionId = 56; // Number | the ID of the action to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionsGetAction(actionSetId, actionId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **actionId** | **Number**| the ID of the action to be retrieved | 

### Return type

[**ActionDto**](ActionDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionsGetEvents"></a>
# **actionsGetEvents**
> ListDtoEventDto actionsGetEvents(actionSetId, actionId)

Gets a list of action events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var actionId = 56; // Number | the ID of the action


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionsGetEvents(actionSetId, actionId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **actionId** | **Number**| the ID of the action | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionsPost"></a>
# **actionsPost**
> actionsPost(actionSetId, action)

Creates an action

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var action = new GatewaySoftwareApi.CreateActionDto(); // CreateActionDto | the action to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionsPost(actionSetId, action, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **action** | [**CreateActionDto**](CreateActionDto.md)| the action to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="actionsPut"></a>
# **actionsPut**
> actionsPut(actionSetId, actionId, action)

Updates an action

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionsApi();

var actionSetId = 56; // Number | the ID of the action set

var actionId = 56; // Number | the ID of the action to be updated

var action = new GatewaySoftwareApi.UpdateActionDto(); // UpdateActionDto | the updated values for the action


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionsPut(actionSetId, actionId, action, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSetId** | **Number**| the ID of the action set | 
 **actionId** | **Number**| the ID of the action to be updated | 
 **action** | [**UpdateActionDto**](UpdateActionDto.md)| the updated values for the action | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

