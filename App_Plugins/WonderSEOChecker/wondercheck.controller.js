angular.module("umbraco").factory("UrlService", function (editorState, $q) {
  return {
    getCurrentUrl: function () {
      var deferred = $q.defer();
      var currentNode = editorState.getCurrent();
      var allUrls = currentNode.urls;

      if (allUrls && allUrls.length > 0) {
        var url = "";

        if (allUrls.length === 1) {
          url = allUrls[0].text;
        } else {
          var culture = currentNode.culture;
          var matchingUrl = allUrls.find(function (url) {
            return url.culture === culture;
          });
          if (matchingUrl) {
            url = matchingUrl.text;
          } else {
            console.error("Matching URL not found.");
            deferred.reject("Matching URL not found.");
          }
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = window.location.protocol + "//" + window.location.host + url;
        }

        deferred.resolve(url);
      } else {
        console.error("No URLs found.");
        deferred.reject("No URLs found.");
      }

      return deferred.promise;
    },
  };
});

angular
  .module("umbraco")
  .factory("PageSpeedService", function ($http, editorState, $q, UrlService) {
    return {
      runPageSpeedTest: function () {
        const api =
          "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

        return UrlService.getCurrentUrl().then(function (currentUrl) {
          return $http
            .get(api, {
              params: {
                url: currentUrl,
                category: ["seo", "performance"],
              },
            })
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              throw error;
            });
        });
      },
    };
  });

angular
  .module("umbraco")
  .controller(
    "My.WordCounterApp",
    function ($scope, $http, PageSpeedService, UrlService) {
      var vm = this;
      vm.loading = false;
      vm.metaDescription = "";
      vm.pageTitle = "";
      vm.pageError = false;

      vm.runPageSpeed = function ($event) {
        $event.preventDefault();
        vm.loading = true;

        vm.pageSpeedResult = null;
        vm.errorMessage = null;

        PageSpeedService.runPageSpeedTest()
          .then(function (pageSpeedResult) {
            vm.pageSpeedResult = pageSpeedResult;
            vm.parsedSpeedIndex = parseFloat(
              pageSpeedResult.lighthouseResult.audits["speed-index"]
                .displayValue
            );

            vm.loading = false;
          })
          .catch(function (error) {
            console.error("Error fetching PageSpeed data:", error);
            vm.errorMessage = "Failed to fetch PageSpeed data.";
            vm.loading = false;
            vm.pageError = false;

          });
      };

      vm.fetchCurrentUrl = function () {
        UrlService.getCurrentUrl()
          .then(function (url) {
            vm.currentUrl = url;
            return vm.fetchMetaDescriptionAndTitle(url);
          })
          .catch(function (error) {
            console.error("Error fetching current URL:", error);
            vm.pageError = false;
          });
      };

      vm.fetchMetaDescriptionAndTitle = function (url) {
        $http
            .get(url)
            .then(function (response) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(response.data, "text/html");
    
                var metaDescriptionTag = doc.querySelector(
                    "meta[name='description']"
                );
                if (metaDescriptionTag) {
                    var metaDescription = metaDescriptionTag.getAttribute("content");
                    vm.metaDescription = metaDescription;
                    vm.truncatedMetaDescription = truncateString(metaDescription, 160);
                } 
    
                var titleTag = doc.querySelector("title");
                if (titleTag) {
                    vm.pageTitle = titleTag.innerText;
                } 
    
                $scope.$apply();
            })
            .catch(function (error) {
                console.error("Error fetching page content:", error);
                vm.pageError = false;
            });
    };
    
    function truncateString(str, maxLength) {
        return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
    }
    

      angular.element(document).ready(function () {
        vm.fetchCurrentUrl();
      });
    }
  );
