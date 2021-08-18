//'use strict';

app.controller('crudkullanici', function ($scope, $http, $modal, $log, $window, $stateParams, kendoExt, SweetAlert) {
    $scope.Hf = false;

    $scope.open = function (userid) {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'myModalContent.html',
            controller: 'kullaniciedit',
            size: 'lg',
            resolve: {
                userid: function () {
                    return userid;
                }
            }
        });

        modalInstance.result.then(function () {
            //$scope.detailGridOptions.dataSource.read();

            //toaster.pop("success", "Kaydedildi", "");
        });
    };

    var col =
        [
            {
                field: "UserName",
                title: "Kullanıcı Adı",
                attributes: { "style": "white-space:nowrap" }
            },
            {
                field: "NameLastName",
                title: "Adı Soyadı",
                attributes: { "style": "white-space:nowrap" },
                minScreenWidth: 600,
            }, {
                field: "Email",
                title: "Eposta",
                attributes: { "style": "white-space:nowrap" },
                minScreenWidth: 600,
            }, {
                field: "BelediyeAdi",
                title: "Belediye Adi",
                attributes: { "style": "white-space:nowrap" },
                minScreenWidth: 600,
            }, {
                field: "GSM",
                title: "GSM",
                minScreenWidth: 600,
            }, {
                field: "Active",
                title: "Aktif"
            }, {
                field: "HafriyatFirmasi",
                title: "Hafrt.Firm.",
                attributes: { "style": "white-space:nowrap" },
                minScreenWidth: 600,
            }, {
                field: "LastLoginDate",
                title: "Son Giris",
                type: "date",
                format: "{0:dd.MM.yyyy}",
                minScreenWidth: 600,
            }

        ];

    $scope.Filter = function () {
        var ops = kendoExt.datasource("/HYS.WebApi/Api/UserList?BuyuksehirId=" + user.buyuksehirid + "&HafriyatFirmasi=" + $scope.Hf,
            col,
            null, onDataBound, null);
        $("#grid").data("kendoGrid").setOptions(ops);
    };

    $scope.mainGridOptions = kendoExt.datasource("/HYS.WebApi/Api/UserList?BuyuksehirId=" + user.buyuksehirid + "&HafriyatFirmasi=" + $scope.Hf,
        col,
        null, onDataBound, null);

    function onDataBound(e, table) {
        var tableRows = $(table).find("tr");
        tableRows.each(function (index) {
            var row = $(this);
            var data = e.sender.dataItem(row);
            //row.removeClass("k-alt");

            if (data.Active == "Aktif")
                row.addClass("text-success dker");
            else
                row.addClass("text-danger  ");
        })
    }

    $scope.handleChange = function (data, dataItem, columns) {
        //$scope.data = data;
        //$scope.columns = columns;
        $scope.selecteduserid = dataItem.UserId;
        $scope.selectedNameLastName = dataItem.NameLastName;
    };

    $scope.sil = function (userid) {
        if (userid != undefined) {
            SweetAlert.swal({
                title: "Emin misiniz?",
                text: $scope.selectedNameLastName + " kullanıcısını silmek üzeresiniz!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55", confirmButtonText: "Evet, sil!",
                cancelButtonText: "Hayır, vazgeçtim!",
                closeOnConfirm: false,
                closeOnCancel: false,
                showLoaderOnConfirm: true
            },
                function (isConfirm) {
                    if (isConfirm) {
                        $http({
                            method: "DELETE",
                            url: "/HYS.WebApi/api/User?UserId=" + userid
                        }).then(function (response) {
                            SweetAlert.swal("Silindi!", "", "success");
                            $("#grid").data("kendoGrid").dataSource.read();
                        }, function (errorPl) {
                            $log.info(errorPl);
                        });
                    } else {
                        SweetAlert.swal("Vazgeçildi", "", "error");
                    }
                });
        }
    };

    $scope.excel = function () {
        $("#grid").getKendoGrid().saveAsExcel();
    };
});

app.controller('kullaniciedit', function ($scope, $http, $modalInstance, userid, kendoExt, SweetAlert, $linq, $log, $timeout) {


    if (userid != undefined) {
        $http.get("/HYS.WebApi/api/User?UserId=" + userid).then(
            function (response) {

                $timeout(function () {
                    $scope.u = response.data;
                }, 1000);

                

                $scope.dsIlceBelediye = kendoExt.getDs("/HYS.WebApi/api/IlceBelediye/List?BuyukSehirId=" + $scope.u.BuyukSehirId);
            },
            function (errorPl) {
                $log.info(errorPl);
            });

        $http.get("/HYS.WebApi/api/UserGrupList?UserId=" + userid).then(
            function (response) {
                $scope.ug = response.data;
            },
            function (errorPl) {
                $log.info(errorPl);
            });
    }
    else {
        $http.get("/HYS.WebApi/api/UserGrupList").then(
            function (response) {
                $scope.ug = response.data;
            },
            function (errorPl) {
                $log.info(errorPl);
            });
    }

    $scope.Kaydet = function () {
        if (!$scope.u.Active) {
            SweetAlert.swal("Kaydedilemedi.", "Kullanıcı aktif olmalı.", "error");
            return;
        }

        var enummerable = $linq.Enumerable()
            .From($scope.ug)
            .Where(function (x) {
                return x.IsSelected == true
            })
            .ToArray();

        if (enummerable.length == 0) {
            SweetAlert.swal("Kaydedilemedi.", "En az bir grup seçilmeli", "error");
            return;
        }

        var data = {
            u: $scope.u,
            ug: $scope.ug
        }

        if (userid == undefined) {
            //insert
            $http({
                method: "post",
                url: "/HYS.WebApi/Api/User",
                data: data
            }).then(function (response) {
                if (response.data == "") {
                    $modalInstance.dismiss('cancel');
                    $("#grid").data("kendoGrid").dataSource.read();
                } else
                    SweetAlert.swal("Kaydedilemedi.", response.data, "error");
            }, function (errorPl) {
                $log.info(errorPl);
            });
        } else {
            //update
            $http({
                method: "put",
                url: "/HYS.WebApi/Api/User",
                data: data
            }).then(function (response) {
                $modalInstance.dismiss('cancel');
                $("#grid").data("kendoGrid").dataSource.read();
            }, function (errorPl) {
                $log.info(errorPl);
            });
        }
    };

    $scope.Iptal = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.GrupSecimi = function (ug) {
        if (ug.UserGrupId == 8)
            if (ug.IsSelected)
                $scope.DAlaniShow = true
            else
                $scope.DAlaniShow = false
    };

    $scope.getIlceBelediye = function (BuyukSehirId) {
        $scope.dsIlceBelediye = kendoExt.getDs("/HYS.WebApi/api/IlceBelediye/List?BuyukSehirId=" + BuyukSehirId);
    }

    $scope.dsBuyuksehir = kendoExt.getDs("/HYS.WebApi/api/Buyuksehir/List");
    $scope.dsFirmaTipi = kendoExt.getDs("/HYS.WebApi/Api/Tanimlar/FirmaTipleri");
    $scope.dsDepolamaAlani = kendoExt.getDs("/HYS.WebApi/api/DepolamaListesiSecili");
});