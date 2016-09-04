(function(){
	'use strict';
	window.onload = function() {
		var hangmanApp = angular.module('hangmanApp', ['ngComponentRouter']);

		hangmanApp.config(function($locationProvider) {
			$locationProvider.html5Mode(true);
		})
		.value('$routerRootComponent', 'newGame')
		.component('newGame', {
			templateUrl: 'ng-templates/template-new-game.html',
			bindings: {
				categories: '<',
				multiplayer: '<',
				missingNumbers: '<',
				setNumOfWords: '&',
				setNumOfPlayers: '&',
				setCategory: '&'
			}
		})
		.component('gameComponent', {
			templateUrl: 'ng-templates/template-game-component.html',
			bindings: {
				selectedData: '<'
			},
			controller: function(){
				var randomWordIndex = Math.floor(Math.random() * (this.selectedData.length));
				var foundMatches = [];
				var that = this;
				this.hangmanPhase = 0;
				function wrongLGuess(){
					that.hangmanPhase ++;
				}
				this.stats = {
					totalGames: 0,
					gamesWon: 0,
					gamesLost: 0,
					guessedLetters: 0,
					guessedWords: 0
				};
				this.currentWord = this.selectedData[randomWordIndex];
				this.letterCheck = function(letter){
					// If letter has already been guessed
					if(-1 !== foundMatches.indexOf(letter)){
						wrongLGuess();
						return;
					}
					// Check if letter is first or last from word (the visible ones)
					if(letter == this.currentWord.answer[0] || letter == this.currentWord.answer[this.currentWord.answer.length-1]){
						wrongLGuess();
						return;
					}
					var matchingIndexes = [];
					matchingIndexes.push(this.currentWord.answer.indexOf(letter));
					var i=0;
					do {
						matchingIndexes.push(this.currentWord.answer.indexOf(letter, matchingIndexes[i]+1));
						i++;
					}
					while (matchingIndexes[i] !==-1);

					// Remove last -1
					matchingIndexes.pop();
					if(-1 !== matchingIndexes[0]) {
						foundMatches.push(letter);
						console.log('Match Found!');
						this.stats.guessedLetters += matchingIndexes.length;
					}
					else {
						wrongLGuess();
						console.log('No match!');
					}
				};
			}
		})
		.component('wordComponent', {
			templateUrl: 'ng-templates/template-word-component.html',
			bindings: {
				wordObject: '<'
			},
			controller: function(){
			}
		})
		.component('scribbleComponent', {
			templateUrl: 'ng-templates/template-scribble-component.html',
			bindings: {
				answer: '<'
			},
			controller: function(){
				this.scribble = this.answer.split('');
			}
		})
		.component('letterGuess', {
			templateUrl: 'ng-templates/template-letter-guess.html',
			bindings: {
				letterCheck: '&'
			},
			controller: function(){
				this.guessCounter = 5;
				this.preLetterCheck = function(){
					if(this.letter.length == 1){
						this.letterCheck({letter: this.letter});
						this.guessCounter--;
					}
				};
			}
		})
		.component('stats', {
			templateUrl: 'ng-templates/template-stats.html',
			bindings: {
				stats: '<'
			},
			controller: function(){
			}
		});

		hangmanApp.factory('conundrums', function($http){
			return {
				getData: function(callback){
					$http.get('data/data.json').success(callback);
				}
			};
		});
		hangmanApp.filter('singleOrNot', function() {
			return function(input, multiplayer) {
				input = input || '';
				var out = '';
				if (!multiplayer) {
					out = 'Multiplayer';
				}
				else {
					out = 'Singleplayer';
				}
				return out;
			};
		})
		hangmanApp.controller('HangmanParentController', function ($scope, conundrums){
			var completeData;
			$scope.categories = [];
			$scope.multiplayer = false;
			$scope.numOfWords = 0;
			$scope.numOfPlayers = 0;
			$scope.missingNumbers = false;
			$scope.startGameState = true;
			conundrums.getData(function(data) {
				completeData = data;
				$scope.categories = Object.keys(data);
			});

			$scope.setCategory = function(cat){
				$scope.category = cat;
			};
			$scope.setNumOfWords = function(event){
				$scope.numOfWords = event.target.valueAsNumber;
			};
			$scope.setNumOfPlayers = function(event){
				$scope.numOfPlayers = event.target.valueAsNumber;
			};
			$scope.startGame = function(){
				if(this.multiplayer){
					if(this.numOfWords === 0 || this.numOfPlayers === 0){
						this.missingNumbers = true;
						return;
					}
					else {
						this.missingNumbers = false;
					}
				}
				this.selectedData = completeData[this.category];
				this.startGameState = false;
			}
		});
		hangmanApp.directive('categoryButton', function() {
			return {
				restrict: 'E',
				scope: {
					key: '=',
					onClick: '&'
				},
				require: '^^newGame',
				replace: true,
				template: '<button class="btn">{{key}}</button>',
				link: function(scope, element, attrs, parentCtrl){
					element.on('click', function(){
						element.parent().children().removeClass('btn-primary');
						element.addClass('btn-primary');
						parentCtrl.setCategory({category: scope.key});
					});
				}
			};
		});

		angular.bootstrap(document, ['hangmanApp']);
	};
})();