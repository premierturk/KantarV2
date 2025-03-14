﻿"use strict";
const electron = require("electron");
const net = require("net");
const _ = require("lodash");
const { base64encode, base64decode } = require("nodejs-base64");
const ab2str = require("arraybuffer-to-string");
const { ipcRenderer: ipc } = require("electron");
const JsonHuman = require("json.human");
const signalr = require("node-signalr");

app.controller(
  "hafriyatdokumlistCtrl",
  function (
    $scope,
    $rootScope,
    kendoExt,
    $linq,
    $timeout,
    $interval,
    $localStorage,
    $base64,
    $modal,
    $ocLazyLoad
  ) {
    $ocLazyLoad.load([
      "ui/hafriyatdokum/bariyerCTRL.js",
      "ui/hafriyatdokum/aracEditCTRL.js",
      "ui/hafriyatdokum/hgsCTRL.js",
      "ui/hafriyatdokum/sahaCTRL.js",
      "ui/hafriyatdokum/plakaSecCTRL.js",
    ]);

    ipc.send("app_version");

    ipc.on("app_version", (event, arg) => {
      ipc.removeAllListeners("app_version");
      Notiflix.Notify.success("Version " + arg.version);
      $("#pr_download_div").hide();
    });

    ipc.on("update_available", () => {
      ipc.removeAllListeners("update_available");
      Notiflix.Notify.info("Yeni versiyon indiriliyor...");
      $("#pr_download_div").show();
    });

    ipc.on("download-progress", (e, arg) => {
      console.log(arg.data);

      var percent = parseFloat(arg.data.percent).toFixed(2);

      $("#pr_download_text").html(percent.toString() + "% indirildi");
      $("#pr_download").attr("aria-valuenow", percent.toString());
      $("#pr_download").css({ width: percent + "%" });
    });

    ipc.on("update_downloaded", () => {
      ipc.removeAllListeners("update_downloaded");

      $("#pr_download_div").hide();

      Notiflix.Report.success(
        "Yeni veriyon indirildi",
        "Yeniden başlatmak için Tamam tıklayınız.",
        "Tamam",
        () => {
          ipc.send("restart_app");
        }
      );
    });

    $scope.online = true;
    window.addEventListener("online", function () {
      $scope.$apply(function () {
        $scope.online = true;
      });
    });
    window.addEventListener("offline", function () {
      $scope.$apply(function () {
        $scope.online = false;
      });
    });
    $(window).blur(function () {
      Notiflix.Loading.standard("UYGULAMA AKTİF DEĞİL");
    });
    $(window).focus(function () {
      Notiflix.Loading.remove(100);
    });

    if (!angular.isDefined($localStorage.user)) {
      $rootScope.login();
      return;
    }

    $scope.OgsAktif = $localStorage.user.depolamaalani.OgsAktif;

    var serialNum = 0;
    var mySerialPort = function (run) {
      var temp = [];
      ipc.on("comport", (event, data) => {
        // serialNum++;
        // console.log(serialNum + " - " + data + " --- " + ab2str(data))
        //console.log(data.toString('utf8', 0, 1));

        var d = ab2str(data);
        //console.log(d);

        if ($rootScope.app.options.Kantar == "YenikentCikis") {


          if (d.endsWith("\r") && d.startsWith("A")) {
            //d = d.replaceAll(" ", "");
            d = d.replace("\r", "");
            d = d.replace("A", "");
            //d = d.replace("B", "");
            //d = d.replace("C", "");
            //d = d.replace("D", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }


        } else if ($rootScope.app.options.Kantar == "YenikentGiris") {
          if (
            (data[0] == 2 && data[1] == 41) ||
            (data[0] == 2 && data[1] == 33)
          )
            temp = [];

          for (let i = 0; i < data.length; i++) temp.push(data[i]);

          if (
            ((temp[0] == 2 && temp[1] == 41) ||
              (temp[0] == 2 && temp[1] == 33)) &&
            temp[temp.length - 1] == 13
          ) {
            d = ab2str(temp);
            temp = [];
            var ddd = d.split(" ");
            if (ddd.length == 3) {
              var x = ddd[1];
              run(parseInt(x));
            }
          }
        } else if ($rootScope.app.options.Kantar == "IgdirGiris") {
          if (d.startsWith("A")) {
            //d = d.replaceAll(" ", "");
            d = d.replace("\r", "");
            d = d.replace("A", "");
            //d = d.replace("B", "");
            //d = d.replace("C", "");
            //d = d.replace("D", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "MudanyaAltintasGiris") {
          if (d.startsWith("A")) {
            //d = d.replaceAll(" ", "");
            d = d.replace("\r", "");
            d = d.replace("A", "");
            //d = d.replace("B", "");
            //d = d.replace("C", "");
            //d = d.replace("D", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "CihatliGiris") {
          if (
            data[0] == 2 &&
            data[1] == 121 &&
            data[2] == 112 &&
            data[3] == 48
          ) {
            //&& data[5] == 32
            temp = [];
            for (let i = 5; i < data.length; i++) temp.push(data[i]);

          } else if (data[0] != 13)
            for (let i = 0; i < data.length; i++) temp.push(data[i]);

          if (data[0] == 13) {
            d = ab2str(temp);
            d = d.trimLeft();
            var ddd = d.split(" ");
            if (ddd.length > 1) {
              var x = ddd[0];
              run(parseInt(x));
              temp = [];
            }
          }
        } else if ($rootScope.app.options.Kantar == "BurhaniyeGiris") {
          //WN002500 kg32
          if (d.startsWith("WN")) {
            d = d.replaceAll("WN", "");
            d = d.substring(0, 6);
            d = d.replaceAll(" ", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "BaskoyGiris") {
          if (data[0] == 65) {
            temp = [];
            for (let i = 0; i < data.length; i++) temp.push(data[i]);
          } else if (data[data.length - 1] == 13) {
            for (let i = 0; i < data.length; i++) temp.push(data[i]);

            d = ab2str(temp);

            temp = [];
            if (d.startsWith("A")) {
              //d = d.replaceAll(" ", "");
              d = d.replace("\r", "");
              d = d.replace("A", "");
              //d = d.replace("B", "");
              //d = d.replace("C", "");
              //d = d.replace("D", "");

              if (d != "") {
                var tonaj = parseInt(d);
                run(tonaj);
              }
            }
          }
        } else if ($rootScope.app.options.Kantar == "AkcalarGiris") {
          if (data[0] == 65 || data[0] == 66 || data[0] == 67) {
            temp = [];
            run(0);
          }

          if (data[0] == 65 && data[1] == 32) {
            temp = [];
            for (let i = 2; i < data.length; i++) temp.push(data[i]);
          } else if (temp.length > 0 && data[data.length - 1] == 13)
            for (let i = 0; i < data.length; i++) temp.push(data[i]);

          if (temp.length > 0 && data[data.length - 1] == 13) {
            d = ab2str(temp);
            temp = [];
            var ddd = d.replace(" ", "");
            var ddd = d.replace("\r", "");
            if (ddd.length > 1) {
              run(parseInt(ddd));
            }
          }
        } else if ($rootScope.app.options.Kantar == "CeriklerGiris") {
          if (d.startsWith("A")) {
            d = d.replace("\r", "");
            d = d.replace("A", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "KucukbalikliGiris") {
          if (d.startsWith("A")) {
            d = d.replace("\r", "");
            d = d.replace("A", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "MaksemPinarGiris") {
          if (d.startsWith("A")) {
            d = d.replace("\r", "");
            d = d.replace("A", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        } else if ($rootScope.app.options.Kantar == "Cataltepe") {
          if (d.startsWith("A")) {
            d = d.replace("\r", "");
            d = d.replace("A", "");
            d = d.replace(" ", "");

            if (d != "") {
              var tonaj = parseInt(d);
              run(tonaj);
            }
          }
        }
      });
    };

    var hub = "Bariyer";
    var signalr_client;
    var remote_bariyer = function (BariyerAdi) {
      signalr_client = new signalr.client(config.SignalR.host, [hub]);
      signalr_client.qs = { BariyerAdi: BariyerAdi };

      var opened = false;
      signalr_client.connection.hub.on(hub, "ac", (data) => {
        if (!opened) {
          Notiflix.Notify.info(data + " bariyeri açıldı");

          if (data == $rootScope.app.options.GirisCikis) {
            if (client_anten) client_anten.write("0100000111040D12CA\r");
          } else if (data == "yan_cikis") {
            if (client_anten_direk_cikis)
              client_anten_direk_cikis.write("0100000111040D12CA\r");
          }

          opened = true;

          setTimeout(function () {
            opened = false;
          }, 1000);
        }
      });

      signalr_client.on("connected", () => {
        console.log("SignalR client connected.");
      });

      signalr_client.on("error", (code, ex) => {
        console.log(`SignalR client connect error: ${code}.`);
      });

      signalr_client.start();
    };

    var client_anten_direk_cikis;
    var myTcp_Direk_Cikis = function (e) {
      var server = net.createServer(function (client) {
        client_anten_direk_cikis = client;
        console.log("Direk Cikis Client connect : ", client);

        remote_bariyer("yan_cikis");

        client.on("data", function (received) {
          if ($localStorage.user.ilid === 6) {
            //bursa
            if (received.length < 11) return;

            var hex1 = byteToHex(received[8]);
            var hex2 = byteToHex(received[9]);
            var hex3 = byteToHex(received[10]);
            var etiket = parseInt(hex1 + hex2 + hex3, 16);
            console.log(etiket);
            e(etiket);
          } else if ($localStorage.user.ilid === 1) {
            //kocaeli
            for (let i = 0; i < received.length; i++) {
              if (received[i] == 0x13) {
                if (received.Length < i + 3) return;
                var hex1 = byteToHex(received[i + 1]);
                var hex2 = byteToHex(received[i + 2]);
                var hex3 = byteToHex(received[i + 3]);

                var etiket = parseInt(hex1 + hex2 + hex3, 16);

                // console.log("TCP CLIENT MESSAGE :", etiket);

                e(etiket);
              }
            }
          } else if ($localStorage.user.ilid === 41) {
            //DİYARBAKIR
            for (let i = 0; i < received.length; i++) {
              if (received[i] == 0x13) {
                if (received.Length < i + 3) return;
                var hex1 = byteToHex(received[i + 1]);
                var hex2 = byteToHex(received[i + 2]);
                var hex3 = byteToHex(received[i + 3]);

                var etiket = parseInt(hex1 + hex2 + hex3, 16);

                // console.log("TCP CLIENT MESSAGE :", etiket);

                e(etiket);
              }
            }
          }
        });

        client.on("end", function () {
          // $scope.$apply(function () {
          //   $scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
          // });

          server.getConnections(function (err, count) {
            if (!err) {
              console.log("There are %d connections now. ", count);
            } else {
              console.error(JSON.stringify(err));
            }
          });
        });

        client.on("close", function () {
          // $scope.$apply(function () {
          //   $scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
          // });
        });

        window.setInterval(function () {
          client.write("0806F2\r");
        }, 5000);
      });

      server.listen($rootScope.app.options.TcpPortAntenCikis, function () {
        server.on("close", function () {
          console.log("TCP server socket is closed.");
          //$scope.AntenDurumu = "Anten Bağlantı Kapalı";
        });

        server.on("error", function (error) {
          console.error(JSON.stringify(error));
          //$scope.AntenDurumu = "Anten Bağlantı Hata";
        });
        console.log("TCP SERVER LISTEN:", server);

        //$scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
      });
    };

    var client_anten;
    var myTcp = function (e) {
      var server = net.createServer(function (client) {
        client_anten = client;
        console.log("Client connect : ", client);

        remote_bariyer($rootScope.app.options.GirisCikis);

        $scope.$apply(function () {
          $scope.AntenDurumu = "Anten Bağlandı";
        });

        client.on("data", function (received) {
          //console.log(received);

          if ($localStorage.user.ilid === 6) {
            //bursa
            if (received.length < 11) return;

            var hex1 = byteToHex(received[8]);
            var hex2 = byteToHex(received[9]);
            var hex3 = byteToHex(received[10]);
            var etiket = parseInt(hex1 + hex2 + hex3, 16);
            console.log(etiket);
            e(etiket);
          } else if ($localStorage.user.ilid === 1) {
            //kocaeli
            for (let i = 0; i < received.length; i++) {
              if (received[i] == 0x13) {
                if (received.Length < i + 3) return;
                var hex1 = byteToHex(received[i + 1]);
                var hex2 = byteToHex(received[i + 2]);
                var hex3 = byteToHex(received[i + 3]);

                var etiket = parseInt(hex1 + hex2 + hex3, 16);

                // console.log("TCP CLIENT MESSAGE :", etiket);

                e(etiket);
              }
            }
          } else if ($localStorage.user.ilid === 41) {
            //DİYARBAKIR
            for (let i = 0; i < received.length; i++) {
              if (received[i] == 0x13) {
                if (received.Length < i + 3) return;
                var hex1 = byteToHex(received[i + 1]);
                var hex2 = byteToHex(received[i + 2]);
                var hex3 = byteToHex(received[i + 3]);

                var etiket = parseInt(hex1 + hex2 + hex3, 16);

                // console.log("TCP CLIENT MESSAGE :", etiket);

                e(etiket);
              }
            }
          } else if ($localStorage.user.ilid === 81) {
            //düzce
            for (let i = 0; i < received.length; i++) {
              if (received[i] == 0x13) {
                if (received.Length < i + 3) return;
                var hex1 = byteToHex(received[i + 1]);
                var hex2 = byteToHex(received[i + 2]);
                var hex3 = byteToHex(received[i + 3]);

                var etiket = parseInt(hex1 + hex2 + hex3, 16);

                // console.log("TCP CLIENT MESSAGE :", etiket);

                e(etiket);
              }
            }
          }

          // Server send data back to client use client net.Socket object.
          //client.end('Server received data : ' + data + ', send back to client data size : ' + client.bytesWritten);
        });

        client.on("end", function () {
          console.log("Client disconnect.");

          $scope.$apply(function () {
            $scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
          });

          server.getConnections(function (err, count) {
            if (!err) {
              console.log("There are %d connections now. ", count);
            } else {
              console.error(JSON.stringify(err));
            }
          });
        });

        client.on("close", function () {
          console.log("Client close.");

          $scope.$apply(function () {
            $scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
          });
        });

        window.setInterval(function () {
          client.write("0806F2\r");
        }, 5000);
      });

      server.listen($rootScope.app.options.TcpPort, function () {
        server.on("close", function () {
          console.log("TCP server socket is closed.");
          $scope.AntenDurumu = "Anten Bağlantı Kapalı";
        });

        server.on("error", function (error) {
          console.error(JSON.stringify(error));
          $scope.AntenDurumu = "Anten Bağlantı Hata";
        });
        console.log("TCP SERVER LISTEN:", server);

        $scope.AntenDurumu = "Anten Bağlantı Bekleniyor";
      });
    };

    var birimfiyat = $localStorage.user.depolamaalani.BirimFiyat.find(function (
      item
    ) {
      return item.IlId == $localStorage.user.ilid;
    });

    if (!angular.isDefined(birimfiyat)) {
      Notiflix.Notify.warning("Birim fiyat tanımlaması yapınız.");
      return;
    }

    var aracListesiYukle = function () {
      // if ($localStorage.user.depolamaalani.OgsAktif) { }
      swal({
        title: "...",
        text: "Araç listesi yükleniyor",
        imageUrl: "./img/loading.gif",
        showConfirmButton: false,
      });
      kendoExt.Get("api/kantar/araclistesi?EtiketNo=", function (response) {
        $scope.TumAracListesi = response.data;
        swal.close();
      });
    };
    aracListesiYukle();

    $scope.AntenDurumu = "Anten Bağlı Değil";
    $scope.kabul = {
      Tur: "",
      BelgeNo: "",
      BarkodNo: "",
      AracId: null,
      FirmaId: null,
      AracCinsiId: null,
      AracCinsi: "",
      PlakaNo: "",
      Ogs: "",
      Tutar: 0,
      Tonaj: 0,
      Dara: 0,
      Kapasite: 0,
      Net: 0,
      IsDaraDegisimi: false,
      Hesapla: function () {
        if ($scope.kabul.AracId == null) return;

        if ($scope.kabul.Response.IsIlDisi)
          $scope.kabul.IlDisiBirimFiyat =
            $localStorage.user.depolamaalani.BirimFiyat.find(function (item) {
              return item.IlId == $scope.kabul.Response.IlDisiIlId;
            }).BirimFiyat;

        var bFiyat = $scope.kabul.BirimFiyat;
        if ($scope.kabul.Response.IsIlDisi)
          bFiyat = $scope.kabul.IlDisiBirimFiyat;

        $scope.kabul.Net = $scope.kabul.Tonaj - $scope.kabul.Dara;
        $scope.kabul.Tutar = $scope.kabul.Tonaj * bFiyat;

        if ($localStorage.user.depolamaalani.KantarVarMi == false) {
          var aracBirimFiyat = $localStorage.user.depolamaalani.AracFiyat.find(
            function (item) {
              return item.AracCinsiId == $scope.kabul.AracCinsiId;
            }
          );

          $scope.kabul.Net = parseInt(
            aracBirimFiyat.Fiyat / $scope.kabul.BirimFiyat
          );
          $scope.kabul.Tonaj = $scope.kabul.Net + $scope.kabul.Dara;
          $scope.kabul.Tutar = aracBirimFiyat.Fiyat;
        }

        if ($scope.kabul.Response.TasinacakAtikMiktari) {
          var indirim = $localStorage.user.depolamaalani.Indirim.find(function (
            item
          ) {
            return (
              $scope.kabul.Response.TasinacakAtikMiktari >= item.Mkup1 &&
              $scope.kabul.Response.TasinacakAtikMiktari <= item.Mkup2
            );
          });
          if (indirim)
            $scope.kabul.Tutar =
              $scope.kabul.Tutar - ($scope.kabul.Tutar * indirim.Yuzde) / 100;
        }
      },
      Temizle: function () {
        $scope.kabul.Response = {};
        $scope.kabul.Tur = "";
        $scope.kabul.BelgeNo = "";
        $scope.kabul.BarkodNo = "";
        $scope.kabul.AracId = null;
        $scope.kabul.FirmaId = null;
        $scope.kabul.AracCinsiId = null;
        $scope.kabul.AracCinsi = "";
        $scope.kabul.PlakaNo = "";
        $scope.kabul.Ogs = "";
        $scope.kabul.Tutar = 0;
        $scope.kabul.Tonaj = 0;
        $scope.kabul.Dara = 0;
        $scope.kabul.Net = 0;
        $scope.kabul.Kapasite = 0;
        $scope.kabul.IsDaraDegisimi = true;
        //$scope.kabul.BirimFiyat = 0
        $scope.kabul.IlDisiBirimFiyat = 0;
        $scope.kabul.SahaId = null;
        $scope.kabul.Tonaj = 0;
        tempEtiketNo = [];
        tempTonaj = [];
        tempSpark = [];
        $scope.readBarkod = "";
        $scope.i = 0;
        $scope.iOgs = 0;
      },
      UserId: $localStorage.user.userid,
      DepolamaAlaniId: $localStorage.user.depolamaalani.DepolamaAlanId,
      DepolamaAlaniAdi: $localStorage.user.depolamaalani.DepolamaAlanAdi,
      BirimFiyat: $localStorage.user.depolamaalani.BirimFiyat.find(function (
        item
      ) {
        return item.IlId == $localStorage.user.ilid;
      }).BirimFiyat,
      IlDisiBirimFiyat: 0,
      SahaId: null,
      Response: {},
    };

    $scope.$watch("kabul.BelgeNo", function (newValue, oldValue) {
      $scope.Kaydet();
    });

    $scope.$watch("kabul.AracId", function (newValue, oldValue) {
      $scope.Kaydet();
    });

    $scope.$watch("kabul.Tonaj", function (newValue, oldValue) {
      $scope.Kaydet();
    });

    $scope.$watch("kabul.SahaId", function (newValue, oldValue) {
      $scope.Kaydet();
    });

    $scope.$watch("kabul.DepolamaAlaniId", function (newValue, oldValue) {
      $scope.Kaydet();
    });

    var isSend = true;
    $scope.Kaydet = function () {
      if (!isSend) return;

      if (!angular.isDefined($localStorage.user)) {
        return;
      }

      var Tur = $scope.kabul.Tur;
      var BelgeNo = $scope.kabul.BelgeNo;
      var BarkodNo = $scope.kabul.BarkodNo;
      var AracId = $scope.kabul.AracId;
      var FirmaId = $scope.kabul.FirmaId;
      var Dara = $scope.kabul.Dara;
      var Tonaj = $scope.kabul.Tonaj;
      var DepolamaAlaniId = $scope.kabul.DepolamaAlaniId;
      var UserId = $scope.kabul.UserId;
      var SahaId = $scope.kabul.SahaId;

      if ($localStorage.user.depolamaalani.Sahalar.length > 0 && SahaId == null)
        return;

      if (
        $scope.kabul.AracId != null &&
        !(
          $scope.kabul.AracCinsiId == 30 ||
          $scope.kabul.AracCinsiId == 31 ||
          $scope.kabul.AracCinsiId == 32
        ) &&
        $scope.kabul.IsDaraDegisimi &&
        $rootScope.app.options.GirisCikis == "Giriş"
      ) {
        //hafriyat aracı ise dara güncellemesi
        Notiflix.Notify.warning(
          $scope.kabul.PlakaNo + " aracın dara bilgisini güncelleyiniz!"
        );
      }

      $scope.uyari = "";

      if (BelgeNo == "") {
        $scope.uyari = "Belge no okutunuz/giriniz!";
        return;
      }
      if (AracId == null) {
        $scope.uyari = "Plaka seçiniz!";
        return;
      }

      if (Tur != "SANAYİ ATIĞI")
        if (Dara == 0) {
          $scope.uyari = "Dara giriniz!";
          return;
        }

      if (Tonaj == 0) {
        $scope.uyari = "Kantar verisi bekleyiniz!";
        return;
      }

      if (Tonaj == null) {
        $scope.uyari = "Kantar verisi bekleyiniz!";
        return;
      }

      if (Tur != "SANAYİ ATIĞI")
        if (Tonaj <= Dara) {
          $scope.uyari = "Dara tonajdan küçük olamaz!";
          return;
        }

      console.log("Kaydet start...");

      var data = {
        AracId: AracId,
        FirmaId: FirmaId,
        Dara: Dara,
        SahaId: SahaId,
        UserId: UserId,
        BelgeNo: BelgeNo,
        BarkodNo: BarkodNo,
        DepolamaAlanId: DepolamaAlaniId,
        Tonaj: Tonaj,
        Tarih: new Date(),
        GirisCikis: $rootScope.app.options.GirisCikis,
      };

      console.log("kaydet start");

      if (data.GirisCikis == "Giriş") {
        //BELGE ONAY
        console.log("SAVING..." + JSON.stringify(data));

        kendoExt.post(
          "api/kantar/hafriyatkabul/KabulBelgesi",
          data,
          function (response) {
            isSend = false;
            requestSanayiAtikBelgesi = "";

            //ipc.send("port_restart");

            console.log("SAVING SUCCESS");
            $scope.kabul.Temizle();

            setTimeout(function () {
              $scope.kabul.Temizle();
              isSend = true;
            }, 1000);

            $scope.BariyerAc();

            Notiflix.Notify.success("Kaydedildi.");
            $scope.Filter();

            if ($rootScope.app.options.UsePrinter)
              ipc.send("onprint", response.data);
          },
          function (err) {
            requestSanayiAtikBelgesi = "";
            console.log("SAVING failure :");
            Notiflix.Notify.failure(err.data);
            $scope.kabul.Temizle();
            $scope.kabul.BelgeNo = "";
            $scope.kabul.BarkodNo = "";
          }
        );
      } else if (data.GirisCikis == "Çıkış") {
        console.log("SAVING..." + JSON.stringify(data));

        if (Tur == "SANAYİ ATIĞI") {
          kendoExt.post(
            "api/kantar/hafriyatkabul/SanayiAtikOnayla",
            data,
            function (response) {
              isSend = false;
              requestSanayiAtikBelgesi = "";

              ipc.send("port_restart");

              console.log("SAVING SUCCESS");

              setTimeout(function () {
                $scope.kabul.Temizle();
                isSend = true;
              }, 1000);

              $scope.BariyerAc();
              Notiflix.Notify.success("Kaydedildi.");

              $scope.Filter();

              if ($rootScope.app.options.UsePrinter)
                ipc.send("onprint", response.data);
            },
            function (err) {
              console.log("SAVING failure :");
              Notiflix.Notify.failure(err.data);
              requestSanayiAtikBelgesi = "";
              // $scope.kabul.Temizle();
              // $scope.kabul.BelgeNo = "";
              // $scope.kabul.BarkodNo = "";
            }
          );
        }
      }
    };

    var lastEtiketNo = "";
    var PlakaBul = function (EtiketNo) {
      if (EtiketNo == lastEtiketNo) return;

      lastEtiketNo = EtiketNo;

      setTimeout(function () {
        lastEtiketNo = "";
      }, 5000);

      kendoExt.Get(
        "api/kantar/araclistesi?EtiketNo=" + EtiketNo,
        function (response) {
          var arac = response.data;
          if (arac == null)
            Notiflix.Notify.warning("Tanımsız OGS ETiketi : " + EtiketNo);
          else AracBulundu(arac);
        }
      );
    };

    var tempEtiketNo = [];
    myTcp(function (data) {
      $scope.$apply(function () {
        if (
          data.toString().substring(0, 3) !=
          $rootScope.app.options.OgsEtiketStart
        )
          return;

        var number = parseInt(data);

        tempEtiketNo.push(number);
        $scope.iOgs = tempEtiketNo.length * 10;

        if (tempEtiketNo.length >= 10) {
          $scope.sonOgsSaati = Date.now();

          var gelen = $linq
            .Enumerable()
            .From(tempEtiketNo)
            .GroupBy("$", null, "{ EtiketNo: $, Count: $$.Count() }")
            .OrderByDescending(function (x) {
              return x.Count;
            })
            .FirstOrDefault();

          if (gelen.Count < 5) return;

          $scope.kabul.Ogs = gelen.EtiketNo;

          tempEtiketNo = [];

          //TODO:arac boş ise online sorgula
          if ($scope.TumAracListesi != null) {
            var arac = $scope.TumAracListesi.find(function (item) {
              return item.OGSEtiket == $scope.kabul.Ogs;
            });

            if (arac == null) {
              PlakaBul($scope.kabul.Ogs);
            } else AracBulundu(arac);
          } else {
            PlakaBul($scope.kabul.Ogs);
          }
          //$scope.kabul.AracId = null;
        }
      });
    });

    var tempEtiketNoDirekCikis = [];
    myTcp_Direk_Cikis(function (data) {
      $scope.$apply(function () {
        if (
          data.toString().substring(0, 3) !=
          $rootScope.app.options.OgsEtiketStart
        )
          return;

        var number = parseInt(data);

        tempEtiketNoDirekCikis.push(number);

        if (tempEtiketNoDirekCikis.length >= 50) {
          var gelen = $linq
            .Enumerable()
            .From(tempEtiketNoDirekCikis)
            .GroupBy("$", null, "{ EtiketNo: $, Count: $$.Count() }")
            .OrderByDescending(function (x) {
              return x.Count;
            })
            .FirstOrDefault();

          if (gelen.Count < 30) return;

          var etiket = gelen.EtiketNo;

          tempEtiketNoDirekCikis = [];

          if ($scope.TumAracListesi != null) {
            var arac = $scope.TumAracListesi.find(function (item) {
              return item.OGSEtiket == etiket;
            });
            if (arac != null) {
              if (client_anten_direk_cikis) {
                client_anten_direk_cikis.write("0100000111040D12CA\r");
                Notiflix.Notify.success("Cikiş bariyeri açıldı.");
              }
            }
          }
        }
      });
    });

    var AracBulundu = function (arac) {
      if ($scope.kabul.AracCinsiId == 30) {
        $scope.kabul.Tutar = 0;
        $scope.kabul.Tonaj = 0;
        $scope.kabul.Dara = 0;
        $scope.kabul.Net = 0;
        $scope.kabul.Kapasite = 0;
        $scope.readBarkod = "";
        $scope.i = 0;
        $scope.iOgs = 0;

        $scope.kabul.BarkodNo = "EVSELATIK";
        $scope.kabul.BelgeNo = "EVSELATIK";
        $scope.kabul.Tur = "EVSELATIK";
      }

      $scope.kabul.PlakaNo = arac.PlakaNo;
      $scope.kabul.Dara = arac.Dara;
      $scope.kabul.AracId = arac.AracId;
      $scope.kabul.AracCinsi = arac.AracCinsi;
      $scope.kabul.AracCinsiId = arac.AracCinsiId;
      $scope.kabul.Kapasite = arac.Kapasitesi;

      var GirisCikis = $rootScope.app.options.GirisCikis;

      // if (GirisCikis == "Çıkış") {
      //   if (client_anten) client_anten.write("0100000111040D12CA\r");

      //   return;
      // }

      if (GirisCikis == "Giris") {
        $scope.kabul.Hesapla();
        $scope.Kaydet();
      }
    };

    var OgsTemizle = function () {
      tempEtiketNo = [];

      $scope.$apply(function () {
        $scope.iOgs = 0;
        $scope.kabul.Ogs = "";

        $scope.kabul.Kapasite = "0";
        $scope.kabul.PlakaNo = "";
        $scope.kabul.Dara = 0;
        $scope.kabul.AracId = null;
        $scope.kabul.AracCinsi = "";
        $scope.kabul.AracCinsiId = null;
      });
    };

    $scope.readBarkod = "";
    $(window).bind("keypress", function (event) {
      console.log(event.key + " - " + event.keyCode);

      var key = event.key;

      if (event.keyCode == 42) key = "-";

      if (!(event.keyCode == 16 || event.keyCode == 13))
        $scope.readBarkod = $scope.readBarkod + key.toLowerCase();

      $scope.$apply();

      if (event.keyCode == 13) {
        $scope.readBarkod = $scope.readBarkod
          .replace("Alt", "")
          .replace("Control", "")
          .replace("QR", "")
          .replace("CapsLock", "")
          .replace("qr", "");

        console.log($scope.readBarkod);

        if (
          $scope.readBarkod.indexOf("ş") > -1 &&
          $scope.readBarkod.indexOf("-") > -1
        ) {
          //BURSA SANAYİ ATIK

          var belgeNo = $scope.readBarkod.split("ş")[0];
          $scope.$apply(function () {
            $scope.kabul.Tur = "SANAYİ ATIĞI";
            $scope.kabul.BarkodNo = angular.copy($scope.readBarkod);
            $scope.kabul.BelgeNo = angular.copy(belgeNo);
          });

          var belgeTar = parseInt($scope.readBarkod.split("ş")[2]);

          var tar = moment(belgeTar * 1000);
          var belgeTar = tar.toDate();
          var bitisTar = tar.add(2, "M").toDate();
          if (bitisTar < moment().toDate()) {
            swal("Uyarı", "Belgenin süresi dolmuştur.", "error");
            return;
          }

          SanayiAtikBelgesi(
            angular.copy($scope.readBarkod),
            angular.copy(belgeNo)
          );
        } else if (
          $scope.readBarkod.toUpperCase().indexOf("KF-") > -1 &&
          $scope.readBarkod.toUpperCase().indexOf("-KF") > -1
        ) {
          //KAMUFİŞ

          var belgeNo = $scope.readBarkod.toUpperCase().replace("KF-", "").replace("-KF", "");
          $scope.$apply(function () {
            $scope.kabul.Tur = "KAMU FİŞİ";
            $scope.kabul.BarkodNo = angular.copy($scope.readBarkod);
            $scope.kabul.BelgeNo = angular.copy(belgeNo);
          });

          KamuFisBelgesi(belgeNo);
        } else if (
          $scope.readBarkod.indexOf("a") > -1 &&
          $scope.readBarkod.indexOf("-") > -1
        ) {
          //KABUL BELGESİ

          var belgeNo = $scope.readBarkod.split("a")[1];
          TasimaKabuBelgesi(
            angular.copy($scope.readBarkod),
            angular.copy(belgeNo)
          );
        } else if ($scope.readBarkod.indexOf("a") > -1) {
          //NAKİT

          var belgeNo = $scope.readBarkod.split("a")[1];
          $scope.$apply(function () {
            $scope.kabul.Tur = "NAKİT DÖKÜM";
            $scope.kabul.BarkodNo = angular.copy($scope.readBarkod);
            $scope.kabul.BelgeNo = angular.copy(belgeNo);
          });

          NakitDokumBelgesi(
            angular.copy(belgeNo),
            angular.copy($scope.readBarkod)
          );
        } else if ($scope.readBarkod.indexOf("-") > -1) {
          //FİRMA BARKOD

          var belgeNo = $scope.readBarkod;
          TasimaKabuBelgesi(
            angular.copy($scope.readBarkod),
            angular.copy(belgeNo)
          );
        }

        $scope.readBarkod = "";
      }
    });

    $scope.Restart = function () {
      ipc.send("restart", true);
    };

    $scope.PlakaSec = function () {
      var modalInstance = $modal.open({
        keyboard: true,
        animation: false,
        templateUrl: "araclarModal",
        controller: "plakasecCtrl",
        size: "lg",
        resolve: {
          PlakaListesi: function () {
            return $scope.TumAracListesi;
          },
        },
      });

      modalInstance.result.then(function (e) {
        if ($scope.kabul.AracCinsiId == 30) {
          $scope.kabul.Tutar = 0;
          $scope.kabul.Tonaj = 0;
          $scope.kabul.Dara = 0;
          $scope.kabul.Net = 0;
          $scope.readBarkod = "";
          $scope.i = 0;
          $scope.iOgs = 0;

          $scope.kabul.BarkodNo = "EVSELATIK";
          $scope.kabul.BelgeNo = "EVSELATIK";
          $scope.kabul.Tur = "EVSELATIK";
        }

        $scope.kabul.PlakaNo = e.PlakaNo;
        $scope.kabul.Dara = e.Dara;
        $scope.kabul.AracId = e.AracId;
        $scope.kabul.AracCinsi = e.AracCinsi;
        $scope.kabul.AracCinsiId = e.AracCinsiId;
        $scope.kabul.IsDaraDegisimi = e.IsDaraDegisimi;

        $scope.kabul.Hesapla();
        $scope.Kaydet();
      });
    };

    var NakitDokumBelgesi = function (BelgeNo, Barkod) {
      var data = {
        BelgeNo: BelgeNo,
      };
      kendoExt.post("api/kantar/NakitDokumKontrol", data, function (response) {
        var data = response.data;

        if (data === null) {
          swal("Uyarı", "NakitDokumKontrol Hatalı belge no", "error");

          //$scope.kabul.Temizle();
        } else {
          if (data.Aktif === false) {
            swal("Uyarı", "Belge aktif değil", "error");
            //$scope.kabul.Temizle();
            return;
          }

          $scope.kabul.Tur = "NAKİT DÖKÜM";
          $scope.kabul.BarkodNo = angular.copy(Barkod);
          $scope.kabul.BelgeNo = angular.copy(BelgeNo);

          $scope.kabul.Response = response.data;

          //SAHA SEÇİMİ
          if ($localStorage.user.depolamaalani.Sahalar.length > 0) {
            var modalInstance = $modal.open({
              keyboard: true,
              animation: false,
              templateUrl: "sahaModal",
              controller: "sahaCtrl",
              size: "lg",
              resolve: {
                SahaListesi: function () {
                  return $localStorage.user.depolamaalani.Sahalar;
                },
              },
            });

            modalInstance.result.then(function (e) {
              $scope.kabul.SahaId = e.DepolamaAlaniSahaId;
            });
          }
          $scope.PlakaSec();
        }
      });
    };

    var depolamaAlaniSor = function (data) {
      return new Promise((resolve) => {
        Notiflix.Confirm.show(
          "Farklı depolama alanı",
          "Belge " +
          data.DepolamaAlani +
          " için oluşturulmuş. <br/> " +
          data.DepolamaAlani +
          " alanı kapalı olması nedeniyle Mevcut sahaya kabul edilecektir!",
          "Kabul Et",
          "Hayır",
          () => {
            resolve(true);
          },
          () => {
            resolve(false);
          },
          {}
        );
      });
    };

    var TasimaKabuBelgesi = function (Barkod, BelgeNo) {
      var data = {
        BelgeNo: BelgeNo,
        BarkodNo: Barkod,
      };
      kendoExt.post(
        "api/kantar/KabulBelgesiKontrol",
        data,
        async function (response) {
          var data = response.data;

          if (data === null) {
            swal("Uyarı", "KabulBelgesiKontrol Hatalı belge no", "error");

            //$scope.kabul.Temizle();
          } else {
            if (data.Aktif === false) {
              swal("Uyarı", "Belge aktif değil", "error");
              return;
            }

            //FARKLI DEPOLAMA ALANI SORGULAMA
            if (
              data.DepolamaAlanId !=
              $localStorage.user.depolamaalani.DepolamaAlanId
            ) {
              var res = await depolamaAlaniSor(data);
              if (!res) return;
            }

            $scope.kabul.Tur = "KABUL BELGESİ";
            $scope.kabul.BarkodNo = angular.copy(Barkod);
            $scope.kabul.BelgeNo = angular.copy(BelgeNo);

            $scope.kabul.Response = response.data;

            $scope.kabul.Response.KalanMiktar =
              $scope.kabul.Response.TasinacakAtikMiktari -
              $scope.kabul.Response.DokumMiktari;

            //SAHA SEÇİMİ
            if ($localStorage.user.depolamaalani.Sahalar.length > 0) {
              var modalInstance = $modal.open({
                keyboard: true,
                animation: false,
                templateUrl: "sahaModal",
                controller: "sahaCtrl",
                size: "lg",
                resolve: {
                  SahaListesi: function () {
                    return $localStorage.user.depolamaalani.Sahalar;
                  },
                },
              });

              modalInstance.result.then(function (e) {
                $scope.kabul.SahaId = e.DepolamaAlaniSahaId;
              });
            }

            if (!$localStorage.user.depolamaalani.OgsAktif) {
              //$scope.kabul.Tonaj = 14000;

              var modalInstance = $modal.open({
                keyboard: true,
                animation: false,
                templateUrl: "araclarModal",
                controller: "plakasecCtrl",
                size: "lg",
                resolve: {
                  PlakaListesi: function () {
                    return $scope.kabul.Response.Araclar;
                  },
                },
              });

              modalInstance.result.then(function (e) {
                $scope.kabul.PlakaNo = e.PlakaNo;
                $scope.kabul.Dara = e.Dara;
                $scope.kabul.AracId = e.AracId;
                $scope.kabul.AracCinsiId = e.AracCinsiId;
                $scope.kabul.IsDaraDegisimi = e.IsDaraDegisimi;

                $scope.kabul.Hesapla();
                $scope.Kaydet();
              });
            } else $scope.Kaydet();

            $scope.$apply();
          }
        }
      );
    };

    var KamuFisBelgesi = function (BelgeNo) {
      var data = {
        FisTeslimId: BelgeNo,
        BarkodNo: "",
        BelgeNo: ""
      };
      kendoExt.post("api/kantar/KamuFisKontrol", data, function (response) {
        var data = response.data;

        if (data === null) {
          swal("Uyarı", "KamuFisKontrol Hatalı belge no", "error");

          //$scope.kabul.Temizle();
        } else {
          if (data.Aktif === false) {
            swal("Uyarı", "Belge aktif değil", "error");
            //$scope.kabul.Temizle();
            return;
          }

          $scope.kabul.Response = response.data;

          $scope.kabul.Response.KalanMiktar =
            $scope.kabul.Response.Tasinacak - $scope.kabul.Response.Tasinan;

          //SAHA SEÇİMİ
          if ($localStorage.user.depolamaalani.Sahalar.length > 0) {
            var modalInstance = $modal.open({
              keyboard: true,
              animation: false,
              templateUrl: "sahaModal",
              controller: "sahaCtrl",
              size: "lg",
              resolve: {
                SahaListesi: function () {
                  return $localStorage.user.depolamaalani.Sahalar;
                },
              },
            });

            modalInstance.result.then(function (e) {
              $scope.kabul.SahaId = e.DepolamaAlaniSahaId;
            });
          }

          if (!$localStorage.user.depolamaalani.OgsAktif) {
            var modalInstance = $modal.open({
              keyboard: true,
              animation: false,
              templateUrl: "araclarModal",
              controller: "plakasecCtrl",
              size: "lg",
              resolve: {
                PlakaListesi: function () {
                  return $scope.kabul.Response.Araclar;
                },
              },
            });

            modalInstance.result.then(function (e) {
              $scope.kabul.PlakaNo = e.PlakaNo;
              $scope.kabul.Dara = e.Dara;
              $scope.kabul.AracId = e.AracId;
              $scope.kabul.IsDaraDegisimi = e.IsDaraDegisimi;

              $scope.kabul.Hesapla();
              $scope.Kaydet();
            });
          }
        }
      });
    };

    var requestSanayiAtikBelgesi = "";
    var SanayiAtikBelgesi = function (Barkod, BelgeNo) {
      var data = {
        BelgeNo: BelgeNo,
      };

      if (requestSanayiAtikBelgesi != Barkod) {
        kendoExt.post(
          "api/kantar/SanayiAtikKontrol",
          data,
          function (response) {
            var data = response.data;

            if (data === null) {
              swal(
                "Uyarı",
                "SanayiAtikKontrol Hatalı belge no :" + BelgeNo,
                "error"
              );
            } else {
              if (data.Aktif === false) {
                swal("Uyarı", "Belge aktif değil", "error");
                return;
              }

              $scope.kabul.Tur = "SANAYİ ATIĞI";
              $scope.kabul.BarkodNo = angular.copy(Barkod);
              $scope.kabul.BelgeNo = angular.copy(BelgeNo);
              $scope.kabul.PlakaNo = data.PlakaNo;
              $scope.kabul.AracId = data.AracId;
              $scope.kabul.FirmaId = data.FirmaId;
              $scope.kabul.Dara = 0;

              $scope.kabul.Response = response.data;

              //SAHA SEÇİMİ
              if ($localStorage.user.depolamaalani.Sahalar.length > 0) {
                var modalInstance = $modal.open({
                  keyboard: true,
                  animation: false,
                  templateUrl: "sahaModal",
                  controller: "sahaCtrl",
                  size: "lg",
                  resolve: {
                    SahaListesi: function () {
                      return $localStorage.user.depolamaalani.Sahalar;
                    },
                  },
                });

                modalInstance.result.then(function (e) {
                  $scope.kabul.SahaId = e.DepolamaAlaniSahaId;
                });
              }

              $scope.Kaydet();
            }
          },
          function (err) {
            Notiflix.Notify.failure(err.data.MessageTODO);

            requestSanayiAtikBelgesi = "";
          }
        );
      }
    };

    //outo clean
    setInterval(function () {
      if (
        moment($scope.sonTartimSaati).add(5, "seconds") <= moment().toDate()
      ) {
        console.log("outo clean tartım");
        kantarVeriTemizle();
      }

      if (moment($scope.sonOgsSaati).add(5, "seconds") <= moment().toDate()) {
        console.log("outo clean OGS");
        OgsTemizle();
      }

      $scope.$apply(function () {
        $scope.readBarkod = "";
      });
    }, 5000);

    var kantarVeriTemizle = function () {
      $scope.$apply(function () {
        $scope.kabul.Tonaj = 0;
        tempTonaj = [];
        tempSpark = [];
        $scope.i = 0;
        $scope.tempGelenTonaj = 0;
      });
    };

    var tempTonaj = [];
    var tempSpark = [];

    if ($localStorage.user.depolamaalani.KantarVarMi)
      mySerialPort(function (data) {
        //TODO : KANTARDAN GELEN VERİ SETİNE GÖRE AYARLAMALAR YAPILACAK
        if (!data) return;
        if (data == "") return;
        var number = data;
        if (isNaN(number)) return;
        if (number < $rootScope.app.options.MinTonaj) return;

        $scope.sonTartimSaati = Date.now();

        tempSpark.push(number);
        if (tempSpark.length >= 100) tempSpark.splice(0, 1);

        tempTonaj.push(number);
        $scope.i = tempTonaj.length;

        var len = 40; //flag
        if ($rootScope.app.options.GirisCikis == "Çıkış") len = 60;
        else if ($rootScope.app.options.Kantar == "IgdirGiris") len = 10;
        else if ($rootScope.app.options.Kantar == "BaskoyGiris") {
          len = 4;
          $scope.i = parseInt(tempTonaj.length * 25);
        } else if ($rootScope.app.options.Kantar == "MudanyaAltintasGiris") {
          len = 4;
          $scope.i = parseInt(tempTonaj.length * 25);
        } else if ($rootScope.app.options.Kantar == "AkcalarGiris") {
          len = 6;
          $scope.i = parseInt(tempTonaj.length * 16.6);
        } else if ($rootScope.app.options.Kantar == "CeriklerGiris") {
          len = 4;
          $scope.i = parseInt(tempTonaj.length * 25);
        } else if ($rootScope.app.options.Kantar == "KucukbalikliGiris") {
          len = 6;
          $scope.i = parseInt(tempTonaj.length * 16.6);
        } else if ($rootScope.app.options.Kantar == "MaksemPinarGiris") {
          len = 10;
          $scope.i = parseInt(tempTonaj.length * 10);
        } else if ($rootScope.app.options.Kantar == "Cataltepe") {
          len = 6;
          $scope.i = parseInt(tempTonaj.length * 16.6);
        }

        $scope.$apply(function () {
          $scope.tempGelenTonaj = number;
        });

        if (tempTonaj.length >= len) {
          var tempGelenTonaj2 = angular.copy(tempTonaj);
          var son5Tonaj = $linq
            .Enumerable()
            .From(tempGelenTonaj2)
            .Skip(len / 2)
            .GroupBy("$", null, "{ Tonaj: $, Count: $$.Count() }")
            .ToArray();

          kantarVeriTemizle();

          if (son5Tonaj.length == 1) {
            //son olcum esit olmali

            var tonaj = son5Tonaj[0].Tonaj;

            $scope.$apply(function () {
              $scope.kabul.Tonaj = tonaj;
              $scope.kabul.Hesapla();
              $scope.Kaydet();
            });
          }
        }
      });


    $scope.SetManuelTonaj = function () {
      $scope.kabul.Tonaj = 36060;
      $scope.kabul.Hesapla();

    }

    $scope.filtre = {
      BasTarih: new Date(),
      BitTarih: new Date(),
      FirmaId: "",
      DepolamaAlanId: $localStorage.user.depolamaalani.DepolamaAlanId,
      DepolamaAlaniSahaId: "",
      raportur: "",
    };

    $scope.Total_Tutar = 0;
    $scope.Total_Tonaj = 0;
    $scope.Total_Arac = 0;

    var col = [
      {
        width: "200px",
        command: [
          {
            field: "Tur",
            text: "Tahakkuk",
            visible: function (dataItem) {
              return dataItem.OwnerId == 999 && dataItem.Dara > 0;
            },
            click: function (e) {
              e.preventDefault();
              var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

              var data = {
                AracId: null,
                FirmaId: null,
                Dara: null,
                SahaId: null,
                UserId: null,
                BelgeNo: dataItem.BelgeNo,
                BarkodNo: dataItem.BarkodNo,
                DepolamaAlanId: null,
                Tonaj: 0,
                Tarih: new Date(),
                GirisCikis: $rootScope.app.options.GirisCikis,
              };

              kendoExt.post(
                "api/kantar/hafriyatkabul/SanayiAtikOnaylaReplay",
                data,
                function (response) {
                  console.log("SAVING SUCCESS");

                  Notiflix.Notify.success("Kaydedildi.");

                  $scope.Filter();
                },
                function (err) {
                  console.log("SAVING failure :");
                  Notiflix.Notify.failure(err.data);
                  $scope.kabul.Temizle();
                  $scope.kabul.BelgeNo = "";
                  $scope.kabul.BarkodNo = "";
                }
              );
            },
            title: " ",
            width: "40px",
          },
          {
            field: "Tur",
            text: "SORUN",
            className: "k-error-colored",
            visible: function (dataItem) {
              var r = false;
              if (dataItem.Aciklama != null)
                r =
                  dataItem.Aciklama.indexOf("Hata") != -1 ||
                  dataItem.Aciklama.indexOf("Basarisiz") != -1;
              return r;
            },
            click: function (e) {
              e.preventDefault();

              var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

              kendo.alert(dataItem.Aciklama);
            },
          },
          {
            field: "Tur",
            text: "ÇıkışYap",
            className: "k-error-colored",
            visible: function (dataItem) {
              var r =
                dataItem.OwnerId == 999 &&
                dataItem.Tonaj > 0 &&
                dataItem.Dara == null;
              return r;
            },
            click: function (e) {
              e.preventDefault();

              var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

              kendo
                .prompt(
                  "Giriş tonajı " +
                  dataItem.Tonaj +
                  " kg dır. Dara bilgisini giriniz.",
                  "0"
                )
                .then(
                  function (data) {
                    var tonaj = dataItem.Tonaj;
                    var dara = parseInt(data);
                    var net = tonaj - dara;

                    if (net <= 0) {
                      Notiflix.Notify.failure("Net tonaj sıfır olamaz!");
                      return;
                    }

                    if (dara <= 0) {
                      Notiflix.Notify.failure("Dara sıfır olamaz!");
                      return;
                    }

                    kendo
                      .confirm(
                        "Dara :" + dara + "kg <br/> NetTonaj :" + net + "kg"
                      )
                      .done(function () {
                        var data = {
                          HafriyatDokumId: dataItem.HafriyatDokumId,
                          Dara: dara,
                        };

                        kendoExt.post(
                          "api/kantar/SanayiAtikCikis",
                          data,
                          function (response) {
                            Notiflix.Notify.success("Kaydedildi.");
                            $scope.Filter();
                          },
                          function (err) {
                            console.log("SAVING failure :");
                            Notiflix.Notify.failure(err.data);
                            $scope.kabul.Temizle();
                          }
                        );
                      });
                  },
                  function () {
                    //kendo.alert("Cancel entering value.");
                  }
                );
            },
          },
          {
            field: "Tur",
            text: "TahakSor",
            className: "k-error-colored",
            visible: function (dataItem) {
              var r = dataItem.OwnerId == 999 || dataItem.OwnerId == 998;
              return r;
            },
            click: function (e) {
              e.preventDefault();

              var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

              var data = {
                BelgeNo: dataItem.BelgeNo,
              };

              kendoExt.post(
                "api/kantar/TahakkukSorgula",
                data,
                function (response) {
                  var data = response.data;

                  if (data.TahakkukTonaji == null) data.TahakkukTonaji = 0;

                  var html = JsonHuman.format(data).outerHTML;

                  if (data.TahakkukTonaji == dataItem.Tonaj) {
                    Notiflix.Report.success(
                      "TAHAKKUK MİKTARI DOĞRU",
                      html,
                      "Tamam"
                    );
                  } else {
                    Notiflix.Report.failure(
                      "TAHAKKUK MİKTARI HATALI",
                      html,
                      "Tamam"
                    );
                  }
                },
                function (err) {
                  Notiflix.Notify.failure(err.data);
                }
              );
            },
          },
          {
            field: "Tur",
            text: "Belge",
            // className: "k-error-colored",
            visible: function (dataItem) {
              return dataItem.Tur == "Özel Döküm";
            },
            click: function (e) {
              e.preventDefault();

              var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

              var data = { BelgeNo: dataItem.BelgeNo };

              kendoExt.post(
                "api/kantar/KabulBelgesiKontrol",
                data,
                function (response) {
                  var item = {
                    BelgeNo: response.data.BelgeNo,
                    Firma: response.data.FirmaAdi,
                    BelgeMiktari:
                      response.data.TasinacakAtikMiktari.toString() + " m³",
                    DokumMiktari: response.data.DokumMiktari.toString() + " m³",
                    KalanMiktari:
                      (
                        response.data.TasinacakAtikMiktari -
                        response.data.DokumMiktari
                      ).toString() + " m³",
                    Aktif: response.data.Aktif ? "EVET" : "HAYIR",
                    DepolamaAlani: response.data.DepolamaAlani,
                    Araclar: response.data.Araclar,
                  };

                  var d = JSON.parse(JSON.stringify(item));
                  var html = JsonHuman.format(d).outerHTML;

                  Notiflix.Report.info("", html, "Tamam");
                },
                function (err) {
                  console.log("SAVING failure :");
                  Notiflix.Notify.failure(err.data);
                  $scope.kabul.Temizle();
                  $scope.kabul.BelgeNo = "";
                  $scope.kabul.BarkodNo = "";
                }
              );
            },
          },
        ],
      },
      {
        field: "OwnerId",
        title: "OwnerId",
        hidden: true,
        attributes: { style: "white-space:nowrap" },
        width: "150px",
      },
      {
        field: "Tur",
        title: "Tür",
        attributes: { style: "white-space:nowrap" },
        width: "150px",
        filterable: {
          cell: {
            template: function (args) {
              args.element.kendoDropDownList({
                dataSource: [
                  "Özel Döküm",
                  "Döküm Fişi",
                  "Kamu Fiş",
                  "Nakit Döküm",
                  "EVSEL NİTELİKLİ KALINTI ATIK",
                  "SANAYİ ATIKLARI",
                  "EVSEL ATIK",
                  "ARITMA ÇAMURU",
                ],
                valuePrimitive: true,
              });
            },
            showOperators: false,
          },
        },
      },
      {
        attributes: { style: "white-space:nowrap" },
        field: "IslemTarihi",
        title: "İşlem Tarihi",
        type: "date",
        format: "{0:dd.MM.yyyy HH:mm:ss}",
        width: "150px",
      },
      {
        field: "BelgeNo",
        title: "BelgeNo",
        attributes: { style: "white-space:nowrap" },
        width: "120px",
        filterable: {
          cell: {
            operator: "contains",
            template: function (args) {
              args.element
                .css("width", "90%")
                .addClass("k-textbox")
                .keydown(function (e) {
                  setTimeout(function () {
                    $(e.target).trigger("change");
                  });
                });
            },
            showOperators: false,
          },
        },
      },
      {
        field: "FirmaAdi",
        title: "Firma Adı",
        attributes: { style: "white-space:nowrap" },
        filterable: {
          cell: {
            operator: "contains",
            template: function (args) {
              args.element
                .css("width", "90%")
                .addClass("k-textbox")
                .keydown(function (e) {
                  setTimeout(function () {
                    $(e.target).trigger("change");
                  });
                });
            },
            showOperators: false,
          },
        },
      },
      {
        field: "PlakaNo",
        title: "Plaka No",
        width: "100px",
        filterable: {
          cell: {
            operator: "contains",
            template: function (args) {
              args.element
                .css("width", "90%")
                .addClass("k-textbox")
                .keydown(function (e) {
                  setTimeout(function () {
                    $(e.target).trigger("change");
                  });
                });
            },
            showOperators: false,
          },
        },
      },
      {
        field: "BirimFiyat",
        title: "Birim Fiyat (₺)",
        format: "{0:C5}",
        width: "100px",
        type: "number",
      },
      {
        field: "Dara",
        title: "Dara (Kg)",
        width: "100px",
        type: "number",
      },
      {
        field: "Tonaj",
        title: "Tonaj (Kg)",
        width: "110px",
        type: "number",
        footerTemplate: "#= kendo.toString(sum, 'N0') # kg",
        //footerTemplate: "{{Total_Tonaj}}"
      },
      {
        field: "ToplamTonaj",
        title: "TopTonaj(Kg)",
        width: "110px",
        type: "number",
      },
      {
        field: "Tutar",
        title: "Tutar (₺)",
        width: "130px",
        format: "{0:c5}",
        type: "number",
        footerTemplate: "#= kendo.toString(sum, 'C2') #",
        //footerTemplate: "{{Total_Tutar | currency:'₺ ':3 }}"
      },
      {
        field: "IslemYapan",
        title: "İşlem Yapan",
        width: "70px",
        attributes: { style: "white-space:nowrap" },
        filterable: {
          cell: {
            operator: "contains",
            template: function (args) {
              args.element
                .css("width", "90%")
                .addClass("k-textbox")
                .keydown(function (e) {
                  setTimeout(function () {
                    $(e.target).trigger("change");
                  });
                });
            },
            showOperators: false,
          },
        },
      },
    ];

    var aggregate = [
      { field: "Tutar", aggregate: "sum" },
      { field: "Tonaj", aggregate: "sum" },
      { field: "min", aggregate: "average" },
    ];

    // outo reflesh
    // setInterval(function () {
    //   if (moment(lastRefleshTime).add(10, "seconds") < moment().toDate())
    //     $("#grid").data("kendoGrid").dataSource.read();
    // }, 20000);

    $scope.isOnlyEntered = false;
    $scope.OnlyEntered = function () {
      if (!$scope.isOnlyEntered) {
        var query =
          "?PlakaNo=" +
          "&OwnerId=999" +
          $scope.filtre.FirmaId +
          "&DepolamaAlanId=" +
          $scope.filtre.DepolamaAlanId;

        var ops = kendoExt.datasource(
          "api/ParaYukleme/GetRaporSanayi" + query,
          col,
          null,
          onBound,
          onDataBinding,
          aggregate
        );
        $("#grid").data("kendoGrid").setOptions(ops);
      } else {
        $scope.Filter();
      }
      $scope.isOnlyEntered = !$scope.isOnlyEntered;
    };

    var lastRefleshTime = Date.now();
    $scope.Filter = function () {
      lastRefleshTime = Date.now();

      var query =
        1 +
        "#" +
        $scope.filtre.BasTarih.toUTCString() +
        "#" +
        $scope.filtre.BitTarih.toUTCString() +
        "#" +
        $scope.filtre.FirmaId +
        "#" +
        $scope.filtre.DepolamaAlanId +
        "#" +
        $scope.filtre.DepolamaAlaniSahaId +
        "#" +
        $scope.filtre.raportur +
        "#" +
        "Hayir";

      var ops = kendoExt.datasource(
        "api/ParaYukleme/GetRapor?q=" + $base64.encode(query),
        col,
        null,
        onBound,
        onDataBinding,
        aggregate
      );
      $("#grid").data("kendoGrid").setOptions(ops);
    };

    var query =
      1 +
      "#" +
      $scope.filtre.BasTarih.toUTCString() +
      "#" +
      $scope.filtre.BitTarih.toUTCString() +
      "#" +
      $scope.filtre.FirmaId +
      "#" +
      $localStorage.user.depolamaalani.DepolamaAlanId +
      "#" +
      $scope.filtre.DepolamaAlaniSahaId +
      "#" +
      $scope.filtre.raportur +
      "#" +
      "Hayir";

    $scope.mainGridOptions = kendoExt.datasource(
      "api/ParaYukleme/GetRapor?q=" + $base64.encode(query),
      col,
      null,
      onBound,
      onDataBinding,
      aggregate
    );

    var isBindDblClk = false;
    function onBound(e) {
      var grid = e.sender;
      var rows = grid.items();

      $(rows).each(function (e) {
        var row = $(this);
        var dataItem = grid.dataItem(row);

        if (dataItem.OwnerId == 999 && dataItem.Dara > 0) {
          row.addClass("bg-red-gradient");
        } else if (dataItem.OwnerId == 999) {
          row.addClass("bg-yellow-gradient");
        } else if (dataItem.OwnerId == 998) {
          row.addClass("bg-green-gradient");
        } else if (dataItem.Tur == "Özel Döküm") {
          row.addClass("bg-light-blue-gradient");
        } else if (dataItem.BelgeNo == "EVSELATIK") {
          row.addClass("bg-blue-gradient");
        }

        if (
          dataItem.OwnerId == 999 &&
          dataItem.Tonaj > 0 &&
          dataItem.Dara == null
        ) {
          row.addClass("bg-success");
        }

        if (dataItem.Aciklama != null)
          if (dataItem.Aciklama.indexOf("ISTİAP") > -1)
            row.addClass("bg-red-gradient");
      });

      if (!isBindDblClk) {
        isBindDblClk = true;
        kendoHelpers.grid.eventRowDoubleClick(grid, function (item) {
          var d = JSON.parse(JSON.stringify(item));
          var html = JsonHuman.format(d).outerHTML;

          Notiflix.Report.info("", html, "Tamam");
        });
      }
    }

    function onDataBinding(e) {
      resizeGrid();

      $scope.Total_Tutar = 0;
      $scope.Total_Tonaj = 0;
      var data = this.dataSource.data();
      $scope.Total_Arac = data.length;

      $(data).each(function () {
        $scope.Total_Tutar = $scope.Total_Tutar + this.Tutar;
        $scope.Total_Tonaj = $scope.Total_Tonaj + this.Tonaj;

        if (this.Dara) this.ToplamTonaj = this.Tonaj + this.Dara;
      });

      $scope.Total_Tonaj = parseInt($scope.Total_Tonaj / 1000);
    }

    $scope.selectOptionsSaha = {
      placeholder: "Saha Seçiniz...",
      dataTextField: "SahaAdi",
      dataValueField: "DepolamaAlaniSahaId",
      valuePrimitive: true,
      autoBind: false,
      dataSource: kendoExt.getDs(
        "api/DepolamaAlani/Saha?DepolamaAlaniId=" +
        $localStorage.user.depolamaalani.DepolamaAlanId
      ),
    };

    $scope.selectOptionsFirma = {
      placeholder: "Firma Seçiniz...",
      dataTextField: "FirmaAdi",
      dataValueField: "FirmaId",
      valuePrimitive: true,
      autoBind: false,
      dataSource: kendoExt.getDs("Api/FirmaListesiMini?BuyukSehirId=1"),
    };

    $scope.excel = function () {
      $("#grid").getKendoGrid().saveAsExcel();
    };

    $scope.pdf = function () {
      $("#grid").getKendoGrid().saveAsPDF();
    };

    $scope.HgsEtiketi = function () {
      var modalInstance = $modal.open({
        keyboard: true,
        animation: false,
        templateUrl: "hgsModal",
        controller: "hgsCtrl",
        windowClass: "modal-60",
        resolve: {
          TumAracListesi: function () {
            return $scope.TumAracListesi;
          },
        },
      });

      modalInstance.result.then(function (e) {
        $scope.kabul.Temizle();
        aracListesiYukle();
      });
    };

    $scope.BariyerAc = function () {
      console.log("BariyerAc...");
      if (client_anten) client_anten.write("0100000111040D12CA\r");
      else Notiflix.Notify.failure("Anten bağlı değil");
    };

    $scope.BariyerAcModal = function () {
      var modalInstance = $modal.open({
        keyboard: true,
        animation: false,
        templateUrl: "bariyer_open",
        controller: "bariyerCtrl",
        size: "md",
        resolve: {},
      });

      modalInstance.result.then(function (e) {
        //bariyer acilacak
        if (signalr_client)
          signalr_client.connection.hub.invoke(hub, "open", e);
        else Notiflix.Notify.warning("Anten bağlı değil");
      });
    };

    $scope.AracEdit = function () {
      var parameter = {
        tur: "aracid",
        id: 0,
      };

      var modalInstance = $modal.open({
        animation: true,
        templateUrl: "aracedit",
        controller: "AracEditCtrl",
        size: "lg",
        resolve: {
          parameter: function () {
            return parameter;
          },
        },
      });

      modalInstance.result.then(function (s) {
        $scope.kabul.Temizle();
        aracListesiYukle();
      });
    };

    function resizeGrid() {
      var gridElement = $("#grid");

      if (gridElement.data("kendoGrid")) {
        gridElement.height($(window).height() + 100 + "px");
        gridElement.data("kendoGrid").resize();
      }
    }

    $(window).resize(function () {
      resizeGrid();
    });
  }
);

function byteToHex(byte) {
  // convert the possibly signed byte (-128 to 127) to an unsigned byte (0 to 255).
  // if you know, that you only deal with unsigned bytes (Uint8Array), you can omit this line
  const unsignedByte = byte & 0xff;

  // If the number can be represented with only 4 bits (0-15),
  // the hexadecimal representation of this number is only one char (0-9, a-f).
  if (unsignedByte < 16) {
    return "0" + unsignedByte.toString(16);
  } else {
    return unsignedByte.toString(16);
  }
}
