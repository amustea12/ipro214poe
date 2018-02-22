# GatewaySoftwareApi.ZonesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**zonesDelete**](ZonesApi.md#zonesDelete) | **DELETE** /zones/{id} | Deletes a zone from the system
[**zonesDeleteLight**](ZonesApi.md#zonesDeleteLight) | **DELETE** /zones/{id}/lights/{deviceId} | Removes a light from a zone
[**zonesDeleteLightSensor**](ZonesApi.md#zonesDeleteLightSensor) | **DELETE** /zones/{id}/lightsensors/{deviceId} | Removes a light sensor from a zone
[**zonesGetAssignableDevices**](ZonesApi.md#zonesGetAssignableDevices) | **GET** /zones/{id}/assignabledevices | Gets a list of devices that can be added to a zone
[**zonesGetDevices**](ZonesApi.md#zonesGetDevices) | **GET** /zones/{id}/devices | Gets a list of devices contained in a zone
[**zonesGetEvents**](ZonesApi.md#zonesGetEvents) | **GET** /zones/{id}/events | Gets a list of zone events
[**zonesGetLightSensor**](ZonesApi.md#zonesGetLightSensor) | **GET** /zones/{id}/lightsensor | Gets the light sensor contained in a zone
[**zonesGetSpace**](ZonesApi.md#zonesGetSpace) | **GET** /zones/{id}/space | Gets the space containing a zone
[**zonesGetZone**](ZonesApi.md#zonesGetZone) | **GET** /zones/{id} | Gets a zone
[**zonesPut**](ZonesApi.md#zonesPut) | **PUT** /zones/{id} | Updates a zone
[**zonesPutDevices**](ZonesApi.md#zonesPutDevices) | **PUT** /zones/{id}/devices | Adds a device to a zone


<a name="zonesDelete"></a>
# **zonesDelete**
> zonesDelete(id)

Deletes a zone from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.zonesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="zonesDeleteLight"></a>
# **zonesDeleteLight**
> zonesDeleteLight(id, deviceId)

Removes a light from a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone

var deviceId = 56; // Number | the ID of the light to be removed


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.zonesDeleteLight(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 
 **deviceId** | **Number**| the ID of the light to be removed | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="zonesDeleteLightSensor"></a>
# **zonesDeleteLightSensor**
> zonesDeleteLightSensor(id, deviceId)

Removes a light sensor from a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone

var deviceId = 56; // Number | the ID of the light sensor to be removed


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.zonesDeleteLightSensor(id, deviceId, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 
 **deviceId** | **Number**| the ID of the light sensor to be removed | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="zonesGetAssignableDevices"></a>
# **zonesGetAssignableDevices**
> ListDtoDeviceDto zonesGetAssignableDevices(id)

Gets a list of devices that can be added to a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetAssignableDevices(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesGetDevices"></a>
# **zonesGetDevices**
> ListDtoDeviceDto zonesGetDevices(id)

Gets a list of devices contained in a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetDevices(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesGetEvents"></a>
# **zonesGetEvents**
> ListDtoEventDto zonesGetEvents(id)

Gets a list of zone events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesGetLightSensor"></a>
# **zonesGetLightSensor**
> LightSensorDto zonesGetLightSensor(id)

Gets the light sensor contained in a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetLightSensor(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 

### Return type

[**LightSensorDto**](LightSensorDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesGetSpace"></a>
# **zonesGetSpace**
> SpaceDto zonesGetSpace(id)

Gets the space containing a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetSpace(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 

### Return type

[**SpaceDto**](SpaceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesGetZone"></a>
# **zonesGetZone**
> ZoneDto zonesGetZone(id)

Gets a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone to be returned


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.zonesGetZone(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone to be returned | 

### Return type

[**ZoneDto**](ZoneDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="zonesPut"></a>
# **zonesPut**
> zonesPut(id, zone)

Updates a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone to be updated

var zone = new GatewaySoftwareApi.UpdateZoneDto(); // UpdateZoneDto | the updated values for the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.zonesPut(id, zone, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone to be updated | 
 **zone** | [**UpdateZoneDto**](UpdateZoneDto.md)| the updated values for the zone | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="zonesPutDevices"></a>
# **zonesPutDevices**
> zonesPutDevices(id, device)

Adds a device to a zone

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.ZonesApi();

var id = 56; // Number | the ID of the zone

var device = new GatewaySoftwareApi.AddDeviceToZoneDto(); // AddDeviceToZoneDto | the device to be added to the zone


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.zonesPutDevices(id, device, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the zone | 
 **device** | [**AddDeviceToZoneDto**](AddDeviceToZoneDto.md)| the device to be added to the zone | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

