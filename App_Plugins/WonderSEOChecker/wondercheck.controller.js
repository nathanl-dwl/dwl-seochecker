angular.module("umbraco").factory("UrlService", function (editorState, $q) {
  return {
      getCurrentUrl: function () {
        //async promise for fetching the url related to the back-office page
          var deferred = $q.defer();
      //retrieving the back-office page's node and all urls associated with it
      var currentNode = editorState.getCurrent();
      var allUrls = currentNode.urls;
      //checking if any urls are available and initialising url variable if so
      if (allUrls && allUrls.length > 0) {
        var url = "";
        //if there is only one url, it's text value is assigned to the variable
        if (allUrls.length === 1) {
          url = allUrls[0].text;
        } else {
            //checks if there are multiple regions for urls, assigns a matchingUrl variable if the back-office node and url culture are a match, the matching url then becomes the url variable
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
        //appending the relative url with the location protocol and host to create an absolute url for the api to analyse
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = window.location.protocol + "//" + window.location.host + url;
        }
        //resolving the promise and passing the successfully constructed url variable
        deferred.resolve(url);
      } else {
        console.error("No URLs found.");
        deferred.reject("No URLs found.");
      }
      //returning the promise object for use of .then in the next function
      return deferred.promise;
    },
  };
});

angular
  .module("umbraco")
  .factory("PageSpeedService", function ($http, editorState, $q, UrlService) {
    return {
        runPageSpeedTest: function () {
          //defining the lighthouse api
        const api =
          "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

          //running the previous function to obtain the url variable
            return UrlService.getCurrentUrl().then(function (currentUrl) {
            //$http provides HTTP methods get, post, put etc.
                return $http
          //defining the url to be analysed and setting the categories
            .get(api, {
              params: {
                url: currentUrl,
                category: ["seo", "performance"],
              },
            })
            //returning the response in json format
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
      //function to be called on click
      vm.runPageSpeed = function ($event) {
        $event.preventDefault();
        vm.loading = true;

        vm.pageSpeedResult = null;
        vm.errorMessage = null;
        //earlier function is called and values are assigned to the vm variable to allow for use in the .html angular file
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
      //fetches the current url for display on the front end (currently not in use)
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
                //parser created to view response data from url variable as a text/html doc
                var parser = new DOMParser();
                var doc = parser.parseFromString(response.data, "text/html");
                //meta description and title selected from the parsed doc, truncated version of metadescription created for web preview section
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
                //ensure these variables are correctly updated for use in UI outside of function scope
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
