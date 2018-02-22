# GatewaySoftwareApi.NetworkNodesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**networkNodesDelete**](NetworkNodesApi.md#networkNodesDelete) | **DELETE** /networknodes/{id} | Deletes a network node from the system
[**networkNodesDeleteAll**](NetworkNodesApi.md#networkNodesDeleteAll) | **DELETE** /networknodes/deleteall | WARNING: Deletes all network nodes from the system.
[**networkNodesDiscover**](NetworkNodesApi.md#networkNodesDiscover) | **POST** /networknodes/discover | Discovers all network nodes in the system
[**networkNodesGet**](NetworkNodesApi.md#networkNodesGet) | **GET** /networknodes | Gets a list of all network nodes in the system
[**networkNodesGetDeviceNodes**](NetworkNodesApi.md#networkNodesGetDeviceNodes) | **GET** /networknodes/{id}/devicenodes | Gets a list of device nodes attached to a network node
[**networkNodesGetDevices**](NetworkNodesApi.md#networkNodesGetDevices) | **GET** /networknodes/{id}/devices | Gets a list of devices attached to a network node
[**networkNodesGetNode**](NetworkNodesApi.md#networkNodesGetNode) | **GET** /networknodes/{id} | Gets a network node
[**networkNodesPost**](NetworkNodesApi.md#networkNodesPost) | **POST** /networknodes | Creates a network node
[**networkNodesPut**](NetworkNodesApi.md#networkNodesPut) | **PUT** /networknodes/{id} | Updates a network node


<a name="networkNodesDelete"></a>
# **networkNodesDelete**
> networkNodesDelete(id)

Deletes a network node from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var id = 56; // Number | the ID of the network node to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.networkNodesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the network node to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="networkNodesDeleteAll"></a>
# **networkNodesDeleteAll**
> networkNodesDeleteAll()

WARNING: Deletes all network nodes from the system.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.networkNodesDeleteAll(callback);
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

<a name="networkNodesDiscover"></a>
# **networkNodesDiscover**
> networkNodesDiscover()

Discovers all network nodes in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.networkNodesDiscover(callback);
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

<a name="networkNodesGet"></a>
# **networkNodesGet**
> ListDtoNodeDto networkNodesGet()

Gets a list of all network nodes in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.networkNodesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoNodeDto**](ListDtoNodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="networkNodesGetDeviceNodes"></a>
# **networkNodesGetDeviceNodes**
> ListDtoDeviceNodeDto networkNodesGetDeviceNodes(id)

Gets a list of device nodes attached to a network node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var id = 56; // Number | the ID of the network node


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.networkNodesGetDeviceNodes(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the network node | 

### Return type

[**ListDtoDeviceNodeDto**](ListDtoDeviceNodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="networkNodesGetDevices"></a>
# **networkNodesGetDevices**
> ListDtoDeviceDto networkNodesGetDevices(id)

Gets a list of devices attached to a network node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var id = 56; // Number | the ID of the network node


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.networkNodesGetDevices(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the network node | 

### Return type

[**ListDtoDeviceDto**](ListDtoDeviceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="networkNodesGetNode"></a>
# **networkNodesGetNode**
> NodeDto networkNodesGetNode(id)

Gets a network node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var id = 56; // Number | the ID of the network node to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.networkNodesGetNode(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the network node to be retrieved | 

### Return type

[**NodeDto**](NodeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="networkNodesPost"></a>
# **networkNodesPost**
> networkNodesPost(networkNode)

Creates a network node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var networkNode = new GatewaySoftwareApi.CreateNetworkNodeDto(); // CreateNetworkNodeDto | the network node to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.networkNodesPost(networkNode, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **networkNode** | [**CreateNetworkNodeDto**](CreateNetworkNodeDto.md)| the network node to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="networkNodesPut"></a>
# **networkNodesPut**
> networkNodesPut(id, networkNode)

Updates a network node

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.NetworkNodesApi();

var id = 56; // Number | the ID of the network node to be updated

var networkNode = new GatewaySoftwareApi.UpdateNetworkNodeDto(); // UpdateNetworkNodeDto | the updated values for the network node


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.networkNodesPut(id, networkNode, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the network node to be updated | 
 **networkNode** | [**UpdateNetworkNodeDto**](UpdateNetworkNodeDto.md)| the updated values for the network node | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

