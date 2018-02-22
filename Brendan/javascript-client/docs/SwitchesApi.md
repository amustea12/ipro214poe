# GatewaySoftwareApi.SwitchesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**switchesDelete**](SwitchesApi.md#switchesDelete) | **DELETE** /switches/{id} | Deletes a switch from the system
[**switchesDiscover**](SwitchesApi.md#switchesDiscover) | **POST** /switches/discover | Discovers all switches in the system
[**switchesEventPost**](SwitchesApi.md#switchesEventPost) | **POST** /switches/{id}/events | Creates a switch event
[**switchesGet**](SwitchesApi.md#switchesGet) | **GET** /switches | Gets a list of all switches in the system
[**switchesGetEvents**](SwitchesApi.md#switchesGetEvents) | **GET** /switches/{id}/events | Gets a list of switch events
[**switchesGetSwitch**](SwitchesApi.md#switchesGetSwitch) | **GET** /switches/{id} | Gets a switch
[**switchesPost**](SwitchesApi.md#switchesPost) | **POST** /switches | Creates a switch
[**switchesPut**](SwitchesApi.md#switchesPut) | **PUT** /switches/{id} | Updates a switch


<a name="switchesDelete"></a>
# **switchesDelete**
> switchesDelete(id)

Deletes a switch from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var id = 56; // Number | the ID of the switch to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.switchesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the switch to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="switchesDiscover"></a>
# **switchesDiscover**
> switchesDiscover()

Discovers all switches in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.switchesDiscover(callback);
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

<a name="switchesEventPost"></a>
# **switchesEventPost**
> switchesEventPost(id, event)

Creates a switch event

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var id = 56; // Number | the ID of the switch

var event = new GatewaySoftwareApi.CreateSwitchEventDto(); // CreateSwitchEventDto | the event to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.switchesEventPost(id, event, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the switch | 
 **event** | [**CreateSwitchEventDto**](CreateSwitchEventDto.md)| the event to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="switchesGet"></a>
# **switchesGet**
> ListDtoSwitchDto switchesGet()

Gets a list of all switches in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.switchesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoSwitchDto**](ListDtoSwitchDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="switchesGetEvents"></a>
# **switchesGetEvents**
> ListDtoEventDto switchesGetEvents(id)

Gets a list of switch events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var id = 56; // Number | the ID of the switch


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.switchesGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the switch | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="switchesGetSwitch"></a>
# **switchesGetSwitch**
> SwitchDto switchesGetSwitch(id)

Gets a switch

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var id = 56; // Number | the ID of the switch to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.switchesGetSwitch(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the switch to be retrieved | 

### Return type

[**SwitchDto**](SwitchDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="switchesPost"></a>
# **switchesPost**
> switchesPost(_switch)

Creates a switch

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var _switch = new GatewaySoftwareApi.CreateSwitchDto(); // CreateSwitchDto | the switch to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.switchesPost(_switch, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **_switch** | [**CreateSwitchDto**](CreateSwitchDto.md)| the switch to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="switchesPut"></a>
# **switchesPut**
> switchesPut(id, _switch)

Updates a switch

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SwitchesApi();

var id = 56; // Number | the ID of the switch to be updated

var _switch = new GatewaySoftwareApi.UpdateSwitchDto(); // UpdateSwitchDto | a switch containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.switchesPut(id, _switch, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the switch to be updated | 
 **_switch** | [**UpdateSwitchDto**](UpdateSwitchDto.md)| a switch containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

