/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateRelayDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateRelayDto model module.
   * @module model/UpdateRelayDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateRelayDto</code>.
   * The relay to be updated
   * @alias module:model/UpdateRelayDto
   * @class
   * @param isInverted {Boolean} Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @param name {String} The device name
   */
  var exports = function(isInverted, name) {
    var _this = this;

    _this['isInverted'] = isInverted;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateRelayDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateRelayDto} obj Optional instance to populate.
   * @return {module:model/UpdateRelayDto} The populated <code>UpdateRelayDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('isInverted')) {
        obj['isInverted'] = ApiClient.convertToType(data['isInverted'], 'Boolean');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @member {Boolean} isInverted
   */
  exports.prototype['isInverted'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));

