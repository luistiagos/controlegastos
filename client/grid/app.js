var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.expandable', 'ui.grid.selection', 'ui.grid.pinning']);

app.controller('MainCtrl', ['$scope', '$http', '$log', function ($scope, $http, $log) {
  $scope.gridOptions = {
    expandableRowTemplate: 'grid/expandableRowTemplate.html',
    expandableRowHeight: 150,
    //subGridVariable will be available in subGrid scope
    expandableRowScope: {
      subGridVariable: 'subGridScopeVariable'
    }
  }

  $scope.gridOptions.columnDefs = [
    { name: 'id' },
    { name: 'name'},
    { name: 'age'},
    { name: 'address.city'}
  ];

  $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json')
    .success(function(data) {
      for(i = 0; i < data.length; i++){
        data[i].subGridOptions = {
          columnDefs: [ {name:"Id", field:"id"},{name:"Name", field:"name"} ],
          data: data[i].friends
        }
      }
      $scope.gridOptions.data = data;
    });

    $scope.gridOptions.onRegisterApi = function(gridApi){
      $scope.gridApi = gridApi;
    };

    $scope.expandAllRows = function() {
      $scope.gridApi.expandable.expandAllRows();
    }

    $scope.collapseAllRows = function() {
      $scope.gridApi.expandable.collapseAllRows();
    }
}]);
