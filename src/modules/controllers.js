'use strict';

(function() {
    var app = angular.module('app.controllers', [])

    .controller('indexController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                this.maskUrl = '';
            }
        }
    ])

    .controller('loginController', ['$scope', '$http', '$filter', '$state', 'md5', 'util',
        function($scope, $http, $filter, $state, md5, util) {
            var self = this;
            self.init = function() {

            }

            self.login = function () {
                self.loading = true;
                var data = JSON.stringify({
                    action: "GetToken",
                    projectName: self.projectName,
                    username: self.userName,
                    password: md5.createHash(self.password)
                })

                $http({
                    method: 'POST',
                    url: util.getApiUrl('logon', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        util.setParams('userName', self.userName);
                        util.setParams('projectName', self.projectName);
                        util.setParams('token', msg.token);
                        self.getEditLangs();
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                });

            }
            self.getEditLangs = function() {
                $http({
                    method: 'GET',
                    url: util.getApiUrl('', 'editLangs', 'local')
                }).then(function successCallback(response) {
                    util.setParams('editLangs', JSON.stringify(response.data.editLangs));
                    $state.go('app');
                }, function errorCallback(response) {
                    
                });
            }

        }
    ])

    .controller('appController', ['$state', 'util',
        function($state, util) {
            var self = this;
            self.init = function() {
                self.appPhase = 1;
                self.appFramePhase = 1;

                self.maskUrl = '';
                self.maskParams = {};

                console.log(util.getParams('editLangs'))

            }

            // n: 以后换成后台读取，先随便写一个
            // 0:酒店客房，1:移动商城
            self.switchApp = function(n) {
              self.appPhase = 2;
              switch(n) {
                case 0:
                  $state.go('app.hotelRoom');
                  break;
                case 1:
                  $state.go('app.shop');
                  break;
                default:
                  break;
              }
            }

            self.showDesktop = function() {
              self.appPhase = 1;
              setTimeout(function(){
                self.appFramePhase = 1;
              },530)
            }

            self.focusLauncher = function() {
              self.appFramePhase = 2;
            }

            self.focusApp = function() {
              self.appFramePhase = 1;
            }

            self.logout = function(event) {
                util.setParams('token', '');
                $state.go('login');
            }
        }
    ])


    .controller('shopController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$translate,$http,$stateParams,$filter,util) {
            console.log('shopController')

            var self = this;
            self.init = function() {
               self.langStyle = util.langStyle();
               self.multiLang = util.getParams('editLangs');
               console.log(self.langStyle)
               console.log(self.multiLang)
               self.searchShopList();

            }

            self.searchShopList = function() {
                var data = {

                      "action": "getMgtHotelShopInfo",
                      "token": util.getParams("token"),
                      "lang": self.langStyle

                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),

                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.shopList = data.data.data.shopList;
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            self.shopAdd = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/shopAdd.html';
            }
        }
    ])

    .controller('shopAddController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$translate,$filter,util) {
            console.log('shopAddController');
            console.log('$stateParams:'+$stateParams);
            var self = this;
            self.init = function() {
                 self.langStyle = util.langStyle();
                 self.multiLang = util.getParams('editLangs');

                 console.log($scope.app.maskParams.test);
                 self.searchHotelList();
                 
                 console.log(self.langStyle)
                 // 表单提交 商城信息
                 self.form = {};
                 // 多语言
                 self.form.shopName = {};
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.searchHotelList = function() {
                var data = {
                      "action": "getMgtHotelInfo",
                      "token": util.getParams("token"),
                      "lang": self.langStyle
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        self.hotelList = data.data.data.hotelList;
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            self.saveForm = function() {
                var shopList = {
                    "HotelID":self.form.HotelID,
                    "ShopName":self.form.shopName,
                    "ShopType":"wx"
                }
                var data = {
                      "action": "addMgtHotelShop",
                      "token": util.getParams("token"),
                      "lang": self.langStyle
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        self.hotelList = data.data.data.hotelList;
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

        }
    ])

    .controller('goodsController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.shopId;
            }
            self.goodsAdd = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/goodsAdd.html';
            }

            self.categoryAdd = function(){
               $scope.app.maskParams = {'test': '12'};
               $scope.app.maskUrl = 'pages/categoryAdd.html';
            }

            self.categotyEdit = function(){
               $scope.app.maskParams = {'test': '12'};
               $scope.app.maskUrl = 'pages/categoryEdit.html';
            }

            self.shopEdit = function(){
                console.log('shopEdit')
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/shopEdit.html';
            }


        }
    ])

    .controller('goodsAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsAddController');
           
            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('goodsEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsEditController');
           
            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('goodsEditcancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('shopEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('shopEditController');
           
            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])


    .controller('categoryAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryAddController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('categoryEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryEditController');
            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('goodsListController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsListController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.categoryId;
            }

            self.goodsEdit = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/goodsEdit.html';
            }
        }
    ])

    .controller('hotelRoomController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                self.queryHotelList
            }
            self.queryHotelList = function () {
                var hotels = [];
                hotels = [{hotelId: 1, hotelName: 'testhotel1'},
                    {hotelId: 2, hotelName: 'testhotel2'},
                    {hotelId: 3, hotelName: 'testhotel3'}];
                self.hotels = hotels
            }
        }
    ]) 

})();
