# GatewaySoftwareApi.ApplicationKeysApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**applicationKeysDelete**](ApplicationKeysApi.md#applicationKeysDelete) | **DELETE** /applicationkeys/{id} | Deletes an application key from the system
[**applicationKeysGet**](ApplicationKeysApi.md#applicationKeysGet) | **GET** /applicationkeys | Gets a list of all application keys in the system
[**applicationKeysGetApplicationKey**](ApplicationKeysApi.md#applicationKeysGetApplicationKey) | **GET** /applicationkeys/{id} | Gets an application key
[**applicationKeysPost**](ApplicationKeysApi.md#applicationKeysPost) | **POST** /applicationkeys | Creates an application key
[**applicationKeysPut**](ApplicationKeysApi.md#applicationKeysPut) | **PUT** /applicationkeys/{id} | Updates an application key


<a name="applicationKeysDelete"></a>
# **applicationKeysDelete**
> applicationKeysDelete(id)

Deletes an application key from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ApplicationKeysApi();

var id = 56; // Number | the ID of the application key to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.applicationKeysDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the application key to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="applicationKeysGet"></a>
# **applicationKeysGet**
> ListDtoApplicationKeyDto applicationKeysGet()

Gets a list of all application keys in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ApplicationKeysApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.applicationKeysGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoApplicationKeyDto**](ListDtoApplicationKeyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="applicationKeysGetApplicationKey"></a>
# **applicationKeysGetApplicationKey**
> ApplicationKeyDto applicationKeysGetApplicationKey(id)

Gets an application key

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ApplicationKeysApi();

var id = 56; // Number | the ID of the application key to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.applicationKeysGetApplicationKey(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the application key to be retrieved | 

### Return type

[**ApplicationKeyDto**](ApplicationKeyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="applicationKeysPost"></a>
# **applicationKeysPost**
> applicationKeysPost(applicationKey)

Creates an application key

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ApplicationKeysApi();

var applicationKey = new GatewaySoftwareApi.CreateApplicationKeyDto(); // CreateApplicationKeyDto | the application key


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.applicationKeysPost(applicationKey, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **applicationKey** | [**CreateApplicationKeyDto**](CreateApplicationKeyDto.md)| the application key | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="applicationKeysPut"></a>
# **applicationKeysPut**
> applicationKeysPut(id, applicationKey)

Updates an application key

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ApplicationKeysApi();

var id = 56; // Number | the ID of the application key to be updated

var applicationKey = new GatewaySoftwareApi.UpdateApplicationKeyDto(); // UpdateApplicationKeyDto | the updated values for the aplication key


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.applicationKeysPut(id, applicationKey, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the application key to be updated | 
 **applicationKey** | [**UpdateApplicationKeyDto**](UpdateApplicationKeyDto.md)| the updated values for the aplication key | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

