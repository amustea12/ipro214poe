# GatewaySoftwareApi.BatchLightingDto

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **Number** | The light ID | [optional] 
**level** | **Number** | The lighting level | [optional] 
**kelvin** | **Number** | The color temperature of the lighitng in Kelvin | [optional] 
**behavior** | **String** | The smooth ramp behavior | [optional] 
**curveType** | **String** | The smooth ramp curve type | [optional] 
**duration** | **Number** | The smooth ramp duration in milliseconds | [optional] 


<a name="BehaviorEnum"></a>
## Enum: BehaviorEnum


* `ConstantDuration` (value: `"ConstantDuration"`)

* `Variable` (value: `"Variable"`)

* `ConstantRate` (value: `"ConstantRate"`)




<a name="CurveTypeEnum"></a>
## Enum: CurveTypeEnum


* `None` (value: `"None"`)

* `Linear` (value: `"Linear"`)

* `SquareLaw` (value: `"SquareLaw"`)

* `Dali` (value: `"Dali"`)




