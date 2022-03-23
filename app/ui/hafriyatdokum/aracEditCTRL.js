app.controller(
    "AracEditCtrl", 
  function ($scope, $localStorage, $modalInstance, $modal, parameter, kendoExt, $log, $timeout, SweetAlert) {
    var firmaid;
    var aracid;
  
    $scope.onlyNumbers = function (text, type) {
      if ($scope.ilid != 1) {
        text = text.replace(/[^0-9]/g, '');
  
        if (type == 1)
          $scope.arac.Dara = text;
        else
          $scope.arac.Kapasitesi = text;
      }
    }
  
    $scope.ilid = $localStorage.user.ilid;
    $scope.AracTakipZorunlu = true;
  
    $scope.arac = {
      AracDurumId: 1,
      AracCinsiId: 30,
      MarkaId: 3,
      FirmaId: null
    }
  
    if (parameter.tur == "aracid") {
      aracid = parameter.id;
      firmaid = 0;
    }
  
    if (parameter.tur == "firmaid") {
      firmaid = parameter.id;
      aracid = 0;
    }
  
    if (parameter.tur == "firmaid") {
      $timeout(function () {
        $scope.firma_disabled = true;
        $scope.arac.FirmaId = firmaid;
      }, 500);
    } else
      $scope.firma_disabled = false;
  
  
    var urls = [
      "/Api/FirmaListesiKamuMini?BuyukSehirId=1",
    ]
  
  
    kendoExt.Get$q(urls, function (response) {
  
      $scope.dsFirma = kendoExt.ConvertToDataSource(response[0].data);
  
  
    });
  
  
    $scope.Kaydet = function () {
      var isValidate = true;
      if ($scope.arac == undefined) {
        $scope.ShowMessage("warning", "Uyarı", "Plaka no giriniz.");
        isValidate = false;
      }
      if ($scope.arac.Dara == null) {
        $scope.ShowMessage("warning", "Uyarı", "Dara giriniz.");
        isValidate = false;
      }
      if ($scope.arac.PlakaNo == null) {
        $scope.ShowMessage("warning", "Uyarı", "Plaka no giriniz.");
        isValidate = false;
      }
      if ($scope.arac.MarkaId == null) {
        $scope.ShowMessage("warning", "Uyarı", "Araç markası seçiniz.");
        isValidate = false;
      }
  
      if ($scope.arac.FirmaId == null || $scope.arac.FirmaId == undefined || $scope.arac.FirmaId == 0) {
        $scope.ShowMessage("warning", "Uyarı", "Firma seçiniz.");
        isValidate = false;
      }
  
      if ($scope.arac.AracCinsiId == null || $scope.arac.AracCinsiId == "" || $scope.arac.AracCinsiId == undefined) {
        $scope.ShowMessage("warning", "Uyarı", "Araç cinsi seçiniz.");
        isValidate = false;
      }
      if ($localStorage.user.ilid == 6 && $scope.arac.AracCinsiId == 30 && ($scope.arac.HGSEtiketNo == null || $scope.arac.HGSEtiketNo == "" || $scope.arac.AracCinsiId == undefined)) {
        $scope.ShowMessage("warning", "Uyarı", "HGS Etiket No giriniz.");
        isValidate = false;
      }
      if ($localStorage.user.ilid == 6 && $scope.hgs == true) {
        $scope.ShowMessage("warning", "Uyarı", "Lütfen geçerli bir HGS Etiket No giriniz.");
        isValidate = false;
      }
  
      if (!isValidate) return;
  
      $scope.arac.BuyukSehirId = 1;
      $scope.arac.CreateUser = $localStorage.user.userid;
  
      if (aracid == 0) {
        kendoExt.post("/Api/Arac", $scope.arac, function (response) {
          if (response.data == "") {
            Notiflix.Notify.success("Kaydedildi.");
            $modalInstance.close('reload');
          }
        });
      }
    };
  
    $scope.Iptal = function () {
      $modalInstance.dismiss('cancel');
    };
  
  
    $scope.HGSEtiketCtrl = function () {
  
      if ($scope.arac.HGSEtiketNo != null && $scope.arac.HGSEtiketNo != "")
        kendoExt.Get("/api/HGSEtiketNoKontrol?HGSEtiketNo=" + $scope.arac.HGSEtiketNo,
          function (response) {
            if (response.data != "") {
              $scope.hgs = true;
              SweetAlert.swal("Bu HGS Etiketi Kullanılmaktadır!", $scope.arac.HGSEtiketNo + " nolu etiket " + response.data + " plakalı araçta kullanılmaktadır.", "error");
            }
            else
              $scope.hgs = false;
          });
  
    };
  
    $scope.PlakaEntry = function (e) {
      var y = String.fromCharCode(e.keyCode);
  
      var transformedInput = y.replace(/[^0-9]/g, '');
      //if (transformedInput == "") {
      //    $scope.arac.PlakaNo = $scope.arac.PlakaNo.substring(0, $scope.arac.PlakaNo.length - 1);
      //    $scope.arac.PlakaNo = $scope.arac.PlakaNo + " " + y;
      //}
    };
  
    $scope.ShowMessage = function (type, title, text) {
      Notiflix.Notify.warning(text);
    }
  
  });