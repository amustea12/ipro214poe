# GatewaySoftwareApi.SpacesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**spacesDelete**](SpacesApi.md#spacesDelete) | **DELETE** /spaces/{id} | Deletes a space from the system
[**spacesDeleteDimmer**](SpacesApi.md#spacesDeleteDimmer) | **DELETE** /spaces/{id}/dimmers/{deviceId} | Removes a dimmer from a space
[**spacesDeleteLight**](SpacesApi.md#spacesDeleteLight) | **DELETE** /spaces/{id}/lights/{deviceId} | Removes a light from a space
[**spacesDeleteLightSensor**](SpacesApi.md#spacesDeleteLightSensor) | **DELETE** /spaces/{id}/lightsensors/{deviceId} | Removes a light sensor from a space
[**spacesDeleteMotionSensor**](SpacesApi.md#spacesDeleteMotionSensor) | **DELETE** /spaces/{id}/motionsensors/{deviceId} | Removes a motion sensor from a space
[**spacesDeletePolicy**](SpacesApi.md#spacesDeletePolicy) | **DELETE** /spaces/{id}/policy | Deletes a policy for a space
[**spacesDeleteRelay**](SpacesApi.md#spacesDeleteRelay) | **DELETE** /spaces/{id}/relays/{deviceId} | Removes a relay from a space
[**spacesDeleteSwitch**](SpacesApi.md#spacesDeleteSwitch) | **DELETE** /spaces/{id}/switches/{deviceId} | Removes a switch from a space
[**spacesDeleteTemperatureSensor**](SpacesApi.md#spacesDeleteTemperatureSensor) | **DELETE** /spaces/{id}/temperaturesensors/{deviceId} | Removes a temperature sensor from a space
[**spacesGet**](SpacesApi.md#spacesGet) | **GET** /spaces | Gets a list of spaces in the system
[**spacesGetActivePolicy**](SpacesApi.md#spacesGetActivePolicy) | **GET** /spaces/{id}/activepolicy | Gets a list of the active policy values for the space
[**spacesGetAllSpaceEvents**](SpacesApi.md#spacesGetAllSpaceEvents) | **GET** /spaces/{id}/events/all | Gets a list of all events for the space
[**spacesGetDevices**](SpacesApi.md#spacesGetDevices) | **GET** /spaces/{id}/devices | Gets a list of devices contained in a space
[**spacesGetDimmers**](SpacesApi.md#spacesGetDimmers) | **GET** /spaces/{id}/dimmers | Gets a list of dimmers in the space
[**spacesGetLightSensors**](SpacesApi.md#spacesGetLightSensors) | **GET** /spaces/{id}/lightsensors | Gets a list of light sensors in the space
[**spacesGetLights**](SpacesApi.md#spacesGetLights) | **GET** /spaces/{id}/lights | Gets a list of lights in the space
[**spacesGetMotionSensors**](SpacesApi.md#spacesGetMotionSensors) | **GET** /spaces/{id}/motionsensors | Gets a list of motion sensors in the space
[**spacesGetRelays**](SpacesApi.md#spacesGetRelays) | **GET** /spaces/{id}/relays | Gets a list of relays in the space
[**spacesGetSpace**](SpacesApi.md#spacesGetSpace) | **GET** /spaces/{id} | Gets a space
[**spacesGetSpaceEvents**](SpacesApi.md#spacesGetSpaceEvents) | **GET** /spaces/{id}/events | Gets a list of recent events for the space.
[**spacesGetSpacePolicy**](SpacesApi.md#spacesGetSpacePolicy) | **GET** /spaces/{id}/policy | Gets a policy for a space
[**spacesGetSwitches**](SpacesApi.md#spacesGetSwitches) | **GET** /spaces/{id}/switches | Gets a list of switches in the space
[**spacesGetTemperatureSensors**](SpacesApi.md#spacesGetTemperatureSensors) | **GET** /spaces/{id}/temperaturesensors | Gets a list of temperature sensors contained in a space
[**spacesGetTimer**](SpacesApi.md#spacesGetTimer) | **GET** /spaces/{id}/timer | Gets the vacancy timer for the space if one exists
[**spacesGetType**](SpacesApi.md#spacesGetType) | **GET** /spaces/{id}/spacetype | Gets the type of the space
[**spacesGetZones**](SpacesApi.md#spacesGetZones) | **GET** /spaces/{id}/zones | Gets a list of zones contained in a space
[**spacesLighting**](SpacesApi.md#spacesLighting) | **POST** /spaces/{id}/lighting | Sets the level of the lights in a space
[**spacesPost**](SpacesApi.md#spacesPost) | **POST** /spaces | Creates a space
[**spacesPostClearZoneConfig**](SpacesApi.md#spacesPostClearZoneConfig) | **POST** /spaces/{id}/zones/config/exit | Exits the zone configuration mode for the space
[**spacesPostPolicy**](SpacesApi.md#spacesPostPolicy) | **POST** /spaces/{id}/policy | Creates a policy for a space
[**spacesPostSaveZoneConfig**](SpacesApi.md#spacesPostSaveZoneConfig) | **POST** /spaces/{id}/zones/config/save | Saves the zone configuration
[**spacesPostSetZoneConfig**](SpacesApi.md#spacesPostSetZoneConfig) | **POST** /spaces/{id}/zones/config/enter | Enters the zone configuration mode for the space
[**spacesPostZone**](SpacesApi.md#spacesPostZone) | **POST** /spaces/{id}/zones | Creates a new zone within a space
[**spacesPut**](SpacesApi.md#spacesPut) | **PUT** /spaces/{id} | Updates a space
[**spacesPutDevices**](SpacesApi.md#spacesPutDevices) | **PUT** /spaces/{id}/devices | Adds a device to a space
[**spacesPutPolicy**](SpacesApi.md#spacesPutPolicy) | **PUT** /spaces/{id}/policy | Updates a policy for a space
[**spacesPutType**](SpacesApi.md#spacesPutType) | **PUT** /spaces/{id}/spacetype | Sets the type of the space
[**spacesSynchronize**](SpacesApi.md#spacesSynchronize) | **POST** /spaces/synchronize | Synchronizes the state of all lights with the state of their space
[**spacesTurnOff**](SpacesApi.md#spacesTurnOff) | **POST** /spaces/{id}/turnoff | Turns off all lights in a space
[**spacesTurnOn**](SpacesApi.md#spacesTurnOn) | **POST** /spaces/{id}/turnon | Turns on all lights in a space


<a name="spacesDelete"></a>
# **spacesDelete**
> spacesDelete(id)

Deletes a space from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteDimmer"></a>
# **spacesDeleteDimmer**
> spacesDeleteDimmer(id, deviceId)

Removes a dimmer from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the dimmer to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteDimmer(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the dimmer to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteLight"></a>
# **spacesDeleteLight**
> spacesDeleteLight(id, deviceId)

Removes a light from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the light to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteLight(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the light to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteLightSensor"></a>
# **spacesDeleteLightSensor**
> spacesDeleteLightSensor(id, deviceId)

Removes a light sensor from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the light sensor to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteLightSensor(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the light sensor to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteMotionSensor"></a>
# **spacesDeleteMotionSensor**
> spacesDeleteMotionSensor(id, deviceId)

Removes a motion sensor from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the motion sensor to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteMotionSensor(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the motion sensor to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeletePolicy"></a>
# **spacesDeletePolicy**
> spacesDeletePolicy(id)

Deletes a policy for a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeletePolicy(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteRelay"></a>
# **spacesDeleteRelay**
> spacesDeleteRelay(id, deviceId)

Removes a relay from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the relay to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteRelay(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the relay to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteSwitch"></a>
# **spacesDeleteSwitch**
> spacesDeleteSwitch(id, deviceId)

Removes a switch from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the switch to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteSwitch(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the switch to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesDeleteTemperatureSensor"></a>
# **spacesDeleteTemperatureSensor**
> spacesDeleteTemperatureSensor(id, deviceId)

Removes a temperature sensor from a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var deviceId = 56; // Number | the ID of the temperature sensor to remove


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesDeleteTemperatureSensor(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **deviceId** | **Number**| the ID of the temperature sensor to remove | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesGet"></a>
# **spacesGet**
> ListDtoSpaceDto spacesGet()

Gets a list of spaces in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoSpaceDto**](ListDtoSpaceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetActivePolicy"></a>
# **spacesGetActivePolicy**
> ListDtoActivePolicyValueDto spacesGetActivePolicy(id)

Gets a list of the active policy values for the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetActivePolicy(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoActivePolicyValueDto**](ListDtoActivePolicyValueDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetAllSpaceEvents"></a>
# **spacesGetAllSpaceEvents**
> ListDtoEventDto spacesGetAllSpaceEvents(id)

Gets a list of all events for the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetAllSpaceEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetDevices"></a>
# **spacesGetDevices**
> ListDtoDeviceDto spacesGetDevices(id)

Gets a list of devices contained in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetDevices(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetDimmers"></a>
# **spacesGetDimmers**
> ListDtoDimmerDto spacesGetDimmers(id)

Gets a list of dimmers in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetDimmers(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoDimmerDto**](ListDtoDimmerDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetLightSensors"></a>
# **spacesGetLightSensors**
> ListDtoLightSensorDto spacesGetLightSensors(id)

Gets a list of light sensors in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetLightSensors(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoLightSensorDto**](ListDtoLightSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetLights"></a>
# **spacesGetLights**
> ListDtoLightDto spacesGetLights(id)

Gets a list of lights in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetLights(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoLightDto**](ListDtoLightDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetMotionSensors"></a>
# **spacesGetMotionSensors**
> ListDtoMotionSensorDto spacesGetMotionSensors(id)

Gets a list of motion sensors in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetMotionSensors(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoMotionSensorDto**](ListDtoMotionSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetRelays"></a>
# **spacesGetRelays**
> ListDtoRelayDto spacesGetRelays(id)

Gets a list of relays in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetRelays(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoRelayDto**](ListDtoRelayDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetSpace"></a>
# **spacesGetSpace**
> SpaceDto spacesGetSpace(id)

Gets a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetSpace(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space to be retrieved | 

### Return type

[**SpaceDto**](SpaceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetSpaceEvents"></a>
# **spacesGetSpaceEvents**
> ListDtoEventDto spacesGetSpaceEvents(id)

Gets a list of recent events for the space.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetSpaceEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetSpacePolicy"></a>
# **spacesGetSpacePolicy**
> PolicyDto spacesGetSpacePolicy(id)

Gets a policy for a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetSpacePolicy(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**PolicyDto**](PolicyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetSwitches"></a>
# **spacesGetSwitches**
> ListDtoSwitchDto spacesGetSwitches(id)

Gets a list of switches in the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetSwitches(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoSwitchDto**](ListDtoSwitchDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetTemperatureSensors"></a>
# **spacesGetTemperatureSensors**
> ListDtoTemperatureSensorDto spacesGetTemperatureSensors(id)

Gets a list of temperature sensors contained in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetTemperatureSensors(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoTemperatureSensorDto**](ListDtoTemperatureSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetTimer"></a>
# **spacesGetTimer**
> SpaceTimerDto spacesGetTimer(id)

Gets the vacancy timer for the space if one exists

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetTimer(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**SpaceTimerDto**](SpaceTimerDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetType"></a>
# **spacesGetType**
> SpaceTypeDto spacesGetType(id)

Gets the type of the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetType(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**SpaceTypeDto**](SpaceTypeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesGetZones"></a>
# **spacesGetZones**
> ListDtoZoneDto spacesGetZones(id)

Gets a list of zones contained in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spacesGetZones(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

[**ListDtoZoneDto**](ListDtoZoneDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spacesLighting"></a>
# **spacesLighting**
> spacesLighting(id, lighting)

Sets the level of the lights in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var lighting = new GatewaySoftwareApi.LightingDto(); // LightingDto | the lighting values to use for the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesLighting(id, lighting, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **lighting** | [**LightingDto**](LightingDto.md)| the lighting values to use for the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="spacesPost"></a>
# **spacesPost**
> spacesPost(space)

Creates a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var space = new GatewaySoftwareApi.CreateSpaceDto(); // CreateSpaceDto | the space to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPost(space, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **space** | [**CreateSpaceDto**](CreateSpaceDto.md)| the space to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="spacesPostClearZoneConfig"></a>
# **spacesPostClearZoneConfig**
> spacesPostClearZoneConfig(id)

Exits the zone configuration mode for the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPostClearZoneConfig(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesPostPolicy"></a>
# **spacesPostPolicy**
> spacesPostPolicy(id, policy)

Creates a policy for a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var policy = new GatewaySoftwareApi.CreatePolicyDto(); // CreatePolicyDto | the policy to be created for the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPostPolicy(id, policy, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **policy** | [**CreatePolicyDto**](CreatePolicyDto.md)| the policy to be created for the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="spacesPostSaveZoneConfig"></a>
# **spacesPostSaveZoneConfig**
> spacesPostSaveZoneConfig(id)

Saves the zone configuration

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPostSaveZoneConfig(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesPostSetZoneConfig"></a>
# **spacesPostSetZoneConfig**
> spacesPostSetZoneConfig(id)

Enters the zone configuration mode for the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPostSetZoneConfig(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesPostZone"></a>
# **spacesPostZone**
> spacesPostZone(id, zone)

Creates a new zone within a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var zone = new GatewaySoftwareApi.CreateZoneDto(); // CreateZoneDto | the zone to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPostZone(id, zone, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **zone** | [**CreateZoneDto**](CreateZoneDto.md)| the zone to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="spacesPut"></a>
# **spacesPut**
> spacesPut(id, space)

Updates a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space to be updated

var space = new GatewaySoftwareApi.UpdateSpaceDto(); // UpdateSpaceDto | the updated values for the space


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPut(id, space, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space to be updated | 
 **space** | [**UpdateSpaceDto**](UpdateSpaceDto.md)| the updated values for the space | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="spacesPutDevices"></a>
# **spacesPutDevices**
> spacesPutDevices(id, device)

Adds a device to a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var device = new GatewaySoftwareApi.AddDeviceToSpaceDto(); // AddDeviceToSpaceDto | the device to be added to the space and a value indicting which attached devices to include


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPutDevices(id, device, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **device** | [**AddDeviceToSpaceDto**](AddDeviceToSpaceDto.md)| the device to be added to the space and a value indicting which attached devices to include | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="spacesPutPolicy"></a>
# **spacesPutPolicy**
> spacesPutPolicy(id, policy)

Updates a policy for a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var policy = new GatewaySoftwareApi.UpdatePolicyDto(); // UpdatePolicyDto | the policy to be updated


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPutPolicy(id, policy, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **policy** | [**UpdatePolicyDto**](UpdatePolicyDto.md)| the policy to be updated | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="spacesPutType"></a>
# **spacesPutType**
> spacesPutType(id, spaceType)

Sets the type of the space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space

var spaceType = new GatewaySoftwareApi.SpaceTypeDto(); // SpaceTypeDto | the space type to be set


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesPutType(id, spaceType, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space | 
 **spaceType** | [**SpaceTypeDto**](SpaceTypeDto.md)| the space type to be set | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="spacesSynchronize"></a>
# **spacesSynchronize**
> spacesSynchronize()

Synchronizes the state of all lights with the state of their space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesSynchronize(callback);
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

<a name="spacesTurnOff"></a>
# **spacesTurnOff**
> spacesTurnOff(id)

Turns off all lights in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space to be turned off


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesTurnOff(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space to be turned off | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="spacesTurnOn"></a>
# **spacesTurnOn**
> spacesTurnOn(id)

Turns on all lights in a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpacesApi();

var id = 56; // Number | the ID of the space to be turned on


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.spacesTurnOn(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space to be turned on | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

