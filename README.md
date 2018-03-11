# swagger2-client
Auto generate Rest client APIs

# Usage
```
import Swagger2Client from 'rn-swagger2-client'

let myRestApis = Swagger2Client('http://127.0.0.1:8888/v2/api-docs', {
      crossDomain: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + window.btoa('rajeevn:root'));
      }
    }, 'http://localhost:8888');

// for Rest path - /pet/details/{petId}
myRestApis.petDetailsUsingGET({ petId: 1234 });
myRestApis.petDetailsUsingPOST({ 
                                 petId: 123, 
                                 body: {
                                  requestedBy: 5675
                                 }
                               });
```
