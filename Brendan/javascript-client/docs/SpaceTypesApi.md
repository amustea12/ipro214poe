# GatewaySoftwareApi.SpaceTypesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**spaceTypesGet**](SpaceTypesApi.md#spaceTypesGet) | **GET** /spacetypes | Gets a list of space types in the system
[**spaceTypesGetPolicy**](SpaceTypesApi.md#spaceTypesGetPolicy) | **GET** /spacetypes/{id}/policy | Gets the policy of a space type
[**spaceTypesGetSpaceType**](SpaceTypesApi.md#spaceTypesGetSpaceType) | **GET** /spacetypes/{id} | Gets a space type


<a name="spaceTypesGet"></a>
# **spaceTypesGet**
> ListDtoSpaceTypeDto spaceTypesGet()

Gets a list of space types in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpaceTypesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spaceTypesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoSpaceTypeDto**](ListDtoSpaceTypeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spaceTypesGetPolicy"></a>
# **spaceTypesGetPolicy**
> PolicyDto spaceTypesGetPolicy(id)

Gets the policy of a space type

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpaceTypesApi();

var id = 56; // Number | the ID of the space type


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spaceTypesGetPolicy(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space type | 

### Return type

[**PolicyDto**](PolicyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="spaceTypesGetSpaceType"></a>
# **spaceTypesGetSpaceType**
> SpaceTypeDto spaceTypesGetSpaceType(id)

Gets a space type

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SpaceTypesApi();

var id = 56; // Number | the ID of the space type to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.spaceTypesGetSpaceType(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the space type to be retrieved | 

### Return type

[**SpaceTypeDto**](SpaceTypeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

