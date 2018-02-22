# GatewaySoftwareApi.HealthApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**healthPing**](HealthApi.md#healthPing) | **GET** /health/ping | Allows checking if the lighting server is available


<a name="healthPing"></a>
# **healthPing**
> Object healthPing()

Allows checking if the lighting server is available

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.HealthApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.healthPing(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

