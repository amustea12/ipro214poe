# GatewaySoftwareApi.DashboardsApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**dashboardsGetDeviceStatusByDeviceType**](DashboardsApi.md#dashboardsGetDeviceStatusByDeviceType) | **GET** /dashboards/devicestatusbydevicetype | Gets device status by device type.
[**dashboardsGetDeviceStatusByNetworkSwitch**](DashboardsApi.md#dashboardsGetDeviceStatusByNetworkSwitch) | **GET** /dashboards/devicestatusbynetworkswitch | Gets device status by network switch.
[**dashboardsGetDeviceStatusBySpace**](DashboardsApi.md#dashboardsGetDeviceStatusBySpace) | **GET** /dashboards/devicestatusbyspace | Gets device status by space.


<a name="dashboardsGetDeviceStatusByDeviceType"></a>
# **dashboardsGetDeviceStatusByDeviceType**
> ListDtoDashboardDeviceStatusByDeviceTypeDto dashboardsGetDeviceStatusByDeviceType(opts)

Gets device status by device type.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DashboardsApi();

var opts = { 
  'spaceIds': "spaceIds_example" // String | 
};

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dashboardsGetDeviceStatusByDeviceType(opts, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **spaceIds** | **String**|  | [optional] 

### Return type

[**ListDtoDashboardDeviceStatusByDeviceTypeDto**](ListDtoDashboardDeviceStatusByDeviceTypeDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="dashboardsGetDeviceStatusByNetworkSwitch"></a>
# **dashboardsGetDeviceStatusByNetworkSwitch**
> ListDtoDashboardDeviceStatusByNetworkSwitchDto dashboardsGetDeviceStatusByNetworkSwitch()

Gets device status by network switch.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DashboardsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dashboardsGetDeviceStatusByNetworkSwitch(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDashboardDeviceStatusByNetworkSwitchDto**](ListDtoDashboardDeviceStatusByNetworkSwitchDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="dashboardsGetDeviceStatusBySpace"></a>
# **dashboardsGetDeviceStatusBySpace**
> ListDtoDashboardDeviceStatusBySpaceDto dashboardsGetDeviceStatusBySpace()

Gets device status by space.

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.DashboardsApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.dashboardsGetDeviceStatusBySpace(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoDashboardDeviceStatusBySpaceDto**](ListDtoDashboardDeviceStatusBySpaceDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

