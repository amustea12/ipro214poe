# GatewaySoftwareApi.DimmersApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**dimmersDelete**](DimmersApi.md#dimmersDelete) | **DELETE** /dimmers/{id} | Deletes a dimmer from the system
[**dimmersDiscover**](DimmersApi.md#dimmersDiscover) | **POST** /dimmers/discover | Discovers all dimmers in the system
[**dimmersEventPost**](DimmersApi.md#dimmersEventPost) | **POST** /dimmers/{id}/events | Creates a dimmer event
[**dimmersGet**](DimmersApi.md#dimmersGet) | **GET** /dimmers | Gets a list of all dimmers in the system
[**dimmersGetDimmer**](DimmersApi.md#dimmersGetDimmer) | **GET** /dimmers/{id} | Gets a dimmer
[**dimmersGetEvents**](DimmersApi.md#dimmersGetEvents) | **GET** /dimmers/{id}/events | Gets a list of dimmer events
[**dimmersPost**](DimmersApi.md#dimmersPost) | **POST** /dimmers | Creates a dimmer
[**dimmersPut**](DimmersApi.md#dimmersPut) | **PUT** /dimmers/{id} | Updates a dimmer


<a name="dimmersDelete"></a>
# **dimmersDelete**
> dimmersDelete(id)

Deletes a dimmer from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var id = 56; // Number | the ID of the dimmer to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.dimmersDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the dimmer to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="dimmersDiscover"></a>
# **dimmersDiscover**
> dimmersDiscover()

Discovers all dimmers in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.dimmersDiscover(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="dimmersEventPost"></a>
# **dimmersEventPost**
> dimmersEventPost(id, event)

Creates a dimmer event

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var id = 56; // Number | the ID of the dimmer

var event = new GatewaySoftwareApi.CreateDimmerEventDto(); // CreateDimmerEventDto | the event to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.dimmersEventPost(id, event, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the dimmer | 
 **event** | [**CreateDimmerEventDto**](CreateDimmerEventDto.md)| the event to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="dimmersGet"></a>
# **dimmersGet**
> ListDtoDimmerDto dimmersGet()

Gets a list of all dimmers in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dimmersGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDimmerDto**](ListDtoDimmerDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="dimmersGetDimmer"></a>
# **dimmersGetDimmer**
> DimmerDto dimmersGetDimmer(id)

Gets a dimmer

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var id = 56; // Number | the ID of the dimmer to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dimmersGetDimmer(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the dimmer to be retrieved | 

### Return type

[**DimmerDto**](DimmerDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="dimmersGetEvents"></a>
# **dimmersGetEvents**
> ListDtoEventDto dimmersGetEvents(id)

Gets a list of dimmer events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var id = 56; // Number | the ID of the dimmer


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dimmersGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the dimmer | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="dimmersPost"></a>
# **dimmersPost**
> dimmersPost(dimmer)

Creates a dimmer

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var dimmer = new GatewaySoftwareApi.CreateDimmerDto(); // CreateDimmerDto | the dimmer to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.dimmersPost(dimmer, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **dimmer** | [**CreateDimmerDto**](CreateDimmerDto.md)| the dimmer to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="dimmersPut"></a>
# **dimmersPut**
> dimmersPut(id, dimmer)

Updates a dimmer

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DimmersApi();

var id = 56; // Number | the ID of the dimmer to be updated

var dimmer = new GatewaySoftwareApi.UpdateDimmerDto(); // UpdateDimmerDto | a dimmer containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.dimmersPut(id, dimmer, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the dimmer to be updated | 
 **dimmer** | [**UpdateDimmerDto**](UpdateDimmerDto.md)| a dimmer containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

