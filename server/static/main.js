var app = angular.module(
	'vmprof', ['ngRoute', 'ngCookies'], function($routeProvider, $httpProvider) {

	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    $routeProvider
        .when('/', {
            templateUrl: '/static/list.html',
            controller: 'list'
        })
	    .when('/login', {
            templateUrl: '/static/login.html',
            controller: 'login'
        })
		.when('/logout', {
			resolve: {
				redirect: function($location, AuthService){
					AuthService.logout().then(function() {
						$location.path('/');
					});
				}
			}
		})
		.when('/register', {
            templateUrl: '/static/register.html',
            controller: 'register'
        })
        .when('/:log', {
            templateUrl: '/static/details.html',
            controller: 'details'
        })
        .otherwise({
            redirectTo: '/'
        });

}).factory('AuthService', function ($http, $cookies) {
	var authService = {};

	authService.login = function (credentials) {
		var d = $http.post('/api/user/', credentials);

		d.then(function (res) {
			$cookies.user = JSON.stringify(res.data);
			return res.data;
		});

		return d;
	};

	authService.logout = function() {
		return $http.delete('/api/user/').then(function () {
			delete $cookies.user;
		});
	};

	authService.isAuthenticated = function () {
		return !!Session.userId;
	};

	return authService;

});

app.controller('main', function ($scope, $cookies) {
	$scope.user = $cookies.user ? JSON.parse($cookies.user) : null;

	$scope.$watch(function() { return $cookies.user; }, function(newValue) {
		$scope.user = $cookies.user ? JSON.parse($cookies.user) : null;
    });

	$scope.setUser = function (user) {
		$scope.user = user;
	};
});

app.controller('login', function ($scope, $http, $location, AuthService) {

	$scope.user = {
		username: "",
		password: ""
	};

	$scope.submit = function() {
		aaa = AuthService.login($scope.user)
			.success(function(data, status, headers, config) {
				$location.path('/');
			})
			.error(function(data, status, headers, config) {
				$scope.error = true;
			});
	}
});

app.controller('register', function ($scope, $http) {

	$scope.user = {
		username: "",
		password: "",
		email: ""
	};

	$scope.submit = function() {
		$http.put('/api/user/', $scope.user).then(function(response) {
			debugger
		});
	}

});



app.controller('list', function ($scope, $http) {
    angular.element('svg').remove();

    $scope.loading = true;

    $http.get('/api/log/').then(function(response) {
        $scope.logs = response.data;

        $scope.loading = false;
    });
});

app.controller('details', function ($scope, $http, $routeParams, $timeout,
                                    $location) {
    angular.element('svg').remove();

    $scope.loading = true;

    $http.get('/api/log/' + $routeParams.log + '/', {
        cache: true
    }).then(function(response) {
        $scope.log = response.data;

        var addresses = $routeParams.id;
        var path_so_far;

        if (addresses) {
            path_so_far = addresses.split(",");
        } else {
            path_so_far = [];
        }

        var stats = new Stats(response.data.data);
        global_stats = stats;
        var root = stats.nodes;
        $scope.visualization = $routeParams.view || 'flames';
        var d = stats.getProfiles($routeParams.id);

        $scope.currentProfiles = d.profiles;
        $scope.root = d.root;
        $scope.total_time = stats.allStats[d.root.addr].total / stats.nodes.total;
        $scope.self_time = stats.allStats[d.root.addr].self / stats.nodes.total;
        $scope.paths = d.paths;

        $timeout(function () {
            $('[data-toggle=tooltip]').tooltip();
            var height = 800; //$('.table').height();
            var $visualization = $("#visualization");
            if ($visualization.length < 1)
                return;
            $scope.visualizationChange = function(visualization) {

                $scope.visualization = visualization;
                var cutoff = d.root.total / 100;
                if (visualization == 'squares') {
                    Visualization.squareChart(
                        $("#visualization"),
                        height,
                        d.root,
                        $scope, $location, path_so_far
                    );
                }
                if (visualization == 'flames') {
                    Visualization.flameChart(
                        $("#visualization"),
                        height,
                        d.root,
                        $scope, $location,
                        cutoff, path_so_far
                    );
                }
            };

            $scope.visualizationChange($scope.visualization);
        });

        $scope.loading = false;
    });
});

