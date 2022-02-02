//'use strict';

/**
 * 0.1.1
 * Deferred load js/css file, used for ui-jq.js and Lazy Loading.
 *
 * @ flatfull.com All Rights Reserved.
 * Author url: http://themeforest.net/user/flatfull
 */

angular
  .module("ui.load", [])
  .service("uiLoad", [
    "$document",
    "$q",
    "$timeout",
    function ($document, $q, $timeout) {
      var loaded = [];
      var promise = false;
      var deferred = $q.defer();

      /**
       * Chain loads the given sources
       * @param srcs array, script or css
       * @returns {*} Promise that will be resolved once the sources has been loaded.
       */
      this.load = function (srcs) {
        srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
        var self = this;
        if (!promise) {
          promise = deferred.promise;
        }
        angular.forEach(srcs, function (src) {
          promise = promise.then(function () {
            return src.indexOf(".css") >= 0
              ? self.loadCSS(src)
              : self.loadScript(src);
          });
        });
        deferred.resolve();
        return promise;
      };

      /**
       * Dynamically loads the given script
       * @param src The url of the script to load dynamically
       * @returns {*} Promise that will be resolved once the script has been loaded.
       */
      this.loadScript = function (src) {
        if (loaded[src]) return loaded[src].promise;

        var deferred = $q.defer();
        var script = $document[0].createElement("script");
        script.src = src;
        script.onload = function (e) {
          $timeout(function () {
            deferred.resolve(e);
          });
        };
        script.onerror = function (e) {
          $timeout(function () {
            deferred.reject(e);
          });
        };
        $document[0].body.appendChild(script);
        loaded[src] = deferred;

        return deferred.promise;
      };

      /**
       * Dynamically loads the given CSS file
       * @param href The url of the CSS to load dynamically
       * @returns {*} Promise that will be resolved once the CSS file has been loaded.
       */
      this.loadCSS = function (href) {
        if (loaded[href]) return loaded[href].promise;

        var deferred = $q.defer();
        var style = $document[0].createElement("link");
        style.rel = "stylesheet";
        style.type = "text/css";
        style.href = href;
        style.onload = function (e) {
          $timeout(function () {
            deferred.resolve(e);
          });
        };
        style.onerror = function (e) {
          $timeout(function () {
            deferred.reject(e);
          });
        };
        $document[0].head.appendChild(style);
        loaded[href] = deferred;

        return deferred.promise;
      };
    },
  ])
  .service(
    "kendoExt",
    function (
      $state,
      $window,
      $http,
      $log,
      SweetAlert,
      $timeout,
      $linq,
      $sessionStorage,
      $q,
      $localStorage,
      $rootScope
    ) {
      var authorization = function () {
        if (!angular.isDefined($localStorage.user)) {
          $rootScope.login();
          return false;
        }

        return true;
      };

      $sessionStorage.history = [];
      var addSessionHistory = function (url, type) {
        var islem = $linq
          .Enumerable()
          .From($sessionStorage.history)
          .Where(function (x) {
            return (
              x.url === url &&
              (x.response === null || moment(x.request).add(3, "s") > moment())
            );
          })
          .FirstOrDefault();

        if (islem != null) {
          Notiflix.Notify.failure('Bir önceki işlemin bitmesini bekleyiniz!');
          console.log("Bir önceki işlemin bitmesini bekleyiniz!");

          return null;
        }

        var d = {
          url: url,
          type: type,
          request: moment().format("YYYY-MM-DD HH:mm:ss"),
          response: null,
          success: false,
          error: false,
        };

        $sessionStorage.history.push(d);

        return d;
      };
      var successSessionHistory = function (history) {
        history.response = moment().format("YYYY-MM-DD HH:mm:ss");
        history.success = true;
      };
      var errorSessionHistory = function (history) {
        history.response = moment().format("YYYY-MM-DD HH:mm:ss");
        history.error = true;
      };
      var ShowToast = function (text) {
        SweetAlert.swal("", text, "error");
      };

      this.getDs = function (url, error) {
        url = $rootScope.app.options.WebApiUrl + url;

        var dataSource = new kendo.data.DataSource({
          transport: {
            read: {
              url: url,
              beforeSend: function (req) {
                if (angular.isDefined($localStorage.user))
                  req.setRequestHeader(
                    "Authorization",
                    "Basic " + $localStorage.user.authtoken
                  );
              },
            },
          },
          error: function (e) {
            if (e.errorThrown == "Unauthorized") $rootScope.login();
            else
              SweetAlert.swal(
                "Hata oluştu",
                "Sistem yöneticinizle görüşünüz.",
                "error"
              );
          },
        });

        return dataSource;
      };

      this.datasource = function (
        url,
        columns,
        onChange,
        onDataBound,
        onDataBinding,
        agg
      ) {
        url = $rootScope.app.options.WebApiUrl + url;

        var result = {
          //toolbar: ["excel", "pdf"],
          excel: {
            fileName: "HYBS.xlsx",
            allPages: true,
            filterable: true,
          },
          dataSource: {
            //type: "json",
            transport: {
              read: {
                url: url,
                type: "GET",
                beforeSend: function (req) {
                  if (angular.isDefined($localStorage.user))
                    req.setRequestHeader(
                      "Authorization",
                      "Basic " + $localStorage.user.authtoken
                    );
                },
              },
              parameterMap: function (data, type) {
                if (type == "read") {
                  return data;
                }
              },
            },
            pageSize: 50,
            error: function (e) {
              if (e.errorThrown == "Unauthorized") $rootScope.login();
              else
                SweetAlert.swal(
                  "Hata oluştu",
                  "Sistem yöneticinizle görüşünüz.",
                  "error"
                );
            },
            aggregate: agg,
            serverPaging: false,
            serverFiltering: false,
            serverSorting: false,
          },

          excel: {
            filterable: false,
            allPages: true,
            fileName: "Export.xlsx",
          },
          pdf: {
            allPages: true,
          },
          columnMenu: true,
          //filterable: false,
          height: $(window).height() - 100,
          filterable: {
            mode: "row",
            extra: false,
            //operators: {
            //    string: {
            //        contains: "Contains"
            //    }
            //}
          },
          change: onChange,
          dataBound: function (e) {
            // for (var i = 0; i < this.columns.length; i++)
            //     this.autoFitColumn(i);

            if (typeof onDataBound === "function") onDataBound(e, this.table);

            ColShowHide(e);
          },
          dataBinding: onDataBinding,
          scrollable: {
            virtual: true,
          },
          navigatable: true,
          selectable: "row",
          resizable: true,
          sortable: true,
          groupable: false,
          pageable: true,
          pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5,
          },
          columns: columns,
        };

        return result;
      };

      this.datasourceSF = function (
        url,
        columns,
        onChange,
        onDataBound,
        onDataBinding,
        agg,
        sort
      ) {
        url = $rootScope.app.options.WebApiUrl + url;

        var result = {
          dataSource: {
            transport: {
              read: {
                dataType: "json",
                url: url,
                type: "POST",
                beforeSend: function (req) {
                  req.setRequestHeader(
                    "Authorization",
                    "Basic " + user.authtoken
                  );
                },
              },
              parameterMap: function (data, type) {
                if (type == "read") {
                  if (data.filter) {
                    angular.forEach(data.filter.filters, function (val, key) {
                      if (
                        moment(val.value, "yyyy-MM-dd HH:mm:ss", true).isValid()
                      ) {
                        var d = new Date(val.value);
                        val.value = kendo.toString(d, "yyyy-MM-dd HH:mm:ss");
                      }
                    });
                  }

                  return data;
                }
              },
            },
            pageSize: 50,
            error: function (e) {
              if (e.errorThrown == "Unauthorized") $rootScope.login();
            },
            aggregate: agg,
            sort: sort,
            serverPaging: true,
            serverFiltering: true,
            serverSorting: true,
            schema: {
              data: "Data",
              total: "Count",
            },
          },
          excel: {
            filterable: true,
            allPages: true,
            fileName: "Export.xlsx",
          },
          pdf: {
            allPages: true,
          },
          columnMenu: true,
          filterable: {
            mode: "row",
            extra: false,
            //operators: {
            //    string: {
            //        contains: "Contains"
            //    }
            //}
          },
          height: $(window).height() - 200,
          change: onChange,
          dataBound: function (e) {
            ColShowHide(e);

            if (typeof onDataBound === "function") onDataBound(e, this.table);
          },
          dataBinding: onDataBinding,
          scrollable: {
            virtual: true,
          },
          navigatable: true,
          selectable: "row",
          resizable: true,
          sortable: true,
          groupable: true,
          pageable: true,
          pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5,
          },
          columns: columns,
        };

        return result;
      };

      this.ddloptions = function (
        url,
        placeholder,
        dataTextField,
        dataValueField,
        change,
        error,
        dataBound
      ) {
        url = $rootScope.app.options.WebApiUrl + url;

        var selectOptions = {
          placeholder: placeholder,
          dataTextField: dataTextField,
          dataValueField: dataValueField,
          change: function (e) {
            if (typeof change === "function") {
              change(e);
            }
          },
          dataBound: function (e) {
            if (typeof dataBound === "function") dataBound(e);
          },
          dataSource: {
            transport: {
              read: {
                url: url,
                beforeSend: function (req) {
                  req.setRequestHeader(
                    "Authorization",
                    "Basic " + user.authtoken
                  );
                },
              },
            },
            error: function (e) {
              if (e.errorThrown == "Unauthorized") $rootScope.login();
              else if (typeof error === "function") {
                error(e);
              }
            },
          },
        };

        return selectOptions;
      };

      this.Get = function (url, callback) {
        url = $rootScope.app.options.WebApiUrl + url;

        if (typeof callback === "function") {
          $http.get(url).then(
            function (response) {
              callback(response);
            },
            function (errorPl) {
              swal.close();
              $log.info(errorPl);
              if (errorPl.status == "401") $rootScope.login();
            }
          );
        }
      };

      this.post = function (url, data, success, error) {
        authorization();

        url = $rootScope.app.options.WebApiUrl + url;

        if (typeof success != "function") {
          return;
        }
        var history = addSessionHistory(url, "POST");
        if (history == null) return;

        // Notiflix.Loading.standard();

        $http({
          method: "POST",
          url: url,
          data: data,
        }).then(
          function (response) {
            successSessionHistory(history);
            //Notiflix.Loading.remove();

            $timeout(function () {
              success(response);
            }, 200);
          },
          function (errorPl) {
            //Notiflix.Loading.remove();
            errorSessionHistory(history);
            $log.info(errorPl);

            if (typeof error == "function") {
              error(errorPl);
            } else SweetAlert.swal("Kaydedilemedi", errorPl.data, "error");

            if (errorPl.status == "401") $rootScope.login();

            
          }
        );
      };

      this.put = function (url, data, success) {
        authorization();

        url = $rootScope.app.options.WebApiUrl + url;

        if (typeof success != "function") {
          return;
        }

        var history = addSessionHistory(url, "PUT");
        if (history == null) return;

        Notiflix.Loading.Standard("Yükleniyor...");

        $http({
          method: "PUT",
          url: url,
          data: data,
        }).then(
          function (response) {
            successSessionHistory(history);
            Notiflix.Loading.remove();
            Notiflix.Notify.Success("Kaydedildi");

            $timeout(function () {
              success(response);
            }, 200);
          },
          function (errorPl) {
            Notiflix.Loading.remove();
            errorSessionHistory(history);
            $log.info(errorPl);
            SweetAlert.swal("Kaydedilemedi", errorPl.data, "error");
          }
        );
      };

      this.delete = function (url, success) {
        authorization();

        url = $rootScope.app.options.WebApiUrl + url;

        if (typeof success != "function") {
          return;
        }

        var history = addSessionHistory(url, "PUT");
        if (history == null) return;

        SweetAlert.swal({
          title: "...",
          text: "Siliniyor",
          imageUrl: "/HYS/img/loading.gif",
          showConfirmButton: false,
        });

        $http({
          method: "DELETE",
          url: url,
        }).then(
          function (response) {
            successSessionHistory(history);
            SweetAlert.basarili(function () {
              swal.close();

              $timeout(function () {
                success(response);
              }, 200);
            });
          },
          function (errorPl) {
            errorSessionHistory(history);
            $log.info(errorPl);
            SweetAlert.swal("Silinemedi", errorPl.data, "error");
          }
        );
      };

      this.Get$q = function (urls, callback) {
        if (typeof callback === "function") {
          var promises = [];
          angular.forEach(urls, function (url) {
            url = $rootScope.app.options.WebApiUrl + url;

            promises.push($http.get(url));
          });

          $q.all(promises).then(function (response) {
            callback(response);
          });
        }
      };

      this.ConvertToDataSource = function (data) {
        var dataSource = new kendo.data.DataSource({
          data: data,
        });

        return dataSource;
      };

      this.ConvertToOptions = function (
        data,
        placeholder,
        dataTextField,
        dataValueField,
        change,
        error,
        dataBound
      ) {
        var selectOptions = {
          placeholder: placeholder,
          dataTextField: dataTextField,
          dataValueField: dataValueField,
          change: function (e) {
            if (typeof change === "function") {
              change(e);
            }
          },
          dataBound: function (e) {
            if (typeof dataBound === "function") dataBound(e);
          },
          dataSource: this.ConvertToDataSource(data),
        };

        return selectOptions;
      };

      function ColShowHide(e) {
        var kendoGrid = e.sender;

        if ($localStorage.columnChose != undefined) {
          angular.forEach(kendoGrid.columns, function (item, key) {
            if (item.columns)
              angular.forEach(item.columns, function (itemSub, keySub) {
                var col = $linq
                  .Enumerable()
                  .From($localStorage.columnChose)
                  .Where(function (x) {
                    return (
                      x.state == $state.current.name &&
                      x.column == itemSub.field
                    );
                  })
                  .FirstOrDefault();

                if (col == null) return;
                if (col.isshow) kendoGrid.showColumn(itemSub.field);
                else kendoGrid.hideColumn(itemSub.field);
              });
            else {
              var col = $linq
                .Enumerable()
                .From($localStorage.columnChose)
                .Where(function (x) {
                  return (
                    x.state == $state.current.name && x.column == item.field
                  );
                })
                .FirstOrDefault();

              if (col == null) return;
              if (col.isshow) kendoGrid.showColumn(item.field);
              else kendoGrid.hideColumn(item.field);
            }
          });
        }

        $rootScope.colums = angular.copy(kendoGrid.columns);

        angular.forEach($rootScope.colums, function (value, key) {
          if (value.hidden == true) value.isShow = false;
          else value.isShow = true;

          angular.forEach(value.columns, function (valuesub, keysub) {
            if (valuesub.hidden == true) valuesub.isShow = false;
            else valuesub.isShow = true;
          });
        });

        $rootScope.changeColState = function (item) {
          if (item.isShow) kendoGrid.showColumn(item.field);
          else kendoGrid.hideColumn(item.field);

          if ($localStorage.columnChose == undefined)
            $localStorage.columnChose = [];

          var s = $linq
            .Enumerable()
            .From($localStorage.columnChose)
            .Where(function (x) {
              return x.state == $state.current.name && x.column == item.field;
            })
            .FirstOrDefault();

          if (s == null) {
            s = {
              state: $state.current.name,
              column: item.field,
              isshow: item.isShow,
            };
            $localStorage.columnChose.push(s);
          } else s.isshow = item.isShow;
        };

        $rootScope.$apply();
      }
    }
  );
