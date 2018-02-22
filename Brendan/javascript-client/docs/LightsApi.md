# GatewaySoftwareApi.LightsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**lightsBatchLighting**](LightsApi.md#lightsBatchLighting) | **POST** /lights/lighting | Sets lighting on multiple lights
[**lightsDelete**](LightsApi.md#lightsDelete) | **DELETE** /lights/{id} | Deletes a light from the system
[**lightsDeleteEmergencySettings**](LightsApi.md#lightsDeleteEmergencySettings) | **DELETE** /lights/{id}/emergency-settings | Removes emergency light settings from a light
[**lightsDiscover**](LightsApi.md#lightsDiscover) | **POST** /lights/discover | Discovers all lights in the system
[**lightsGet**](LightsApi.md#lightsGet) | **GET** /lights | Gets a list of all lights in the system
[**lightsGetEvents**](LightsApi.md#lightsGetEvents) | **GET** /lights/{id}/events | Gets a list of light events
[**lightsGetLight**](LightsApi.md#lightsGetLight) | **GET** /lights/{id} | Gets a light
[**lightsLighting**](LightsApi.md#lightsLighting) | **POST** /lights/{id}/lighting | Dims a light to a specified level
[**lightsPost**](LightsApi.md#lightsPost) | **POST** /lights | Creates a light
[**lightsPostEmergencySettings**](LightsApi.md#lightsPostEmergencySettings) | **POST** /lights/{id}/emergency-settings | Sets a light as an emergency light
[**lightsPut**](LightsApi.md#lightsPut) | **PUT** /lights/{id} | Updates a light
[**lightsTurnOff**](LightsApi.md#lightsTurnOff) | **POST** /lights/{id}/turnoff | Turns off a light
[**lightsTurnOn**](LightsApi.md#lightsTurnOn) | **POST** /lights/{id}/turnon | Turns on a light


<a name="lightsBatchLighting"></a>
# **lightsBatchLighting**
> lightsBatchLighting(lighting)

Sets lighting on multiple lights

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var lighting = new GatewaySoftwareApi.BatchLightingListDto(); // BatchLightingListDto | the ID and lighting settings for each light


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsBatchLighting(lighting, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **lighting** | [**BatchLightingListDto**](BatchLightingListDto.md)| the ID and lighting settings for each light | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="lightsDelete"></a>
# **lightsDelete**
> lightsDelete(id)

Deletes a light from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="lightsDeleteEmergencySettings"></a>
# **lightsDeleteEmergencySettings**
> lightsDeleteEmergencySettings(id)

Removes emergency light settings from a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsDeleteEmergencySettings(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="lightsDiscover"></a>
# **lightsDiscover**
> lightsDiscover()

Discovers all lights in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsDiscover(callback);
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

<a name="lightsGet"></a>
# **lightsGet**
> ListDtoLightDto lightsGet()

Gets a list of all lights in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightsGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoLightDto**](ListDtoLightDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightsGetEvents"></a>
# **lightsGetEvents**
> ListDtoEventDto lightsGetEvents(id)

Gets a list of light events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightsGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightsGetLight"></a>
# **lightsGetLight**
> LightDto lightsGetLight(id)

Gets a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.lightsGetLight(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be retrieved | 

### Return type

[**LightDto**](LightDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="lightsLighting"></a>
# **lightsLighting**
> lightsLighting(id, lighting)

Dims a light to a specified level

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be dimmed

var lighting = new GatewaySoftwareApi.LightingDto(); // LightingDto | the new lighting settings for the light


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsLighting(id, lighting, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be dimmed | 
 **lighting** | [**LightingDto**](LightingDto.md)| the new lighting settings for the light | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="lightsPost"></a>
# **lightsPost**
> lightsPost(light)

Creates a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var light = new GatewaySoftwareApi.CreateLightDto(); // CreateLightDto | the light to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsPost(light, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **light** | [**CreateLightDto**](CreateLightDto.md)| the light to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="lightsPostEmergencySettings"></a>
# **lightsPostEmergencySettings**
> lightsPostEmergencySettings(id, settings)

Sets a light as an emergency light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light

var settings = new GatewaySoftwareApi.EmergencyLightingSettingsDto(); // EmergencyLightingSettingsDto | the emergency light settings


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsPostEmergencySettings(id, settings, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light | 
 **settings** | [**EmergencyLightingSettingsDto**](EmergencyLightingSettingsDto.md)| the emergency light settings | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="lightsPut"></a>
# **lightsPut**
> lightsPut(id, light)

Updates a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be updated

var light = new GatewaySoftwareApi.UpdateLightDto(); // UpdateLightDto | a light containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsPut(id, light, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be updated | 
 **light** | [**UpdateLightDto**](UpdateLightDto.md)| a light containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="lightsTurnOff"></a>
# **lightsTurnOff**
> lightsTurnOff(id)

Turns off a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be turned off


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsTurnOff(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be turned off | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="lightsTurnOn"></a>
# **lightsTurnOn**
> lightsTurnOn(id)

Turns on a light

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LightsApi();

var id = 56; // Number | the ID of the light to be turned on


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.lightsTurnOn(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the light to be turned on | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

