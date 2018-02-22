# GatewaySoftwareApi.LightSensorsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**lightSensorsDelete**](LightSensorsApi.md#lightSensorsDelete) | **DELETE** /lightsensors/{id} | Deletes a light sensor from the system
[**lightSensorsDiscover**](LightSensorsApi.md#lightSensorsDiscover) | **POST** /lightsensors/discover | Discovers all light sensors in the system
[**lightSensorsEventPost**](LightSensorsApi.md#lightSensorsEventPost) | **POST** /lightsensors/{id}/events | Creates a light sensor event
[**lightSensorsGet**](LightSensorsApi.md#lightSensorsGet) | **GET** /lightsensors | Gets a list of all light sensors in the system
[**lightSensorsGetEvents**](LightSensorsApi.md#lightSensorsGetEvents) | **GET** /lightsensors/{id}/events | Gets a list of light sensor events
[**lightSensorsGetLightSensor**](LightSensorsApi.md#lightSensorsGetLightSensor) | **GET** /lightsensors/{id} | Gets a light sensor
[**lightSensorsPost**](LightSensorsApi.md#lightSensorsPost) | **POST** /lightsensors | Creates a light sensor
[**lightSensorsPut**](LightSensorsApi.md#lightSensorsPut) | **PUT** /lightsensors/{id} | Updates a light sensor


<a name="lightSensorsDelete"></a>
# **lightSensorsDelete**
> lightSensorsDelete(id)

Deletes a light sensor from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var id = 56; // Number | the ID of the light sensor to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightSensorsDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light sensor to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="lightSensorsDiscover"></a>
# **lightSensorsDiscover**
> lightSensorsDiscover()

Discovers all light sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightSensorsDiscover(callback);
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

<a name="lightSensorsEventPost"></a>
# **lightSensorsEventPost**
> lightSensorsEventPost(id, event)

Creates a light sensor event

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var id = 56; // Number | the ID of the light sensor

var event = new GatewaySoftwareApi.CreateLightSensorEventDto(); // CreateLightSensorEventDto | the event to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightSensorsEventPost(id, event, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light sensor | 
 **event** | [**CreateLightSensorEventDto**](CreateLightSensorEventDto.md)| the event to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="lightSensorsGet"></a>
# **lightSensorsGet**
> ListDtoLightSensorDto lightSensorsGet()

Gets a list of all light sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightSensorsGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoLightSensorDto**](ListDtoLightSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightSensorsGetEvents"></a>
# **lightSensorsGetEvents**
> ListDtoEventDto lightSensorsGetEvents(id)

Gets a list of light sensor events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var id = 56; // Number | the ID of the light sensor


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightSensorsGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light sensor | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightSensorsGetLightSensor"></a>
# **lightSensorsGetLightSensor**
> LightSensorDto lightSensorsGetLightSensor(id)

Gets a light sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var id = 56; // Number | the ID of the light sensor to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightSensorsGetLightSensor(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light sensor to be retrieved | 

### Return type

[**LightSensorDto**](LightSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightSensorsPost"></a>
# **lightSensorsPost**
> lightSensorsPost(lightSensor)

Creates a light sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var lightSensor = new GatewaySoftwareApi.CreateLightSensorDto(); // CreateLightSensorDto | the light sensor to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightSensorsPost(lightSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **lightSensor** | [**CreateLightSensorDto**](CreateLightSensorDto.md)| the light sensor to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="lightSensorsPut"></a>
# **lightSensorsPut**
> lightSensorsPut(id, lightSensor)

Updates a light sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightSensorsApi();

var id = 56; // Number | the ID of the light sensor to be updated

var lightSensor = new GatewaySoftwareApi.UpdateLightSensorDto(); // UpdateLightSensorDto | a light sensor containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightSensorsPut(id, lightSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light sensor to be updated | 
 **lightSensor** | [**UpdateLightSensorDto**](UpdateLightSensorDto.md)| a light sensor containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

