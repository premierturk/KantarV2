var TasimaKabuBelgesi = function (BelgeNo, kendoExt) {

    var data = {
        BelgeNo: BelgeNo
    };
    kendoExt.post("api/kantar/KabulBelgesiKontrol", data, function (response) {

        var data = response.data;


        if (data === null) {

            swal("Uyarı", "Hatalı belge no", "error");

            $scope.kabul.Temizle();

        } else {

            if (data.Aktif === false) {
                swal("Uyarı", "Belge aktif değil", "error");
                $scope.kabul.Temizle();
                return;
            }

            $scope.kabul.Response = response.data;

            $scope.kabul.Response.KalanMiktar = $scope.kabul.Response.TasinacakAtikMiktari - $scope.kabul.Response.DokumMiktari;


            //SAHA SEÇİMİ
            if ($localStorage.user.depolamaalani.Sahalar.length > 0) {
                var modalInstance = $modal.open({
                    keyboard: true,
                    animation: false,
                    templateUrl: 'sahaModal',
                    controller: 'sahaCtrl',
                    size: 'lg',
                    resolve: {
                        SahaListesi: function () {
                            return $localStorage.user.depolamaalani.Sahalar;
                        }
                    }
                });

                modalInstance.result.then(function (e) {
                    $scope.kabul.SahaId = e.DepolamaAlaniSahaId;
                });
            }

            if (!$localStorage.user.depolamaalani.OgsAktif) {
                var modalInstance = $modal.open({
                    keyboard: true,
                    animation: false,
                    templateUrl: 'araclarModal',
                    controller: 'plakasecCtrl',
                    size: 'lg',
                    resolve: {
                        PlakaListesi: function () {
                            return $scope.kabul.Response.Araclar;
                        }
                    }
                });

                modalInstance.result.then(function (e) {



                    $scope.kabul.PlakaNo = e.PlakaNo;
                    $scope.kabul.Dara = e.Dara;
                    $scope.kabul.AracId = e.AracId;

                    $scope.kabul.Hesapla();

                });
            }



        }



    })


}
