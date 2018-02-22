# GatewaySoftwareApi.TemperatureSensorsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**temperatureSensorsDelete**](TemperatureSensorsApi.md#temperatureSensorsDelete) | **DELETE** /temperaturesensors/{id} | Deletes a temperature sensor from the system
[**temperatureSensorsDiscover**](TemperatureSensorsApi.md#temperatureSensorsDiscover) | **POST** /temperaturesensors/discover | Discovers all temperature sensors in the system
[**temperatureSensorsEventPost**](TemperatureSensorsApi.md#temperatureSensorsEventPost) | **POST** /temperaturesensors/{id}/events | Creates a temperature sensor event
[**temperatureSensorsGet**](TemperatureSensorsApi.md#temperatureSensorsGet) | **GET** /temperaturesensors | Gets a list of all temperature sensors in the system
[**temperatureSensorsGetEvents**](TemperatureSensorsApi.md#temperatureSensorsGetEvents) | **GET** /temperaturesensors/{id}/events | Gets a list of temperature sensor events
[**temperatureSensorsGetTemperatureSensor**](TemperatureSensorsApi.md#temperatureSensorsGetTemperatureSensor) | **GET** /temperaturesensors/{id} | Gets a temperature sensor
[**temperatureSensorsPost**](TemperatureSensorsApi.md#temperatureSensorsPost) | **POST** /temperaturesensors | Creates a temperature sensor
[**temperatureSensorsPut**](TemperatureSensorsApi.md#temperatureSensorsPut) | **PUT** /temperaturesensors/{id} | Updates a temperature sensor


<a name="temperatureSensorsDelete"></a>
# **temperatureSensorsDelete**
> temperatureSensorsDelete(id)

Deletes a temperature sensor from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var id = 56; // Number | the ID of the temperature sensor to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.temperatureSensorsDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the temperature sensor to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="temperatureSensorsDiscover"></a>
# **temperatureSensorsDiscover**
> temperatureSensorsDiscover()

Discovers all temperature sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.temperatureSensorsDiscover(callback);
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

<a name="temperatureSensorsEventPost"></a>
# **temperatureSensorsEventPost**
> temperatureSensorsEventPost(id, event)

Creates a temperature sensor event

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var id = 56; // Number | the ID of the temperature sensor

var event = new GatewaySoftwareApi.CreateTemperatureSensorEventDto(); // CreateTemperatureSensorEventDto | the event to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.temperatureSensorsEventPost(id, event, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the temperature sensor | 
 **event** | [**CreateTemperatureSensorEventDto**](CreateTemperatureSensorEventDto.md)| the event to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="temperatureSensorsGet"></a>
# **temperatureSensorsGet**
> ListDtoTemperatureSensorDto temperatureSensorsGet()

Gets a list of all temperature sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.temperatureSensorsGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoTemperatureSensorDto**](ListDtoTemperatureSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="temperatureSensorsGetEvents"></a>
# **temperatureSensorsGetEvents**
> ListDtoEventDto temperatureSensorsGetEvents(id)

Gets a list of temperature sensor events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var id = 56; // Number | the ID of the temperature sensor


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.temperatureSensorsGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the temperature sensor | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="temperatureSensorsGetTemperatureSensor"></a>
# **temperatureSensorsGetTemperatureSensor**
> TemperatureSensorDto temperatureSensorsGetTemperatureSensor(id)

Gets a temperature sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var id = 56; // Number | the ID of the temperature sensor to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.temperatureSensorsGetTemperatureSensor(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the temperature sensor to be retrieved | 

### Return type

[**TemperatureSensorDto**](TemperatureSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="temperatureSensorsPost"></a>
# **temperatureSensorsPost**
> temperatureSensorsPost(temperatureSensor)

Creates a temperature sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var temperatureSensor = new GatewaySoftwareApi.CreateTemperatureSensorDto(); // CreateTemperatureSensorDto | the temperature sensor to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.temperatureSensorsPost(temperatureSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **temperatureSensor** | [**CreateTemperatureSensorDto**](CreateTemperatureSensorDto.md)| the temperature sensor to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="temperatureSensorsPut"></a>
# **temperatureSensorsPut**
> temperatureSensorsPut(id, temperatureSensor)

Updates a temperature sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.TemperatureSensorsApi();

var id = 56; // Number | the ID of the temperature sensor to be updated

var temperatureSensor = new GatewaySoftwareApi.UpdateTemperatureSensorDto(); // UpdateTemperatureSensorDto | a temperature sensor containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.temperatureSensorsPut(id, temperatureSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the temperature sensor to be updated | 
 **temperatureSensor** | [**UpdateTemperatureSensorDto**](UpdateTemperatureSensorDto.md)| a temperature sensor containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

