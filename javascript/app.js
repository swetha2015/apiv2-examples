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

    if (typeof params === 'string') {
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
      'headers' : headers
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

  // Note: with this function the body of the response object passed to the onSuccess
  // callback will be the aggregated data of all the API calls
  this.scroll = function(path, params, onSuccess, onError) {
    this.makeApiCall('GET', path, params, '', function(response) {

    }, onError);
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
    ScalrAPI.fetch('/api/v1beta0/user/' + $scope.params1.envID + '/farms/', {},
      function(response) {
        $scope.result1.statusCode = response.status;
        $scope.result1.statusText = response.statusText;
        $scope.result1.body = vkbeautify.json(response.data);
      }, function(response) {
        $scope.result1.statusCode = response.status;
        $scope.result1.statusText = response.statusText;
        $scope.result1.body = vkbeautify.json(response.data);
      });
  }

  // Initialization
  $scope.loadApiSettings();
}]);
