# GatewaySoftwareApi.MotionSensorsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**motionSensorsDelete**](MotionSensorsApi.md#motionSensorsDelete) | **DELETE** /motionsensors/{id} | Deletes a motion sensor from the system
[**motionSensorsDiscover**](MotionSensorsApi.md#motionSensorsDiscover) | **POST** /motionsensors/discover | Discovers all motion sensors in the system
[**motionSensorsEventPost**](MotionSensorsApi.md#motionSensorsEventPost) | **POST** /motionsensors/{id}/events | Creates a motion sensor event
[**motionSensorsGet**](MotionSensorsApi.md#motionSensorsGet) | **GET** /motionsensors | Gets a list of all motion sensors in the system
[**motionSensorsGetEvents**](MotionSensorsApi.md#motionSensorsGetEvents) | **GET** /motionsensors/{id}/events | Gets a list of motion sensor events
[**motionSensorsGetMotionSensor**](MotionSensorsApi.md#motionSensorsGetMotionSensor) | **GET** /motionsensors/{id} | Gets a motion sensor
[**motionSensorsPost**](MotionSensorsApi.md#motionSensorsPost) | **POST** /motionsensors | Creates a motion sensor
[**motionSensorsPut**](MotionSensorsApi.md#motionSensorsPut) | **PUT** /motionsensors/{id} | Updates a motion sensor


<a name="motionSensorsDelete"></a>
# **motionSensorsDelete**
> motionSensorsDelete(id)

Deletes a motion sensor from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var id = 56; // Number | the ID of the motion sensor to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.motionSensorsDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the motion sensor to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="motionSensorsDiscover"></a>
# **motionSensorsDiscover**
> motionSensorsDiscover()

Discovers all motion sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.motionSensorsDiscover(callback);
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

<a name="motionSensorsEventPost"></a>
# **motionSensorsEventPost**
> motionSensorsEventPost(id, event)

Creates a motion sensor event

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var id = 56; // Number | the ID of the motion sensor

var event = new GatewaySoftwareApi.CreateMotionSensorEventDto(); // CreateMotionSensorEventDto | the event to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.motionSensorsEventPost(id, event, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the motion sensor | 
 **event** | [**CreateMotionSensorEventDto**](CreateMotionSensorEventDto.md)| the event to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="motionSensorsGet"></a>
# **motionSensorsGet**
> ListDtoMotionSensorDto motionSensorsGet()

Gets a list of all motion sensors in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.motionSensorsGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoMotionSensorDto**](ListDtoMotionSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="motionSensorsGetEvents"></a>
# **motionSensorsGetEvents**
> ListDtoEventDto motionSensorsGetEvents(id)

Gets a list of motion sensor events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var id = 56; // Number | the ID of the motion sensor


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.motionSensorsGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the motion sensor | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="motionSensorsGetMotionSensor"></a>
# **motionSensorsGetMotionSensor**
> MotionSensorDto motionSensorsGetMotionSensor(id)

Gets a motion sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var id = 56; // Number | the ID of the motion sensor to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.motionSensorsGetMotionSensor(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the motion sensor to be retrieved | 

### Return type

[**MotionSensorDto**](MotionSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="motionSensorsPost"></a>
# **motionSensorsPost**
> motionSensorsPost(motionSensor)

Creates a motion sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var motionSensor = new GatewaySoftwareApi.CreateMotionSensorDto(); // CreateMotionSensorDto | the motion sensor to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.motionSensorsPost(motionSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **motionSensor** | [**CreateMotionSensorDto**](CreateMotionSensorDto.md)| the motion sensor to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="motionSensorsPut"></a>
# **motionSensorsPut**
> motionSensorsPut(id, motionSensor)

Updates a motion sensor

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.MotionSensorsApi();

var id = 56; // Number | the ID of the motion sensor to be updated

var motionSensor = new GatewaySoftwareApi.UpdateMotionSensorDto(); // UpdateMotionSensorDto | a motion sensor containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.motionSensorsPut(id, motionSensor, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the motion sensor to be updated | 
 **motionSensor** | [**UpdateMotionSensorDto**](UpdateMotionSensorDto.md)| a motion sensor containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

