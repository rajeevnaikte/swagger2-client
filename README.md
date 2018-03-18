# swagger2-client
Auto generate Rest client APIs. It will also validate request data as per schema. It also has cache feature since v1.1.0

# Usage
The API name will be 'operationId' of the path in swagger json.
```
import Swagger2Client from 'rn-swagger2-client'

let swaggerJsonUrl = 'http://127.0.0.1:8888/v2/api-docs';
let ajaxOptions = {
      crossDomain: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + window.btoa('rajeevn:root'));
      }
    };
let urlPrefixForPath = 'http://localhost:8888';

let myRestApis = Swagger2Client(swaggerJsonUrl, ajaxOptions, urlPrefixForPath);

// input format will be - {pathVar1: val, queryParam1: paramVal, body: bodyObject}
// for Rest path - /pet/details/{petId} - it will return a Promise
myRestApis.petDetailsUsingGET({ petId: 1234 })
            .then((res) => console.log(res))
            .catch((err) => console.log(err))
            .then(() => console.log('Finally pet'));
myRestApis.petDetailsUsingPOST({ 
                                 petId: 123, 
                                 body: {
                                  requestedBy: 5675
                                 }
                               })
                               .then((res) => console.log(res))
                               .catch((err) => console.log(err))
                               .then(() => console.log('Finally pet'));
```
# v1.1.0
- Turn on/off request data validation (default is turned on)
- Added cache, and it can be turned on/off (default is turned off). Individual API can be called to get from cache if exists or force get from rest server.
```
let turnOnValidation = false;
let enableCache = true;

let myRestApis = Swagger2Client('http://127.0.0.1:8888/v2/api-docs', {
      crossDomain: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + window.btoa('rajeevn:root'));
      }
    }, 'http://localhost:8888', turnOnValidation, enableCache);
    
// to get from cache if exists, pass second param as true.
myRestApis.petDetailsUsingGET({ petId: 1234 }, true)
            .then((res) => console.log(res))
            .catch((err) => console.log(err))
            .then(() => console.log('Finally pet'));    
```
