# GatewaySoftwareApi.RelaysApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**relaysCloseRelay**](RelaysApi.md#relaysCloseRelay) | **POST** /relays/{id}/close | Closes the relay
[**relaysDelete**](RelaysApi.md#relaysDelete) | **DELETE** /relays/{id} | Deletes a relay from the system
[**relaysDiscover**](RelaysApi.md#relaysDiscover) | **POST** /relays/discover | Discovers all relays in the system
[**relaysGet**](RelaysApi.md#relaysGet) | **GET** /relays | Gets a list of all relays in the system
[**relaysGetEvents**](RelaysApi.md#relaysGetEvents) | **GET** /relays/{id}/events | Gets a list of relay events
[**relaysGetRelay**](RelaysApi.md#relaysGetRelay) | **GET** /relays/{id} | Gets a relay
[**relaysOpenRelay**](RelaysApi.md#relaysOpenRelay) | **POST** /relays/{id}/open | Opens the relay
[**relaysPost**](RelaysApi.md#relaysPost) | **POST** /relays | Creates a relay
[**relaysPut**](RelaysApi.md#relaysPut) | **PUT** /relays/{id} | Updates a relay


<a name="relaysCloseRelay"></a>
# **relaysCloseRelay**
> relaysCloseRelay(id)

Closes the relay

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay to be closed


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysCloseRelay(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay to be closed | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="relaysDelete"></a>
# **relaysDelete**
> relaysDelete(id)

Deletes a relay from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="relaysDiscover"></a>
# **relaysDiscover**
> relaysDiscover()

Discovers all relays in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysDiscover(callback);
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

<a name="relaysGet"></a>
# **relaysGet**
> ListDtoRelayDto relaysGet()

Gets a list of all relays in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.relaysGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoRelayDto**](ListDtoRelayDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="relaysGetEvents"></a>
# **relaysGetEvents**
> ListDtoEventDto relaysGetEvents(id)

Gets a list of relay events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.relaysGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="relaysGetRelay"></a>
# **relaysGetRelay**
> RelayDto relaysGetRelay(id)

Gets a relay

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.relaysGetRelay(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay to be retrieved | 

### Return type

[**RelayDto**](RelayDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="relaysOpenRelay"></a>
# **relaysOpenRelay**
> relaysOpenRelay(id)

Opens the relay

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay to be opened


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysOpenRelay(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay to be opened | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="relaysPost"></a>
# **relaysPost**
> relaysPost(relay)

Creates a relay

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var relay = new GatewaySoftwareApi.CreateRelayDto(); // CreateRelayDto | the relay to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysPost(relay, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **relay** | [**CreateRelayDto**](CreateRelayDto.md)| the relay to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="relaysPut"></a>
# **relaysPut**
> relaysPut(id, relay)

Updates a relay

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.RelaysApi();

var id = 56; // Number | the ID of the relay to be updated

var relay = new GatewaySoftwareApi.UpdateRelayDto(); // UpdateRelayDto | a relay containing the new values


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.relaysPut(id, relay, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the relay to be updated | 
 **relay** | [**UpdateRelayDto**](UpdateRelayDto.md)| a relay containing the new values | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

