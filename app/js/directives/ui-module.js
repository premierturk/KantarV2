angular.module('app')
  .directive('uiModule', ['MODULE_CONFIG', 'uiLoad', '$compile', function (MODULE_CONFIG, uiLoad, $compile) {
    return {
      restrict: 'A',
      compile: function (el, attrs) {
        var contents = el.contents().clone();
        return function (scope, el, attrs) {
          el.contents().remove();
          uiLoad.load(MODULE_CONFIG[attrs.uiModule])
            .then(function () {
              $compile(contents)(scope, function (clonedElement, scope) {
                el.append(clonedElement);
              });
            });
        }
      }
    };
  }]);


angular.module('app')
  .directive('myMaxlength', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        var maxlength = Number(attrs.myMaxlength);
        function fromUser(text) {
          if (text.length > maxlength) {
            var transformedInput = text.substring(0, maxlength);
            ngModelCtrl.$setViewValue(transformedInput);
            ngModelCtrl.$render();
            return transformedInput;
          }
          return text;
        }
        ngModelCtrl.$parsers.push(fromUser);
      }
    };
  });

angular.module('app')
  .directive('capitalize', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, modelCtrl) {
        var capitalize = function (inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            // see where the cursor is before the update so that we can set it back
            var selection = element[0].selectionStart;
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
            // set back the cursor after rendering
            element[0].selectionStart = selection;
            element[0].selectionEnd = selection;
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  });