'use strict';

var app = angular.module('ctrldespesasApp');

app.controller('GridCtrl', ['$scope', '$http', '$log', function ($scope, $http, $log) {
  
  var weekday = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sabado"];    
    
  $http.defaults.useXDomain = true;
  
  $scope.total = 0;    
    
  $scope.gridOptions = {
    columnDefs: [{name:"Data", field:"data"},
                 {name:"Dia", field:"dia"},       
                 {name:"Valor", field:"valor"}],
    expandableRowTemplate: 'views/grid/expandableRowTemplate.html',
    expandableRowHeight: 300,
    expandableRowScope: {
      subGridVariable: 'subGridScopeVariable'
    }
  }

  $scope.gridAllOptions = {
    columnDefs: [{name:"Data",      field:"data"},
                 {name:"Dia",       field:"dia"}, 
                 {name:"Hora",      field:"hora"},
                 {name:"Descrição", field:"descricao", minWidth: 300},  
                 {name:"Valor",     field:"valor"}]
  }
    
  var zeroComplete = function(vlr) {
     return (vlr < 10)?"0"+vlr:vlr;
  }

  var strToData = function(vlr) {
     var date = new Date(vlr);
     return (zeroComplete(date.getDate()) + "/" +  zeroComplete(date.getMonth() + 1) + "/" + date.getFullYear());	
  }
  
  var strToHour = function(vlr) {
     var date = new Date(vlr);
     return (zeroComplete(date.getHours()) + ":" +  zeroComplete(date.getMinutes() + 1) + ":" + zeroComplete(date.getSeconds()));	
  }

  var clone = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }
  
  var getDia = function(vlr) {
    return weekday[new Date(vlr).getDay()];   
  }
  
  $http.get('http://localhost:8181/gastos')
      .success(function(itens) {
        
        $scope.total = 0;

        var mapData = [];
        var mapTipo = [];
        var itensDias = [];
        var listItens = [];
        var itensc = [];
      
        for(var i = 0; i < itens.length; i++){
	       var item = itens[i];
	       if (item.data && item.valor < 0 && item.descricao) {
                listItens.push(item);
                var date = strToData(item.data);
                var itemc = clone(item);
                itemc.data = strToHour(itemc.data);
                if (!mapData[date]) {
	               mapData[date] = {data:date,valor:item.valor,dia:getDia(item.data),subItens:[itemc]};	  	  	        
	            }
                else {
                   mapData[date].valor += item.valor; 
                   mapData[date].subItens.push(itemc);       
                }
               
                if(!mapTipo[item.tipo]) {
                   mapTipo[item.tipo] = item.valor;        
                }
                else {
                  mapTipo[item.tipo] += item.valor;  
                }
            }
       }
      
      for (var itemDia in mapData) {
          mapData[itemDia].valor = (Math.round(mapData[itemDia].valor * 100) / 100);
          $scope.total += mapData[itemDia].valor;
          mapData[itemDia].subGridOptions = {
             columnDefs: [{name:"Hora", field:"data"},
                          {name:"Tipo", field:"tipo"},
                          {name:"Desc.", field:"descricao"},
                          {name:"Valor", field:"valor"}],
             data: mapData[itemDia].subItens
          }
          itensDias.push(mapData[itemDia]);
          for (var i=0;i<mapData[itemDia].subItens.length;i++) {
            var parentItem = mapData[itemDia];
            var childItem  = mapData[itemDia].subItens[i];
            itensc.push({data:parentItem.data,
                         dia:parentItem.dia,
                         hora:childItem.data,
                         descricao:childItem.descricao,
                         valor:childItem.valor
                       });
          }
      }
      
      $scope.total = Math.round($scope.total * 100) / 100;
      $scope.gridAllOptions.data = itensc;
      $scope.gridOptions.data = itensDias;
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

