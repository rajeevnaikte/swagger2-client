'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = require('jquery');

var $ = _interopRequireWildcard(_jquery);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requiresNotNull = function requiresNotNull(data, key) {
  if (data == null) throw key + ' cannot be null';
};

var verifyDataType = function verifyDataType(data, type, key) {
  if (type === 'array') {
    if (Object.prototype.toString.call(data) !== '[object Array]') {
      throw 'Invalid type for ' + key + '. Expecting ' + type + '.';
    }
  } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== type) {
    throw 'Invalid type for ' + key + '. Expecting ' + type + '.';
  }
};

var verifyRequiredField = function verifyRequiredField(data, field) {
  if (!data.hasOwnProperty(field)) {
    throw 'Required field ' + field + ' is not provided.';
  }
};

var getDefinition = function getDefinition(swagger, $ref) {
  var definition = void 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = $ref.split('/')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var refP = _step.value;

      if (refP === '#') {
        definition = swagger;
      } else {
        definition = definition[refP];
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return definition;
};

var setDefRefs = function setDefRefs(swagger) {
  var setDef = function setDef(definition) {
    if (definition.additionalProperties && definition.additionalProperties.$ref) {
      definition.additionalProperties = getDefinition(swagger, definition.additionalProperties.$ref);
    }
  };
  if (swagger.definitions) {
    for (var def in swagger.definitions) {
      var defin = swagger.definitions[def];
      setDef(defin);
      if (defin.properties) {
        for (var defProp in defin.properties) {
          setDef(defin.properties[defProp]);
        }
      }
    }
  }
  for (var path in swagger.paths) {
    for (var method in swagger.paths[path]) {
      var schema = swagger.paths[path][method];
      if (schema.parameters) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = schema.parameters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var param = _step2.value;

            if (param.in === 'body') {
              param.name = 'body';
            }
            if (param.schema && param.schema.$ref) {
              param.schema = getDefinition(swagger, param.schema.$ref);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  }
};

var RestClient = function () {
  function RestClient(ajaxOpts, urlPrefix, path, method, schema) {
    _classCallCheck(this, RestClient);

    this.ajaxOpts = ajaxOpts;
    this.urlPrefix = urlPrefix;
    this.path = path;
    this.method = method;
    this.schema = schema;
  }

  _createClass(RestClient, [{
    key: 'getPath',
    value: function getPath(data) {
      var path = this.path;
      var params = {};
      if (this.schema.parameters) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.schema.parameters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var param = _step3.value;

            if (param.in === 'path') {
              path = path.replace('{' + param.name + '}', encodeURIComponent(data[param.name]));
            } else if (param.in === 'query') {
              params[param.name] = data[param.name];
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      if (!$.isEmptyObject(params)) {
        path = path + '?' + $.param(params);
      }
      return path;
    }
  }, {
    key: 'setRequestBody',
    value: function setRequestBody(options, data) {
      if (this.schema.parameters) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.schema.parameters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var param = _step4.value;

            if (param.in === 'body') {
              if (param.schema) {
                options.data = JSON.stringify(data[param.name]);
                options.contentType = 'application/json';
              }
              break;
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }
  }, {
    key: 'validateDefinition',
    value: function validateDefinition(data, definition) {
      verifyDataType(data, definition.type, definition.title);
      if (definition.required) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = definition.required[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var requiredField = _step5.value;

            verifyRequiredField(data, requiredField);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
      if (definition.properties) {
        for (var prop in definition.properties) {
          var propData = data[prop];
          var propSchema = definition.properties[prop];
          if (propData) {
            if (propSchema.type !== 'object' || propSchema.additionalProperties) {
              verifyDataType(propData, propSchema.type, prop);
            }
            if (propSchema.additionalProperties) {
              this.validateDefinition(propData, propSchema.additionalProperties);
            }
          }
        }
      }
    }
  }, {
    key: 'validateParameters',
    value: function validateParameters(data) {
      if (this.schema.parameters) {
        requiresNotNull(data, 'rest api data');
        verifyDataType(data, 'object', 'rest api data');
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.schema.parameters[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var param = _step6.value;

            if (param.required) {
              verifyRequiredField(data, param.name);
            }
            if (data.hasOwnProperty(param.name)) {
              if (param.type) {
                verifyDataType(data[param.name], param.type, param.name);
              } else if (param.schema) {
                this.validateDefinition(data[param.name], param.schema);
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    }
  }, {
    key: 'call',
    value: function call(data) {
      this.validateParameters(data);
      var options = Object.assign({}, this.ajaxOpts);
      options.url = this.urlPrefix + this.getPath(data);
      options.type = this.method;
      this.setRequestBody(options, data);
      return $.ajax(options);
    }
  }]);

  return RestClient;
}();

var Swagger2Client = function Swagger2Client(swaggerUrl, ajaxOpts, urlPrefix) {
  requiresNotNull(swaggerUrl);
  urlPrefix = urlPrefix || '';
  ajaxOpts = ajaxOpts || {};
  var apis = {};
  var options = Object.assign({}, ajaxOpts);
  options.url = swaggerUrl;
  options.async = false;
  options.type = 'GET';
  options.dataType = 'json';
  $.ajax(options).done(function (swagger) {
    setDefRefs(swagger);
    for (var path in swagger.paths) {
      var pathSchema = swagger.paths[path];

      var _loop = function _loop(method) {
        var schema = pathSchema[method];
        var client = new RestClient(ajaxOpts, urlPrefix, path, method, schema);
        apis[schema.operationId] = function (data) {
          return client.call(data);
        };
      };

      for (var method in pathSchema) {
        _loop(method);
      }
    }
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log(textStatus);
    throw 'Unable to get swagger json from ' + swaggerUrl + '.';
  });
  return apis;
};

exports.default = Swagger2Client;
