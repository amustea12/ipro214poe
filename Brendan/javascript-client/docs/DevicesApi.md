# GatewaySoftwareApi.DevicesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**devicesAll**](DevicesApi.md#devicesAll) | **GET** /devices/all | Gets a list of all devices in the system
[**devicesDeleteAll**](DevicesApi.md#devicesDeleteAll) | **DELETE** /devices/deleteall | WARNING: Deletes all devices in the system
[**devicesDiscover**](DevicesApi.md#devicesDiscover) | **POST** /devices/discover | Discovers all devices on the network
[**devicesGetNode**](DevicesApi.md#devicesGetNode) | **GET** /devices/{type}/{id}/networknode | Gets the network node associated with the device
[**devicesGetSpace**](DevicesApi.md#devicesGetSpace) | **GET** /devices/{type}/{id}/space | Gets the space that contains the device
[**devicesPut**](DevicesApi.md#devicesPut) | **PUT** /devices/{type}/{id} | Renames a device
[**devicesSearch**](DevicesApi.md#devicesSearch) | **GET** /devices/search | Searches all devices in the system
[**devicesUnassigned**](DevicesApi.md#devicesUnassigned) | **GET** /devices/unassigned | Gets a list of all devices that are not assigned to a space


<a name="devicesAll"></a>
# **devicesAll**
> ListDtoDeviceDto devicesAll()

Gets a list of all devices in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.devicesAll(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="devicesDeleteAll"></a>
# **devicesDeleteAll**
> devicesDeleteAll()

WARNING: Deletes all devices in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.devicesDeleteAll(callback);
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

<a name="devicesDiscover"></a>
# **devicesDiscover**
> devicesDiscover()

Discovers all devices on the network

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.devicesDiscover(callback);
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

<a name="devicesGetNode"></a>
# **devicesGetNode**
> NodeDto devicesGetNode(type, id)

Gets the network node associated with the device

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var type = "type_example"; // String | the type of the device

var id = 56; // Number | the ID of the device


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.devicesGetNode(type, id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **type** | **String**| the type of the device | 
 **id** | **Number**| the ID of the device | 

### Return type

[**NodeDto**](NodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="devicesGetSpace"></a>
# **devicesGetSpace**
> SpaceDto devicesGetSpace(type, id)

Gets the space that contains the device

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var type = "type_example"; // String | the type of device

var id = 56; // Number | the ID of the device


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.devicesGetSpace(type, id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **type** | **String**| the type of device | 
 **id** | **Number**| the ID of the device | 

### Return type

[**SpaceDto**](SpaceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="devicesPut"></a>
# **devicesPut**
> devicesPut(type, id, device)

Renames a device

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var type = "type_example"; // String | the type of the device to be renamed

var id = 56; // Number | the ID of the device to be renamed

var device = new GatewaySoftwareApi.UpdateDeviceDto(); // UpdateDeviceDto | the device containing the new name


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.devicesPut(type, id, device, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **type** | **String**| the type of the device to be renamed | 
 **id** | **Number**| the ID of the device to be renamed | 
 **device** | [**UpdateDeviceDto**](UpdateDeviceDto.md)| the device containing the new name | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="devicesSearch"></a>
# **devicesSearch**
> PaginatedListDevicesSearchResultDto devicesSearch(opts)

Searches all devices in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var opts = { 
  'page': 56, // Number | the results page
  'pageSize': 56, // Number | the results page size
  'term': "term_example", // String | the search term
  'types': "types_example", // String | the devices types
  'isOnline': true, // Boolean | the device status
  'spaceIds': "spaceIds_example", // String | the space IDs to include
  'networkSwitchNames': "networkSwitchNames_example", // String | the network switch names to include
  'networkSwitchIpAddresses': "networkSwitchIpAddresses_example", // String | the network switch IP addresses
  'onlyDevicesWithLldp': true, // Boolean | only include devices with LLDP
  'sortDir': "sortDir_example", // String | the sort direction
  'sortBy': "sortBy_example", // String | the sort order
  'minDiscoveredDate': new Date("2013-10-20T19:20:30+01:00"), // Date | the minimum discovered date
  'maxDiscoveredDate': new Date("2013-10-20T19:20:30+01:00") // Date | the maximum discovered date
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.devicesSearch(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **Number**| the results page | [optional] 
 **pageSize** | **Number**| the results page size | [optional] 
 **term** | **String**| the search term | [optional] 
 **types** | **String**| the devices types | [optional] 
 **isOnline** | **Boolean**| the device status | [optional] 
 **spaceIds** | **String**| the space IDs to include | [optional] 
 **networkSwitchNames** | **String**| the network switch names to include | [optional] 
 **networkSwitchIpAddresses** | **String**| the network switch IP addresses | [optional] 
 **onlyDevicesWithLldp** | **Boolean**| only include devices with LLDP | [optional] 
 **sortDir** | **String**| the sort direction | [optional] 
 **sortBy** | **String**| the sort order | [optional] 
 **minDiscoveredDate** | **Date**| the minimum discovered date | [optional] 
 **maxDiscoveredDate** | **Date**| the maximum discovered date | [optional] 

### Return type

[**PaginatedListDevicesSearchResultDto**](PaginatedListDevicesSearchResultDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="devicesUnassigned"></a>
# **devicesUnassigned**
> ListDtoDeviceDto devicesUnassigned()

Gets a list of all devices that are not assigned to a space

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DevicesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.devicesUnassigned(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

