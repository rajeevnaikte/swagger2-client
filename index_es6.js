import * as $ from 'jquery'

let requiresNotNull = (data, key) => {
  if (data == null)
    throw Error(`${key} cannot be null`);
}

let verifyDataType = (data, type, key) => {
  if (type === 'array') {
    if (Object.prototype.toString.call(data) !== '[object Array]') {
      throw Error(`Invalid type for ${key}. Expecting ${type}.`);
    }
  }
  else if (typeof data !== type) {
    throw Error(`Invalid type for ${key}. Expecting ${type}.`);
  }
}

let verifyRequiredField = (data, field) => {
  if (!data.hasOwnProperty(field)) {
    throw Error(`Required field ${field} is not provided.`);
  }
}

let getDefinition = (swagger, $ref) => {
  let definition;
  for (let refP of $ref.split('/')) {
    if (refP === '#') {
      definition = swagger;
    }
    else {
      definition = definition[refP];
    }
  }
  return definition;
}

let setDefRefs = (swagger) => {
  let setDef = (definition) => {
    if (definition.additionalProperties && definition.additionalProperties.$ref) {
      definition.additionalProperties = getDefinition(swagger, definition.additionalProperties.$ref);
    }
  };
  if (swagger.definitions) {
    for (let def in swagger.definitions) {
      let defin = swagger.definitions[def];
      setDef(defin);
      if (defin.properties) {
        for (let defProp in defin.properties) {
          setDef(defin.properties[defProp]);
        }
      }
    }
  }
  for (let path in swagger.paths) {
    for (let method in swagger.paths[path]) {
      let schema = swagger.paths[path][method];
      if (schema.parameters) {
        for (let param of schema.parameters) {
		  if (param.in === 'body') {
		  	param.name = 'body';
		  }
		  if (param.schema && param.schema.$ref) {
			param.schema = getDefinition(swagger, param.schema.$ref);
		  }
        }
      }
    }
  }
}

class RestClient {
  constructor(ajaxOpts, urlPrefix, path, method, schema) {
    this.ajaxOpts = ajaxOpts;
    this.urlPrefix = urlPrefix;
    this.path = path;
    this.method = method;
    this.schema = schema;
  }

  getPath(data) {
    let path = this.path;
    let params = {};
    if (this.schema.parameters) {
      for (let param of this.schema.parameters) {
        if (param.in === 'path') {
          path = path.replace(`{${param.name}}`, encodeURIComponent(data[param.name]));
        }
        else if (param.in ==='query') {
          params[param.name] = data[param.name];
        }
      }
    }
    if (!($.isEmptyObject(params))) {
      path = `${path}?${$.param(params)}`;
    }
    return path;
  }

  setRequestBody(options, data) {
    if (this.schema.parameters) {
      for (let param of this.schema.parameters) {
        if (param.in === 'body') {
          if (param.schema || param.type === 'object') {
            options.data = JSON.stringify(data[param.name]);
            options.contentType = 'application/json';
          }
          break;
        }
      }
    }
  }

  validateDefinition(data, definition) {
    verifyDataType(data, definition.type, definition.title);
    if (definition.required) {
      for (let requiredField of definition.required) {
        verifyRequiredField(data, requiredField);
      }
    }
    if (definition.properties) {
      for (let prop in definition.properties) {
        let propData = data[prop];
        let propSchema = definition.properties[prop];
        if (propData) {
          if (propSchema.type !== 'object' || propSchema.additionalProperties) {
            verifyDataType(propData, propSchema.type, prop);
          }
          if (propSchema.additionalProperties) {
			if (propSchema.additionalProperties.type === 'object') {
				this.validateDefinition(propData, propSchema.additionalProperties);
			}
			else {
				for (let propDataKey in propData) {
					verifyDataType(propData[propDataKey], propSchema.additionalProperties.type);
				}
			}
          }
        }
      }
    }
  }

  validateParameters(data) {
    if (this.schema.parameters) {
      requiresNotNull(data, 'rest api data');
      verifyDataType(data, 'object', 'rest api data');
      for (let param of this.schema.parameters) {
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
    }
  }
    
	addToStore(input, output) {
		if (!this.schema.parameters) {
			this.store = output;
		}
		else {
			if (!this.store) {
				this.store = {};
			}
			this.store[JSON.stringify(input)] = output;
		}
	}
	
	getFromStore(input) {
		if (!this.schema.parameters) {
			return this.store;
		}
		if (this.store) {
			return this.store[JSON.stringify(input)];
		}
	}

	call(data, validate, enableCache, cache=false) {
		return new Promise((resolve, reject) => {
			if (enableCache && cache) {
				let output = this.getFromStore(data);
				if (output) {
					setTimeout(resolve, 0, output);
					return;
				}
			}
			try {
				if (validate) {
					this.validateParameters(data);
				}
				let options = Object.assign({}, this.ajaxOpts);
				options.url = this.urlPrefix + this.getPath(data);
				options.type = this.method;
				this.setRequestBody(options, data);
				$.ajax(options)
					.done((res) => {
						if (enableCache) {
							this.addToStore(data, res);
						}
						resolve(res);
					})
					.fail((jqXHR, textStatus, errorThrown) => {
						reject(new Error(textStatus));
					});
			} catch (e) {
				reject(e);
			}
		});
	}
}

const Swagger2Client = (swaggerUrl, ajaxOpts, urlPrefix, validate=true, enableCache=false) => {
  requiresNotNull(swaggerUrl);
  urlPrefix = urlPrefix || '';
  ajaxOpts = ajaxOpts || {};
  let apis = {};
  let options = Object.assign({}, ajaxOpts);
  options.url = swaggerUrl;
  options.async = false;
  options.type = 'GET';
  options.dataType = 'json';
  $.ajax(options)
  .done((swagger) => {
    setDefRefs(swagger);
    for (let path in swagger.paths) {
      let pathSchema = swagger.paths[path];
      for (let method in pathSchema) {
        let schema = pathSchema[method];
        let client = new RestClient(ajaxOpts, urlPrefix, path, method, schema);
        apis[schema.operationId] = (data, fromCacheIfExists) => {
          return client.call(data, validate, enableCache, fromCacheIfExists);
        };
      }
    }
  })
  .fail((jqXHR, textStatus, errorThrown) => {
	throw Error(`Unable to get swagger json from ${swaggerUrl}.`);
  });
  return apis;
}

export default Swagger2Client
