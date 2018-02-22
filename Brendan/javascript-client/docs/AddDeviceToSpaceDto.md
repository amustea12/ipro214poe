# GatewaySoftwareApi.AddDeviceToSpaceDto

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**deviceId** | **Number** | The device ID | 
**deviceType** | **String** | The device type | 
**includeAttachedDevices** | **String** | Specifies whether other attached devices should also be added to the space | 


<a name="DeviceTypeEnum"></a>
## Enum: DeviceTypeEnum


* `Light` (value: `"Light"`)

* `Switch` (value: `"Switch"`)

* `Dimmer` (value: `"Dimmer"`)

* `MotionSensor` (value: `"MotionSensor"`)

* `LightSensor` (value: `"LightSensor"`)

* `TemperatureSensor` (value: `"TemperatureSensor"`)

* `Relay` (value: `"Relay"`)




<a name="IncludeAttachedDevicesEnum"></a>
## Enum: IncludeAttachedDevicesEnum


* `None` (value: `"None"`)

* `AllOnNode` (value: `"AllOnNode"`)

* `AllOnChain` (value: `"AllOnChain"`)




