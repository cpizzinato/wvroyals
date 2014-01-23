'use strict';

app.controller('MainCtrl', function($scope, $window, $location) {
  angular.element('#nav').bind('click', function(event) {
    if(event.target && event.target.nodeName === "A") {
      var parentNode = event.target.parentNode;
      updateNav(parentNode);
    }
    if(angular.element('.navbar-toggle').css('display') !== 'none') {
     angular.element('.navbar-toggle').click();
    }
  });

  function updateNav(node) {
    angular.element('li').removeClass('active');
    angular.element(node).addClass('active');
  }

  var classArray = $location.path().split(/\W+/);
  var hash = classArray[1] === '' ? 'home' : classArray[1];
  updateNav(angular.element('#' + hash));

  

});

app.controller('HomeCtrl', function($scope, playerService, ngProgressLite) {

  ngProgressLite.start();
  playerService.getScoringLeaders().then(function(leaders) {
    $scope.leaders = leaders;
    ngProgressLite.done();
  });

});


app.controller('NewsCtrl', function($scope, newsService, ngProgressLite) {
  $scope.feed = {};

  ngProgressLite.start();
  newsService.get({}, function(response) {
     $scope.feed = response;
     ngProgressLite.done();
  });
});

app.directive('post', function() {
  return {
    scope: true,
    link: function(scope, element, attrs) {
      var post;

      var parseURL = function() {
        return post.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
          return url.link(url);
        });
      };

      attrs.$observe('post', function(value) {
        post = value;
        post = parseURL();
        element.html(post);
      });
    }
  };
});

app.controller('ClubCtrl', function($scope) {
  var map;

  var init = function() {

    var fieldLatLng = new google.maps.LatLng(49.325806,-123.150167);  
    var mapOptions = {
      zoom: 16,
      center: fieldLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var marker = new google.maps.Marker({
      position: fieldLatLng,
      map: map,
      title: "Ambleside F"
    });
  };
  init();
});

app.controller('MediaCtrl', function($scope) {

});

app.controller('TeamCtrl', function($scope, playerService, ngProgressLite) {
	$scope.players = [];
  ngProgressLite.start();
	playerService.getPlayers().then(function(response) {
		$scope.players = response;
    ngProgressLite.done();
	});


		
});

app.controller('ResultsCtrl', function($scope, scheduleService, standingsService, ngProgressLite) {
	$scope.tab ='views/partials/schedule.html';
    $scope.tabs = ['Schedule', 'Standings'];
	$scope.selected = 'Schedule';
  
  ngProgressLite.start();

	$scope.chooseTab = function(category) {
		$scope.selected = category;
        $scope.tab = 'views/partials/' + angular.lowercase(category) + '.html';
	};

  $scope.getHistory = function() {
    ngProgressLite.start();
    scheduleService.getHistory().then(function(data) {
      $scope.schedule.unshift.apply($scope.schedule, data);
      angular.element('#getPrevGames').addClass('disabled');
      ngProgressLite.done();
    });
  };
	
  scheduleService.getSchedule().then(function(data) {
    $scope.schedule = data;
    ngProgressLite.done();
  });

  $scope.getClass = function (team) {
    return {
      royalsBlue: team.team === 'West Van Royals'
    };
  };

	$scope.teams = [];
	standingsService.get({}, function(response) {
		$scope.teams = response;
	});

	$scope.gridOptions = {data: 'teams'};

});

app.controller('AwardsCtrl', function($scope) {
  $scope.vmsl = [
    '2012   Runners Up - VMSL Div 3 \'B\'',
  ];	

  $scope.nssl = [
    '2013   Runners Up - North Shore Sportsman\'s League Cup',
    '2013   Champions - North Shore Sportsman\'s League Lionsgate Division',
    '2012   Runners Up - North Shore Sportsman\'s League Cup',
    '2011   Runners Up - North Shore Sportsman\'s League Cup'
  ];
});

app.directive('playerCard', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('mouseenter', function(event) {
				event.preventDefault();

				if(Modernizr.csstransitions) {
					element.find('.more-info').addClass('more-info-show');
					element.find('.info-bottom').addClass('fadeInUp');
				}
			});

			element.bind('mouseleave', function(event) {
				event.preventDefault();

				if(Modernizr.csstransitions) {
					element.find('.more-info').removeClass('more-info-show');
					element.find('.info-bottom').removeClass('fadeInUp');
				}
				
			});

			element.bind('click', function(event) {
				event.preventDefault();


			});
		}
	};
});

