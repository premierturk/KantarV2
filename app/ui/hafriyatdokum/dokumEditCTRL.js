app.controller("DokumEditCtrl", function ($scope, $localStorage, $modalInstance, $modal, kendoExt, $log, $timeout, SweetAlert, dokum) {
    angular.element(document).ready(function () {
        $scope.dokum = angular.copy(dokum);
        $scope.dokum.ChangeUser = $localStorage.user.userid;

        var urls = [
            "/Api/FirmaListesiMini?BuyukSehirId=1",
            "/api/kantar/PlakaListesiMini?FirmaId=" + $scope.dokum.FirmaId,
        ]

        if ($scope.dokum.BelgeNo == "NAKİT") {
            $scope.isEvselAtik = false;
            $scope.isNakitDokum = true;
        }
        else if ($scope.dokum.BelgeNo == "EVSELATIK") {
            $scope.isEvselAtik = true;
            $scope.isNakitDokum = false;
            urls[0] = "/Api/FirmaListesiCopMini?BuyukSehirId=1";
        }


        kendoExt.Get$q(urls, function (response) {
            $scope.dsFirma = kendoExt.ConvertToDataSource(response[0].data);
            $scope.dsPlaka = kendoExt.ConvertToDataSource(response[1].data);
        });

        $scope.Kaydet = function () {
            kendoExt.put("api/kantar/DokumDuzenle", $scope.dokum, function (response) {
                if (response) {
                    Notiflix.Notify.success("Kaydedildi.");
                    $modalInstance.close('reload');
                } else {
                    Notiflix.Notify.failure(response.data);
                }
            })
        }

        $scope.firmaDegisti = function () {
            if ($scope.dokum.FirmaId == undefined) return;

            var firmaId = $scope.dokum.FirmaId;
            //aynı firma seçildiyse 
            // yeni firma için plaka listesi
            var url = "/api/kantar/PlakaListesiMini?FirmaId=" + firmaId;

            kendoExt.Get$q([url], function (response) {
                $scope.dsPlaka = kendoExt.ConvertToDataSource(response[0].data);

                // firma değişince plakayı sıfırla
                $scope.dokum.PlakaNo = null;
            });
        };

        $scope.toplamTonajGuncelle = function () {
            //artırılan dara veya tonaj ile biriikte toplam tonajında artırılması
            if ($scope.isNakitDokum)
                $scope.dokum.Dara = $scope.dokum.Dara.replace(/[^0-9]/g, '');
            else if ($scope.isEvselAtik)
                $scope.dokum.Tonaj = $scope.dokum.Tonaj.replace(/[^0-9]/g, '');

            var dara = parseFloat($scope.dokum.Dara) || 0;
            var tonaj = parseFloat($scope.dokum.Tonaj) || 0;

            $scope.dokum.ToplamTonaj = dara + tonaj;
        }

        $scope.Iptal = function () {
            // back to starting value
            $scope.dokum = angular.copy(dokum);
            $modalInstance.close('cancel');
        };
    });
})