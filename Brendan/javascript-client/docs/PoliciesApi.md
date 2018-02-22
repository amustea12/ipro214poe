# GatewaySoftwareApi.PoliciesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**policiesGet**](PoliciesApi.md#policiesGet) | **GET** /policies | Gets all policies in the system
[**policiesGetPolicy**](PoliciesApi.md#policiesGetPolicy) | **GET** /policies/{id} | Gets a policy
[**policiesPut**](PoliciesApi.md#policiesPut) | **PUT** /policies/{id} | Updates a policy


<a name="policiesGet"></a>
# **policiesGet**
> ListDtoPolicyDto policiesGet()

Gets all policies in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.PoliciesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.policiesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoPolicyDto**](ListDtoPolicyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="policiesGetPolicy"></a>
# **policiesGetPolicy**
> PolicyDto policiesGetPolicy(id)

Gets a policy

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.PoliciesApi();

var id = 56; // Number | the ID of the policy to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.policiesGetPolicy(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the policy to be retrieved | 

### Return type

[**PolicyDto**](PolicyDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="policiesPut"></a>
# **policiesPut**
> policiesPut(id, policy)

Updates a policy

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.PoliciesApi();

var id = 56; // Number | the ID of the policy to be updated

var policy = new GatewaySoftwareApi.UpdatePolicyDto(); // UpdatePolicyDto | the updated values for the policy


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.policiesPut(id, policy, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the policy to be updated | 
 **policy** | [**UpdatePolicyDto**](UpdatePolicyDto.md)| the updated values for the policy | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

