var app = angular.module('ScalrAPIExample', ['LocalStorageModule', 'ui.bootstrap']);

app.service('ScalrAPI', ['$http', function($http) {
  
  this.signatureVersion = 'V1-HMAC-SHA256';

  this.apiSettings = {};

  this.setSettings = function(newSettings) {
    this.apiSettings = newSettings;
  }

  this.makeQueryString = function(params) {
    if (params.length == 0) {
      return '';
    }
    if (JSON.stringify(params) === '{}') {
      return '';
    }
    var sorted = [];
    for(var key in params) {
      sorted[sorted.length] = key;
    }
    sorted.sort();
    var result = encodeURIComponent(sorted[0]) + '=' + encodeURIComponent(params[sorted[0]]);
    for (var i = 1; i < sorted.length; i ++) {
      result += '&' + encodeURIComponent(sorted[i]) + '=' + encodeURIComponent(params[sorted[1]]);
    }
    return result;
  }

  this.makeAuthHeaders = function(method, date, path, params, body) {
    var headers = {'X-Scalr-Key-Id': this.apiSettings.keyId,
                   'X-Scalr-Date' : date,
                   'X-Scalr-Debug' : '1'};
    var toSign = [method, date, path, params, body].join('\n');

    var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(toSign, this.apiSettings.secretKey));

    headers['X-Scalr-Signature'] = this.signatureVersion + ' ' + signature;
    return headers;
  }

  this.makeApiCall = function (method, path, params, body, onSuccess, onError) {
    var queryString, headers;
    var timestamp = new Date().toISOString();
    var scalrAddress = this.apiSettings.apiUrl;

    if (!params) {
      queryString = '';
    } else if (typeof params === 'string') {
      queryString = params; //Assuming the parameters are sorted if they are passed as a string
    } else {
      queryString = this.makeQueryString(params);
    }

    if (scalrAddress.endsWith('/')) {
      scalrAddress = scalrAddress.substring(0, scalrAddress.length - 1);
    }

    headers = this.makeAuthHeaders(method, timestamp, path, queryString, body);

    $http({
      'method' : method,
      'url' : scalrAddress + path + (queryString.length > 0 ? '?' + queryString : ''),
      'headers' : headers,
      'data': body
    }).then(onSuccess, onError);
  }

  this.fetch = function(path, params, onSuccess, onError) {
    this.makeApiCall('GET', path, params, '', onSuccess, onError);
  }

  this.create = function(path, body, onSuccess, onError) {
    this.makeApiCall('POST', path, '', body, onSuccess, onError);
  }

  this.delete = function(path, onSuccess, onError) {
    this.makeApiCall('DELETE', path, '', '', onSuccess, onError);
  }

  this.edit = function(path, body, onSuccess, onError) {
    this.makeApiCall('PATCH', path, '', body, onSuccess, onError);
  }

  // Note: with this function the response object passed to the onSuccess will be the one returned by the last API call
  // of the scroll, to which a new property all_data is added, containing the parsed representation of all the results.
  this.scroll = function(path, params, onSuccess, onError) {
    this.makeApiCall('GET', path, params, '', 
      this.makeOnScrollSuccess(path, onSuccess, onError, [], this),
      onError);
  }

  this.makeOnScrollSuccess = function(path, onSuccess, onError, previousData, that) {
    return function(response) {
      var result = response.data;
      var data = result.data.concat(previousData);

      if (result.pagination.next) {
        var nextParams = result.pagination.next.substring(result.pagination.next.indexOf('?') + 1);
        that.makeApiCall('GET', path, nextParams, '', 
          that.makeOnScrollSuccess(path, onSuccess, onError, data, that),
          onError);
      } else {
        response.all_data = data;
        onSuccess(response);
      }
    };
  }

}]);

