# GatewaySoftwareApi.SchedulesApi

All URIs are relative to *http://192.168.10.2/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**schedulesDelete**](SchedulesApi.md#schedulesDelete) | **DELETE** /schedules/{id} | Deletes a schedule from the system
[**schedulesDeleteActionSet**](SchedulesApi.md#schedulesDeleteActionSet) | **DELETE** /schedules/{id}/actionset | Unsets the action set assigned to the schedule
[**schedulesGet**](SchedulesApi.md#schedulesGet) | **GET** /schedules | Gets a list of schedules in the system
[**schedulesGetActionSet**](SchedulesApi.md#schedulesGetActionSet) | **GET** /schedules/{id}/actionset | Gets the action set assigned to the specified schedule
[**schedulesGetEvents**](SchedulesApi.md#schedulesGetEvents) | **GET** /schedules/{id}/events | Gets a list of schedule events
[**schedulesGetSchedule**](SchedulesApi.md#schedulesGetSchedule) | **GET** /schedules/{id} | Gets a schedule
[**schedulesPost**](SchedulesApi.md#schedulesPost) | **POST** /schedules | Creates a schedule
[**schedulesPut**](SchedulesApi.md#schedulesPut) | **PUT** /schedules/{id} | Updates a schedule
[**schedulesPutActionSet**](SchedulesApi.md#schedulesPutActionSet) | **PUT** /schedules/{id}/actionset | Sets the action set assigned to the schedule


<a name="schedulesDelete"></a>
# **schedulesDelete**
> schedulesDelete(id)

Deletes a schedule from the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule to be deleted


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.schedulesDelete(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule to be deleted | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="schedulesDeleteActionSet"></a>
# **schedulesDeleteActionSet**
> schedulesDeleteActionSet(id)

Unsets the action set assigned to the schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.schedulesDeleteActionSet(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="schedulesGet"></a>
# **schedulesGet**
> ListDtoScheduleDto schedulesGet()

Gets a list of schedules in the system

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.schedulesGet(callback);
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ListDtoScheduleDto**](ListDtoScheduleDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="schedulesGetActionSet"></a>
# **schedulesGetActionSet**
> ActionSetDto schedulesGetActionSet(id)

Gets the action set assigned to the specified schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of schedule


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.schedulesGetActionSet(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of schedule | 

### Return type

[**ActionSetDto**](ActionSetDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="schedulesGetEvents"></a>
# **schedulesGetEvents**
> ListDtoEventDto schedulesGetEvents(id)

Gets a list of schedule events

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.schedulesGetEvents(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule | 

### Return type

[**ListDtoEventDto**](ListDtoEventDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="schedulesGetSchedule"></a>
# **schedulesGetSchedule**
> ScheduleDto schedulesGetSchedule(id)

Gets a schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule to be retrieved


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
};
apiInstance.schedulesGetSchedule(id, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule to be retrieved | 

### Return type

[**ScheduleDto**](ScheduleDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, text/json

<a name="schedulesPost"></a>
# **schedulesPost**
> schedulesPost(schedule)

Creates a schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var schedule = new GatewaySoftwareApi.CreateScheduleDto(); // CreateScheduleDto | the schedule to be created


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.schedulesPost(schedule, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **schedule** | [**CreateScheduleDto**](CreateScheduleDto.md)| the schedule to be created | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: application/json, text/json

<a name="schedulesPut"></a>
# **schedulesPut**
> schedulesPut(id, schedule)

Updates a schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule to be updated

var schedule = new GatewaySoftwareApi.UpdateScheduleDto(); // UpdateScheduleDto | the updated values for the schedule


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.schedulesPut(id, schedule, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule to be updated | 
 **schedule** | [**UpdateScheduleDto**](UpdateScheduleDto.md)| the updated values for the schedule | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

<a name="schedulesPutActionSet"></a>
# **schedulesPutActionSet**
> schedulesPutActionSet(id, actionSet)

Sets the action set assigned to the schedule

### Example
```javascript
var GatewaySoftwareApi = require('gateway_software_api');

var apiInstance = new GatewaySoftwareApi.SchedulesApi();

var id = 56; // Number | the ID of the schedule

var actionSet = new GatewaySoftwareApi.UpdateScheduleActionSetDto(); // UpdateScheduleActionSetDto | the action set


var callback = function(error, data, response) {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
};
apiInstance.schedulesPutActionSet(id, actionSet, callback);
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **Number**| the ID of the schedule | 
 **actionSet** | [**UpdateScheduleActionSetDto**](UpdateScheduleActionSetDto.md)| the action set | 

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, text/json, application/x-www-form-urlencoded
 - **Accept**: Not defined

