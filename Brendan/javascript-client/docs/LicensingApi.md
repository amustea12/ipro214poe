# GatewaySoftwareApi.LicensingApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**licensingRefreshLicense**](LicensingApi.md#licensingRefreshLicense) | **POST** /licensing/refresh | 


<a name="licensingRefreshLicense"></a>
# **licensingRefreshLicense**
> licensingRefreshLicense()



### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.LicensingApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.licensingRefreshLicense(callback);
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