app.controller('APIRequestForm', ['ScalrAPI', '$scope', '$location', '$http', '$filter', 'localStorageService', function (ScalrAPI, $scope, $location, $http, $filter, localStorageService) {

  $scope.equals = angular.equals;
  $scope.isHttps = $location.protocol() === 'https';

  // API Settings handling
  $scope.defaultApiSettings = {'apiUrl': 'https://my.scalr.com/'};

  $scope.apiSettings = {};
  $scope.storedApiSettings = null;

  $scope.loadApiSettings = function () {
    var storedApiSettings = angular.fromJson(localStorageService.get('apiSettings'));
    $scope.storedApiSettings = storedApiSettings === null ? $scope.defaultApiSettings : storedApiSettings;
    $scope.apiSettings = angular.copy($scope.storedApiSettings);
    ScalrAPI.setSettings($scope.apiSettings);
  }

  $scope.saveApiSettings = function () {
    $scope.storedApiSettings = angular.copy($scope.apiSettings);
  }

  $scope.clearApiSettings = function () {
    $scope.storedApiSettings = angular.copy($scope.defaultApiSettings);
  }

  $scope.$watch('storedApiSettings', function (newSettings, oldSettings) {
    if (newSettings === oldSettings) return;  // Same object --> initialization.
    localStorageService.set('apiSettings', angular.toJson(newSettings));
  }, true);

  $scope.$watch('apiSettings', function(newSettings, oldSettings) {
    ScalrAPI.setSettings(newSettings);
  }, true);

  //Example 1: list farms in an environment
  $scope.params1 = {'envID': ''};
  $scope.result1 = {};
  $scope.listFarms = function() {
    if (!/^[0-9]+$/.test($scope.params1.envID)) {
      $scope.result1.body = 'Error: specify a valid environment ID.\nAn environment ID contains only numbers.';
      return;
    }
    var path = '/api/v1beta0/user/' + $scope.params1.envID + '/farms/';
    $scope.result1.statusCode = '';
    $scope.result1.statusText = 'Fetching ' + path + '...';
    $scope.result1.body = '';
    ScalrAPI.scroll(path, {},
      function(response) {
        $scope.result1.statusCode = response.status;
        $scope.result1.statusText = response.statusText;
        $scope.result1.body = vkbeautify.json(response.all_data);
      }, function(response) {
        $scope.result1.statusCode = response.status;
        $scope.result1.statusText = response.statusText;
        $scope.result1.body = vkbeautify.json(response.data);
      });
  }

  //Example 2: list images in an environment, with filters
  $scope.params2 = {
    envID: '',
    name: '',
    os: '',
    cloudPlatform: ''
  };
  $scope.result2 = {};
  $scope.listImages = function() {
    if (!/^[0-9]+$/.test($scope.params2.envID)) {
      $scope.result2.body = 'Error: specify a valid environment ID.\nAn environment ID contains only numbers.';
      return;
    }
    queryParameters = {};
    if ($scope.params2.name) {
      queryParameters.name = $scope.params2.name;
    }
    if ($scope.params2.os) {
      queryParameters.os = $scope.params2.os;
    }
    if ($scope.params2.cloudPlatform) {
      queryParameters.cloudPlatform = $scope.params2.cloudPlatform;
    }
    var path = '/api/v1beta0/user/' + $scope.params2.envID + '/images/';
    $scope.result2.statusCode = '';
    $scope.result2.statusText = 'Fetching ' + path + '...';
    $scope.result2.body = '';
    ScalrAPI.scroll(path, queryParameters,
      function(response) {
        $scope.result2.statusCode = response.status;
        $scope.result2.statusText = response.statusText;
        $scope.result2.body = vkbeautify.json(response.all_data);
      }, function(response) {
        $scope.result2.statusCode = response.status;
        $scope.result2.statusText = response.statusText;
        $scope.result2.body = vkbeautify.json(response.data);
      });
  }

  //Example 3: create a farm
  $scope.params3 = {
    envID: '',
    cleanup: true
  };
  $scope.result3 = '';

  $scope.startCreateFarm = function() {
    $scope.result3 = '';
    $scope.ex3data = {};
    if (!/^[0-9]+$/.test($scope.params3.envID)) {
      $scope.result3 = 'Error: specify a valid environment ID.\nAn environment ID contains only numbers.';
      return;
    }
    $scope.ex3data.envID = $scope.params3.envID;
    $scope.ex3data.cleanup = !!$scope.params3.cleanup;
    // Step 1: create image
    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/images/';
    var body = JSON.stringify({
      name: 'api-test-image-trusty-1',
      cloudImageId: 'ami-10b68a78',
      cloudPlatform: 'ec2',
      cloudLocation: 'us-east-1',
      architecture: 'x86_64',
      os: {
        id: 'ubuntu-14-04'
      }
    });
    $scope.result3 += 'Creating image...\n';
    $scope.result3 += 'Accessing: POST ' + path + '\n';
    $scope.result3 += 'With body:\n' + vkbeautify.json(body) + '\n';

    ScalrAPI.create(path, body, $scope.ex3CreateRole, $scope.ex3error);
  }

  $scope.ex3CreateRole = function(response) {
    $scope.ex3data.imageID = response.data.data.id;
    $scope.result3 += 'Success! Scalr image id: ' + $scope.ex3data.imageID + '\n';
    
    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/roles/';
    var body = JSON.stringify({
      name: 'api-test-role',
      category: {
        id: 1
      },
      os: {
        id: 'ubuntu-14-04'
      },
      'builtinAutomation': ['base']
    });
    $scope.result3 += 'Creating role...\n';
    $scope.result3 += 'Accessing: POST ' + path + '\n';
    $scope.result3 += 'With body:\n' + vkbeautify.json(body) + '\n';

    ScalrAPI.create(path, body, $scope.ex3AddImageToRole, $scope.ex3error);
  }

  $scope.ex3AddImageToRole = function(response) {
    $scope.ex3data.roleID = response.data.data.id;
    $scope.result3 += 'Success! Role id: ' + $scope.ex3data.roleID + '\n';

    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/roles/' + $scope.ex3data.roleID + '/images/';
    var body = JSON.stringify({
      image: {
        id: $scope.ex3data.imageID
      }
    });
    $scope.result3 += 'Linking image to role...\n';
    $scope.result3 += 'Accessing: POST ' + path + '\n';
    $scope.result3 += 'With body:\n' + vkbeautify.json(body) + '\n';

    ScalrAPI.create(path, body, $scope.ex3GetProjectId, $scope.ex3error);
  }

  $scope.ex3GetProjectId = function(response) {
    $scope.ex3data.imageAssociatedToRole = true;
    $scope.result3 += 'Success! \n';

    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/projects/';

    $scope.result3 += 'Listing projects to get an usable project ID for the farm...\n';
    $scope.result3 += 'Accessing: GET ' + path + '\n';

    ScalrAPI.fetch(path, '', $scope.ex3CreateFarm, $scope.ex3error);
  }

  $scope.ex3CreateFarm = function(response) {
    if (response.data.data.length < 1) {
      $scope.result3 += 'Error: no projects are defined.\n'
      if ($scope.ex3data.cleanup) {
        $scope.ex3cleanup();
      }
      return;
    }

    $scope.ex3data.projectID = response.data.data[0].id;
    $scope.result3 += 'Success! Project ID: ' + $scope.ex3data.projectID + '\n';
    
    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/farms/';
    var body = JSON.stringify({
      name: 'API Test Farm',
      project: {
        id: $scope.ex3data.projectID
      }
    });

    $scope.result3 += 'Creating farm...\n';
    $scope.result3 += 'Accessing: POST ' + path + '\n';
    $scope.result3 += 'With body:\n' + vkbeautify.json(body) + '\n';

    ScalrAPI.create(path, body, $scope.ex3CreateFarmRole, $scope.ex3error);
  }

  $scope.ex3CreateFarmRole = function(response) {
    $scope.ex3data.farmID = response.data.data.id;
    $scope.result3 += 'Success! Farm id: ' + $scope.ex3data.farmID + '\n';

    var path = '/api/v1beta0/user/' + $scope.ex3data.envID + '/farms/' + $scope.ex3data.farmID + '/farm-roles/';
    var body = JSON.stringify({
      alias: 'api-test-farm-role-1',
      role: {
        id: $scope.ex3data.roleID
      },
      platform: 'ec2',
      placement: {
        'region': 'us-east-1', 
        'placementConfigurationType': 'AwsClassicPlacementConfiguration'
      },
      instance: {
        'instanceConfigurationType': 'AwsInstanceConfiguration', 
        'instanceType': {
          'id': 'm1.small'
        }
      },
      scaling: {
        "minInstances": 1, 
        "enabled": true, 
        "maxInstances": 2
      }
    });


    $scope.result3 += 'Creating farm role in the farm...\n';
    $scope.result3 += 'Accessing: POST ' + path + '\n';
    $scope.result3 += 'With body:\n' + vkbeautify.json(body) + '\n';

    ScalrAPI.create(path, body, $scope.ex3allDone, $scope.ex3error);

  }

  $scope.ex3allDone = function(response) {
    $scope.result3 += 'Farm role created.\nYou should now have a brand new functional farm in your account.\n';
    if ($scope.ex3data.cleanup) {
      $scope.ex3cleanup();
    } else {
      $scope.result3 += 'You have chosen not to clean up after this example. You should be able to launch the farm it created, but if you want to run it again, you need to manually remove the farm, the farm role and the image it created, or it will fail.\n';
    }
  }

  $scope.ex3error = function(response) {
    $scope.result3 += 'API call failed. Status Code: ' + response.status + ' ' + response.statusText + '\n';
    $scope.result3 += 'Response body:\n' + vkbeautify.json(response.data) + '\n';
    if ($scope.ex3data.cleanup) {
      $scope.ex3cleanup();
    }
  }

  $scope.ex3cleanup = function() {
    $scope.ex3data.cleanup = false;  //Avoid triggering recursive cleanups in ex3error if an API call fails
    $scope.result3 += 'Cleaning everything up... \n';

    if ($scope.ex3data.farmID) {
      $scope.ex3CleanupFarm();
    }
    else if ($scope.ex3data.imageAssociatedToRole) {
      $scope.ex3RemoveImageFromRole();
    }
    else if ($scope.ex3data.roleID) {
      $scope.ex3CleanupRole();
    }
    else if ($scope.ex3data.imageID) {
      $scope.ex3CleanupImage();
    }
  }

  $scope.ex3CleanupFarm = function() {
    $scope.result3 += 'Removing farm... \n';
    ScalrAPI.delete('/api/v1beta0/user/' + $scope.ex3data.envID + '/farms/' + $scope.ex3data.farmID + '/',
      function(response) {
        $scope.result3 += 'Farm deleted \n';
        $scope.ex3RemoveImageFromRole();
      }, $scope.ex3error);
  }

  $scope.ex3RemoveImageFromRole = function() {
    $scope.result3 += 'Removing image from role... \n';
    ScalrAPI.delete('/api/v1beta0/user/' + $scope.ex3data.envID + '/roles/' + $scope.ex3data.roleID + '/images/' + $scope.ex3data.imageID + '/',
      function(response) {
        $scope.result3 += 'Image removed from role \n';
        $scope.ex3CleanupRole();
      }, $scope.ex3error);
  }

  $scope.ex3CleanupRole = function() {
    $scope.result3 += 'Removing role... \n';
    ScalrAPI.delete('/api/v1beta0/user/' + $scope.ex3data.envID + '/roles/' + $scope.ex3data.roleID + '/',
      function(response) {
        $scope.result3 += 'Role removal done. \n';
        $scope.ex3CleanupImage();
      }, $scope.ex3error);
  }

  $scope.ex3CleanupImage = function() {
    $scope.result3 += 'Removing image... \n';
    ScalrAPI.delete('/api/v1beta0/user/' + $scope.ex3data.envID + '/images/' + $scope.ex3data.imageID + '/',
      function(response) {
        $scope.result3 += 'Image removal done. \n';
        $scope.ex3data.cleanup = true;
        $scope.result3 += 'Cleanup done. \n';
      }, $scope.ex3error);
  }

  // Initialization
  $scope.loadApiSettings();
}]);
