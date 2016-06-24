'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('ChartCtrl', ['$scope', function ($scope, $http, $log) {
    
  var makeChartTipo = function(list) {
    var chartTipo = {};
    chartTipo.type = "PieChart";
    chartTipo.data = [["Tipo","Valor"]];    
    chartTipo.options = {
        displayExactValues: true,
        width: 400,
        height: 200,
        is3D: true,
        chartArea: {left:10,top:10,bottom:0,height:"100%"}
    };

    chartTipo.formatters = {
        number : [{
            columnNum: 1,
            pattern: "$ #,##0.00"
        }]
    };
      
    $scope.pieChartTipo = chartTipo;
  };
  
  var init = function() {
      var list = localStorage.getItem('listItens');
      if (!list) {
        return;   
      }
      
      makeChartTipo(list);
  };
    
  init();     
    
}]);