app.directive('standingsWidget', function(standingsService) {
  return {
    restrict: 'E',
    replace: true,
    link: function(scope, element, attrs) {
      standingsService.get({}, function(response) {

        scope.teams = response.map(function(item, idx, array) {
          item['pos'] = idx + 1;
          return item;
        }).filter(function(value, idx, results) {
          return (idx < 3 || results[idx].team === 'West Van Royals');
        });
      });
    },
    template: 
      '<div class="card">' +
      '<h2>Standings</h2>' +
      '<ul>' +
      '<li ng-repeat="team in teams"><h3>{{team.pos}} <span class="text-muted">{{team.team}}</span><span style="float:right;">{{team.pts}}</span></h3></li>' +
      '</ul>' +
      '<br/>' +
      '<div><a href="/results">See full standings</a></div>' +
      '<br/>' +
      '</div>'
  };
});

app.directive('nextGame', function(scheduleService, $animate) {
	return {
		restrict: 'E',
		replace: true,
		link: function(scope, element, attrs) {
			scheduleService.getNextGame().then(function(data) {
              scope.nextGame = data;
            });
		},
		template:
			'<div style="z-index:3">' +
      '<h2 style="color:#444;"><span class="glyphicon glyphicon-calendar"></span>next game <span class="text-success">{{nextGame.fromNow}}</span></h2>' +
      '<h3 style="color: #E74C3C;">{{nextGame.day}} {{nextGame.date}}' + 
      '<ng-pluralize style="vertical-align:super;font-size:10px;"' + 
      ' count="nextGame.date" when="{1:\'st\',2:\'nd\',3:\'rd\',21:\'st\',22:\'nd\',23:\'rd\',31:\'st\',\'other\':\'th\'}"></ng-pluralize>' +
      ' at {{nextGame.time}}</h3>' +
      '<div>' +
      '<div style="color: #444;">{{nextGame.home}} vs {{nextGame.away}}</div>' +
      '<div style="color:#444;">{{nextGame.loc}}</div>' +
      '</div>' +
      '</div>'
	};
});

app.directive('position', function() {
	return {
		restrict: 'E',
		scope: {
			players: '=',
      search: '='
		},
		template:
			'<div class="box-item" ng-repeat="player in players | filter:search">' +
				'<div class="thmb" player-card>' +
						'<img ng-src="/images/team/{{player.imageKey}}" border="0" class="t">' +
						'<div class="more-info">' +
							'<div class="info-bottom">' + 
							'<div style="font-weight:bold;">{{player.pos}}</div>' +
							  '<ul class="stats" style="text-align:left;">' + 
							    '<li><div><div class="stats-icon goal"></div>{{player.gol}}</div></li>' + 
							    '<li><div><div class="stats-icon redCard"></div>{{player.red}}</div></li>' + 
							    '<li><div><div class="stats-icon yellowCard"></div>{{player.yel}}</div></li>' + 
							  '</ul>' +
							'</div>' +
						'</div>' +
				'</div>' +
				'<div class="item-container">' +
					'<h4 style="float:left;">{{player.lname}}</h4><h4 style="float:right;color:#268bb5;font-size:18px;">{{player.no}}</h4>' +
				'</div>' +
			'</div>'
			// '<div class="clear"></div>'
	};
});


