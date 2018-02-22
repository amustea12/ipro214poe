# GatewaySoftwareApi.ActionSetsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**actionSetsDelete**](ActionSetsApi.md#actionSetsDelete) | **DELETE** /actionsets/{id} | Deletes an action set from the system
[**actionSetsExecute**](ActionSetsApi.md#actionSetsExecute) | **POST** /actionsets/{id}/execute | Executes an action set
[**actionSetsGet**](ActionSetsApi.md#actionSetsGet) | **GET** /actionsets | Gets a list of action sets in the system
[**actionSetsGetActionSet**](ActionSetsApi.md#actionSetsGetActionSet) | **GET** /actionsets/{id} | Gets an action set
[**actionSetsGetEvents**](ActionSetsApi.md#actionSetsGetEvents) | **GET** /actionsets/{id}/events | Gets a list of action set events
[**actionSetsPost**](ActionSetsApi.md#actionSetsPost) | **POST** /actionsets | Creates an action set
[**actionSetsPut**](ActionSetsApi.md#actionSetsPut) | **PUT** /actionsets/{id} | Updates an action set


<a name="actionSetsDelete"></a>
# **actionSetsDelete**
> actionSetsDelete(id)

Deletes an action set from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var id = 56; // Number | the ID of the action set to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionSetsDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the action set to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="actionSetsExecute"></a>
# **actionSetsExecute**
> actionSetsExecute(id)

Executes an action set

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var id = 56; // Number | the ID of the action set to be executed


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionSetsExecute(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the action set to be executed | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="actionSetsGet"></a>
# **actionSetsGet**
> ListDtoActionSetDto actionSetsGet()

Gets a list of action sets in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionSetsGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoActionSetDto**](ListDtoActionSetDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionSetsGetActionSet"></a>
# **actionSetsGetActionSet**
> ActionSetDto actionSetsGetActionSet(id)

Gets an action set

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var id = 56; // Number | the ID of the action set to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionSetsGetActionSet(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the action set to be retrieved | 

### Return type

[**ActionSetDto**](ActionSetDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionSetsGetEvents"></a>
# **actionSetsGetEvents**
> ListDtoEventDto actionSetsGetEvents(id)

Gets a list of action set events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var id = 56; // Number | the ID of the action set


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.actionSetsGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the action set | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="actionSetsPost"></a>
# **actionSetsPost**
> actionSetsPost(actionSet)

Creates an action set

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var actionSet = new GatewaySoftwareApi.CreateActionSetDto(); // CreateActionSetDto | the action set to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionSetsPost(actionSet, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **actionSet** | [**CreateActionSetDto**](CreateActionSetDto.md)| the action set to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="actionSetsPut"></a>
# **actionSetsPut**
> actionSetsPut(id, actionSet)

Updates an action set

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ActionSetsApi();

var id = 56; // Number | the ID of the action set to be updated

var actionSet = new GatewaySoftwareApi.UpdateActionSetDto(); // UpdateActionSetDto | the updated values for the action set


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.actionSetsPut(id, actionSet, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the action set to be updated | 
 **actionSet** | [**UpdateActionSetDto**](UpdateActionSetDto.md)| the updated values for the action set | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

