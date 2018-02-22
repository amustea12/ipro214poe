# GatewaySoftwareApi.DeviceNodesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deviceNodesDelete**](DeviceNodesApi.md#deviceNodesDelete) | **DELETE** /devicenodes/{id} | Deletes a device node from the system
[**deviceNodesDeleteAll**](DeviceNodesApi.md#deviceNodesDeleteAll) | **DELETE** /devicenodes/deleteall | WARNING: Deletes all device nodes from the system.
[**deviceNodesDiscover**](DeviceNodesApi.md#deviceNodesDiscover) | **POST** /devicenodes/discover | Discovers all device nodes in the system
[**deviceNodesGet**](DeviceNodesApi.md#deviceNodesGet) | **GET** /devicenodes | Gets a list of all device nodes in the system
[**deviceNodesGetDeviceNode**](DeviceNodesApi.md#deviceNodesGetDeviceNode) | **GET** /devicenodes/{id} | Gets a device node
[**deviceNodesGetNode**](DeviceNodesApi.md#deviceNodesGetNode) | **GET** /devicenodes/{id}/networknode | Gets the network node associated with the device node
[**deviceNodesPost**](DeviceNodesApi.md#deviceNodesPost) | **POST** /devicenodes | Creates a device node
[**deviceNodesPut**](DeviceNodesApi.md#deviceNodesPut) | **PUT** /devicenodes/{id} | Updates a device node


<a name="deviceNodesDelete"></a>
# **deviceNodesDelete**
> deviceNodesDelete(id)

Deletes a device node from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var id = 56; // Number | the ID of the device node to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deviceNodesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the device node to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="deviceNodesDeleteAll"></a>
# **deviceNodesDeleteAll**
> deviceNodesDeleteAll()

WARNING: Deletes all device nodes from the system.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deviceNodesDeleteAll(callback);
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

<a name="deviceNodesDiscover"></a>
# **deviceNodesDiscover**
> deviceNodesDiscover()

Discovers all device nodes in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deviceNodesDiscover(callback);
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

<a name="deviceNodesGet"></a>
# **deviceNodesGet**
> ListDtoDeviceNodeDto deviceNodesGet()

Gets a list of all device nodes in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deviceNodesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDeviceNodeDto**](ListDtoDeviceNodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="deviceNodesGetDeviceNode"></a>
# **deviceNodesGetDeviceNode**
> DeviceNodeDto deviceNodesGetDeviceNode(id)

Gets a device node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var id = 56; // Number | the ID of the device node to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deviceNodesGetDeviceNode(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the device node to be retrieved | 

### Return type

[**DeviceNodeDto**](DeviceNodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="deviceNodesGetNode"></a>
# **deviceNodesGetNode**
> NodeDto deviceNodesGetNode(id)

Gets the network node associated with the device node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var id = 56; // Number | the ID of the device node


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.deviceNodesGetNode(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the device node | 

### Return type

[**NodeDto**](NodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="deviceNodesPost"></a>
# **deviceNodesPost**
> deviceNodesPost(deviceNode)

Creates a device node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var deviceNode = new GatewaySoftwareApi.CreateDeviceNodeDto(); // CreateDeviceNodeDto | the device node to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deviceNodesPost(deviceNode, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **deviceNode** | [**CreateDeviceNodeDto**](CreateDeviceNodeDto.md)| the device node to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="deviceNodesPut"></a>
# **deviceNodesPut**
> deviceNodesPut(id, deviceNode)

Updates a device node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DeviceNodesApi();

var id = 56; // Number | the ID of the device node to be updated

var deviceNode = new GatewaySoftwareApi.UpdateDeviceNodeDto(); // UpdateDeviceNodeDto | the updated values for the device node


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.deviceNodesPut(id, deviceNode, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the device node to be updated | 
 **deviceNode** | [**UpdateDeviceNodeDto**](UpdateDeviceNodeDto.md)| the updated values for the device node | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