//DEPRICATED DIRECTIVE
/*
app.directive('homeCell', function($location) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind('mouseenter', function(event) {
				event.preventDefault();
				var w = element.find('h3').width()+20+20;

				if(Modernizr.csstransitions) {
					element.find('.blenda').css('width', w);
					element.find('.bg').css('left', (w/2));
				}
			});

			element.bind('mouseleave', function(event) {
				event.preventDefault();

				if(Modernizr.csstransitions) {
					element.find('.blenda').css('width', 0);
					element.find('.bg').css('left', 0);	
				}
				
			});

			element.bind('click', function(event) {
				event.preventDefault();
				var classArray = element.attr('class').split(/\s+/);
				var hash = classArray[1];
				$location.path('/' + hash);
				scope.$apply();
			});
		}
	};
});
*/
app.filter('truncate', function() {
  return function(text, length, end) {
    if(isNaN(length)) {
      length = 10;
    }
    if(end === undefined) {
      end = '...';
    }
    if(text.length <= length || text.length - end.length <= length) {
      return text;
    }
    else {
      return String(text).slice(0, length - end.length) + end;
    }
  };
});

app.filter('moment', function() {
  return function(dataString, format, outFormat) {
    if (typeof(outFormat) === 'string') {
      return moment(dataString, format).format(outFormat);
    } else {
      return moment(dataString, format).calendar();
    }
  };
});

app.filter('full', function() {
  return function(imageUrl, size) {
    return imageUrl.replace('_s.', '_n.');
  };
});

app.factory('newsService', function($resource) {
	return $resource('/getNews.php', {}, {
		get: {method: 'GET'}
	});
});

app.service('playerService', function($q, $resource) {
  var self = this;
  var playerAPI = $resource('/getPlayers.php', {}, {
    get: {method: 'GET', isArray: true}
  });

  this.getPlayers = function() {
    var deferred = $q.defer();
    playerAPI.get({}, function(players) {
      if(typeof(players) === 'undefined') {
        deferred.reject();
      } else {
        deferred.resolve(players);
      }
    });

    return deferred.promise;
  };

  this.getScoringLeaders = function() {
    var deferred = $q.defer();
    playerAPI.get({leaders: 1}, function(leaders) {
      if(typeof(leaders) === 'undefined') {
        deferred.reject();
      } else {
        deferred.resolve(leaders);
      }
    });

    return deferred.promise;
  }
});

app.factory('standingsService', function($resource) {
	return $resource('/getStandings.php', {}, {
		get: {method: 'GET', isArray: true}
	});
});


app.service('scheduleService', function($q, $resource) {
  var self = this;
  var scheduleAPI = $resource('/getSchedule.php', {}, {
    get: {method: 'GET', isArray: true}
  });

  this.getHistory = function() {
    var deferred = $q.defer();

    scheduleAPI.get({history: 1}, function(history) {
      if(typeof(history) === 'undefined') {
        deferred.reject();
      } else {
        deferred.resolve(history);
      }
    });

    return deferred.promise;
  };

  this.getSchedule = function() {
    var deferred = $q.defer();

    scheduleAPI.get({}, function(schedule) {
      if(typeof(schedule) === 'undefined') {
        deferred.reject();
      } else {  
        deferred.resolve(schedule);
      }
    });

    return deferred.promise;
  };

  this.getNextGame = function() {
    var deferred = $q.defer();

    scheduleAPI.get({}, function(schedule) {
      if(typeof(schedule) === 'undefined') {
        deferred.reject();
      } 
      else {  
	     var now = moment();
    	 var daysofweek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    	 var size = schedule.length;
    	 for(var i = 0; i < size; i++) {
  		  var date = moment(schedule[i].date, "YYYY-MM-DD HH:mm:ss");
  		  if (date.diff(now) >= 0) {	
  		    deferred.resolve({
    			  loc: schedule[i].loc,
    			  date: date.date(),
    			  day: daysofweek[date.day()],
    			  time: date.format("hh:mm A"),
    			  fromNow: date.fromNow(),
    			  home: schedule[i].home,
    			  away: schedule[i].away
  			  });
          break;
  		  }
    	}
      }
    });

    return deferred.promise;
  };
});
