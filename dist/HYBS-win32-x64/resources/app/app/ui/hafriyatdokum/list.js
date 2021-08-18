'use strict';

const net = require('net');
const serialport = require('serialport');
const ab2str = require('arraybuffer-to-string');
const _ = require('lodash');
const { base64encode, base64decode } = require('nodejs-base64');
const { ipcRenderer: ipc } = require('electron');







let PORT = 5555;

var mySerialPort = function name(run) {

    const port = new serialport('COM3', {
        autoOpen: false,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
    })

    port.open(function (err) {
        if (err) {
            return console.log('Error opening port: ', err.message)
        }
    })


    port.on('open', function () {
        return console.log('SERIAL PORT OPEN :', port);
    })



    port.on('data', function (data) {

        //console.log('SERIAL PORT DATA : ', ab2str(data));

        run(ab2str(data));

    })

};


var myTcp = function (e) {



    var server = net.createServer(function (client) {

        console.log('Client connect : ', client);

        //client.setEncoding('utf-8');

        client.setTimeout(1000);

        client.on('data', function (received) {

            for (let i = 0; i < received.length; i++) {

                if (received[i] == 0x13) {

                    if (received.Length < i + 3)
                        return;
                    var hex1 = byteToHex(received[i + 1]);
                    var hex2 = byteToHex(received[i + 2]);
                    var hex3 = byteToHex(received[i + 3]);

                    var etiket = parseInt(hex1 + hex2 + hex3, 16);
                    console.log("TCP CLIENT MESSAGE :", etiket);

                    e(etiket);

                }
            }

            // Server send data back to client use client net.Socket object.
            //client.end('Server received data : ' + data + ', send back to client data size : ' + client.bytesWritten);
        });

        client.on('end', function () {
            console.log('Client disconnect.');

            server.getConnections(function (err, count) {
                if (!err) {
                    console.log("There are %d connections now. ", count);
                } else {
                    console.error(JSON.stringify(err));
                }

            });
        });

        // client.on('timeout', function () {
        //     console.log('Client request time out. ');
        // })
    });


    server.listen(PORT, function () {
        server.on('close', function () {
            console.log('TCP server socket is closed.');
        });

        server.on('error', function (error) {
            console.error(JSON.stringify(error));
        });
        console.log('TCP SERVER LISTEN:', server);
    });




}


app.controller('hafriyatdokumlistCtrl', function ($scope, $rootScope, kendoExt, $linq, $timeout, $localStorage, $base64, $modal) {



    if (!angular.isDefined($localStorage.user)) {
        $rootScope.login();

        return;
    }

    if ($localStorage.user.depolamaalani.OgsAktif) {
        swal({
            title: "...",
            text: "Araç listesi yükleniyor",
            imageUrl: "./img/loading.gif",
            showConfirmButton: false
        });
        kendoExt.Get("api/kantar/araclistesi", function (response) {
            $scope.TumAracListesi = response.data;
            swal.close();
        });
    }

    $scope.kabul = {
        Tur: "",
        BelgeNo: "",
        BarkodNo: "",
        AracId: null,
        PlakaNo: "",
        Ogs: "",
        Tutar: 0,
        Tonaj: 0,
        Dara: 0,
        Net: 0,
        Hesapla: function () {

            if ($scope.kabul.Response.IsIlDisi)
                $scope.kabul.IlDisiBirimFiyat = $localStorage.user.depolamaalani.BirimFiyat.find(function (item) {
                    return item.IlId == $scope.kabul.Response.IlDisiIlId
                }).BirimFiyat;

            var bFiyat = $scope.kabul.BirimFiyat;
            if ($scope.kabul.Response.IsIlDisi)
                bFiyat = $scope.kabul.IlDisiBirimFiyat;

            $scope.kabul.Net = $scope.kabul.Tonaj - $scope.kabul.Dara;
            $scope.kabul.Tutar = $scope.kabul.Tonaj * bFiyat;

        },
        Temizle: function () {
            $scope.kabul.Response = {};
            $scope.kabul.Tur = "";
            $scope.kabul.BelgeNo = "";
            $scope.kabul.BarkodNo = "";
            $scope.kabul.AracId = null;
            $scope.kabul.PlakaNo = "";
            $scope.kabul.Ogs = "";
            $scope.kabul.Tutar = 0;
            $scope.kabul.Tonaj = 0;
            $scope.kabul.Dara = 0;
            $scope.kabul.Net = 0;
            $scope.kabul.BirimFiyat = 0
            $scope.kabul.IlDisiBirimFiyat = 0;
            $scope.kabul.SahaId = null;
        },
        UserId: $localStorage.user.userid,
        DepolamaAlaniId: $localStorage.user.depolamaalani.DepolamaAlanId,
        DepolamaAlaniAdi: $localStorage.user.depolamaalani.DepolamaAlanAdi,
        BirimFiyat: $localStorage.user.depolamaalani.BirimFiyat.find(function (item) {
            return item.IlId == $localStorage.user.ilid
        }).BirimFiyat,
        IlDisiBirimFiyat: 0,
        SahaId: null,
        Response: {},
    }


    $scope.$watch('kabul.BelgeNo', function (newValue, oldValue) {
        $scope.Kaydet();
    });

    $scope.$watch('kabul.AracId', function (newValue, oldValue) {
        $scope.Kaydet();
    });

    $scope.$watch('kabul.Tonaj', function (newValue, oldValue) {
        $scope.Kaydet();
    });

    $scope.$watch('kabul.SahaId', function (newValue, oldValue) {
        $scope.Kaydet();
    });

    $scope.$watch('kabul.DepolamaAlaniId', function (newValue, oldValue) {
        $scope.Kaydet();
    });

    $scope.Kaydet = function () {

        if (!angular.isDefined($localStorage.user)) {
            return;
        }

        var Tur = $scope.kabul.Tur;
        var BelgeNo = $scope.kabul.BelgeNo;
        var BarkodNo = $scope.kabul.BarkodNo;
        var AracId = $scope.kabul.AracId;
        var Dara = $scope.kabul.Dara;
        var Tonaj = $scope.kabul.Tonaj;
        var DepolamaAlaniId = $scope.kabul.DepolamaAlaniId;
        var UserId = $scope.kabul.UserId;
        var SahaId = $scope.kabul.SahaId;


        if ($localStorage.user.depolamaalani.Sahalar.length > 0 && SahaId == null) return;
        if (BelgeNo == "") {
            $scope.uyari = "Belge no giriniz!";
            return;
        }
        if (AracId == null) {
            $scope.uyari = "Plaka seçiniz!";
            return;
        }
        if (Dara == 0) {
            $scope.uyari = "Plaka seçiniz!";
            return;
        }
        if (Tonaj == 0) {
            $scope.uyari = "Tonaj verisi bekleyiniz!";
            return;
        }
        if (Tonaj <= Dara) {
            $scope.uyari = "Dara tonajdan küçük olamaz!";
            return;
        }
        $scope.kabul.Temizle();


        var data = {
            AracId: AracId,
            Dara: Dara,
            SahaId: SahaId,
            UserId: UserId,
            BelgeNo: BelgeNo,
            BarkodNo: BarkodNo,
            DepolamaAlanId: DepolamaAlaniId,
            Tonaj: Tonaj
        };


        console.log("SAVING..." + data);
        kendoExt.post("api/kantar/hafriyatkabul/KabulBelgesi", data, function (response) {

            $scope.Filter();
            ipc.send('onprint', response.data);




        }, function (err) {

            swal("", err.data, "error");

            $scope.kabul.Temizle();

        });

    }


    var tempEtiketNo = [];
    myTcp(function (data) {

        $scope.$apply(function () {
            var number = parseInt(data);

            tempEtiketNo.push(number);
            $scope.iOgs = tempEtiketNo.length * 3.3;

            if (tempEtiketNo.length >= 30) {

                var gelen = $linq.Enumerable().From(tempEtiketNo)
                    .GroupBy("$", null, "{ EtiketNo: $, Count: $$.Count() }")
                    .OrderByDescending(function (x) {
                        return x.Count
                    })
                    .FirstOrDefault();

                $scope.kabul.Ogs = gelen.EtiketNo;

                tempEtiketNo = [];


                //TODO:arac boş ise online sorgula
                if ($scope.TumAracListesi != null) {
                    var arac = $scope.TumAracListesi.find(function (item) {
                        return item.OGSEtiket == $scope.kabul.Ogs
                    });

                    $scope.kabul.PlakaNo = arac.PlakaNo;
                    $scope.kabul.Dara = arac.Dara;
                    $scope.kabul.AracId = arac.AracId;

                    $scope.kabul.Hesapla();

                    $scope.Kaydet();
                }

            }

        });


    });

    var readBarkod = "";
    $('#mainDiv').bind('keydown', function (event) {
        //console.log(event.key + " - " + event.keyCode);

        var key = event.key;

        if (event.keyCode == 223)
            key = "-";

        if (!(event.keyCode == 16 || event.keyCode == 13))
            readBarkod = readBarkod + key;



        if (event.keyCode == 13) {
            console.log(readBarkod);






            if (readBarkod.indexOf("KF-") > -1 && readBarkod.indexOf("-KF") > -1) {//KAMUFİŞ

                var belgeNo = readBarkod.replace("KF-", "").replace("-KF", "");
                $scope.$apply(function () {
                    $scope.kabul.Tur = "KAMU FİŞİ";
                    $scope.kabul.BarkodNo = angular.copy(readBarkod);
                    $scope.kabul.BelgeNo = angular.copy(belgeNo);
                });

            } else if (readBarkod.indexOf("A") > -1 && readBarkod.indexOf("-") > -1) {//KABUL BELGESİ


                var belgeNo = readBarkod.split("A")[1];
                $scope.$apply(function () {
                    $scope.kabul.Tur = "KABUL BELGESİ";
                    $scope.kabul.BarkodNo = angular.copy(readBarkod);
                    $scope.kabul.BelgeNo = angular.copy(belgeNo);
                });
                TasimaKabuBelgesi(belgeNo);


            } else if (readBarkod.indexOf("A") > -1) {//NAKİT

                var belgeNo = readBarkod.split("A")[1];
                $scope.$apply(function () {
                    $scope.kabul.Tur = "NAKİT DÖKÜM";
                    $scope.kabul.BarkodNo = angular.copy(readBarkod);
                    $scope.kabul.BelgeNo = angular.copy(belgeNo);
                });

            } else if (readBarkod.indexOf("-") > -1) {//FİRMA BARKOD

                var belgeNo = readBarkod;
                $scope.$apply(function () {
                    $scope.kabul.Tur = "KABUL BELGESİ(FİRMA)";
                    $scope.kabul.BarkodNo = angular.copy(belgeNo);
                    $scope.kabul.BelgeNo = angular.copy(belgeNo);
                });

                TasimaKabuBelgesi(belgeNo);

            }

            readBarkod = "";
        }

    });


    var TasimaKabuBelgesi = function (BelgeNo) {

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


    var tempTonaj = [];
    var tempSpark = [];

    mySerialPort(function (data) {
        $rootScope.$apply(function () {

            //TODO : KANTARDAN GELEN VERİ SETİNE GÖRE AYARLAMALAR YAPILACAK

            var number = parseInt(data.replace(" ", ""));


            tempSpark.push(number);
            if (tempSpark.length >= 130) {
                tempSpark.splice(0, 1);
            }

            $scope.weather = new kendo.data.DataSource({
                data: tempSpark
            });



            if (isNaN(number)) return;
            if (number < 1000) return;

            $scope.tempGelenTonaj = number;
            tempTonaj.push(number);
            $scope.i = tempTonaj.length * 5;

            if (tempTonaj.length >= 20) {

                $scope.kabul.Tonaj = 0;

                var gelenTonaj = $linq.Enumerable().From(tempTonaj)
                    .GroupBy("$", null, "{ Tonaj: $, Count: $$.Count() }")
                    .OrderByDescending(function (x) {
                        return x.Count
                    })
                    .FirstOrDefault();

                $scope.kabul.Tonaj = gelenTonaj.Tonaj;

                $scope.kabul.Hesapla();

                $scope.Kaydet();

                tempTonaj = [];
            }








        });

    });


    $scope.filtre = {
        BasTarih: new Date(),
        BitTarih: new Date(),
        FirmaId: "",
        DepolamaAlanId: $localStorage.user.depolamaalani.DepolamaAlanId,
        DepolamaAlaniSahaId: "",
        raportur: ""
    };


    $scope.Total_Tutar = 0;
    $scope.Total_Tonaj = 0;
    $scope.Total_Arac = 0;

    $scope.col =
        [
            {
                attributes: { "style": "white-space:nowrap" },
                field: "IslemTarihi",
                title: "İşlem Tarihi",
                type: "date",
                format: "{0:dd.MM.yyyy HH:mm:ss}",
                width: "140px"
            },
            {
                field: "BelgeNo",
                title: "BelgeNo",
                attributes: { "style": "white-space:nowrap" },
                width: "100px",
                filterable: {
                    cell: {
                        operator: "contains",
                        template: function (args) {
                            args.element.css("width", "90%").addClass("k-textbox").keydown(function (e) {
                                setTimeout(function () {
                                    $(e.target).trigger("change");
                                });
                            });
                        },
                        showOperators: false
                    }
                }
            },
            // {
            //     field: "BarkodNo",
            //     title: "BarkodNo",
            //     attributes: { "style": "white-space:nowrap" },
            //     width: "100px",
            //     filterable: {
            //         cell: {
            //             operator: "contains",
            //             template: function (args) {
            //                 args.element.css("width", "90%").addClass("k-textbox").keydown(function (e) {
            //                     setTimeout(function () {
            //                         $(e.target).trigger("change");
            //                     });
            //                 });
            //             },
            //             showOperators: false
            //         }
            //     }
            // },
            {
                field: "FirmaAdi",
                title: "Firma Adı",
                attributes: { "style": "white-space:nowrap" },
                filterable: {
                    cell: {
                        operator: "contains",
                        template: function (args) {
                            args.element.css("width", "90%").addClass("k-textbox").keydown(function (e) {
                                setTimeout(function () {
                                    $(e.target).trigger("change");
                                });
                            });
                        },
                        showOperators: false
                    }
                }
            },
            {
                field: "PlakaNo",
                title: "Plaka No",
                width: "100px",
                filterable: {
                    cell: {
                        operator: "contains",
                        template: function (args) {
                            args.element.css("width", "90%").addClass("k-textbox").keydown(function (e) {
                                setTimeout(function () {
                                    $(e.target).trigger("change");
                                });
                            });
                        },
                        showOperators: false
                    }
                }
            },
            {
                field: "Dara",
                title: "Dara (Kg)",
                width: "100px",
                type: "number",
            },
            {
                field: "BirimFiyat",
                title: "Birim Fiyat (₺)",
                format: "{0:C5}",
                width: "100px",
                type: "number"
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
                field: "Tutar",
                title: "Tutar (₺)",
                width: "110px",
                format: "{0:c5}",
                type: "number",
                footerTemplate: "#= kendo.toString(sum, 'C2') #",
                //footerTemplate: "{{Total_Tutar | currency:'₺ ':3 }}"
            },

            {
                field: "IslemYapan",
                title: "İşlem Yapan",
                width: "70px",
                attributes: { "style": "white-space:nowrap" },
                filterable: {
                    cell: {
                        operator: "contains",
                        template: function (args) {
                            args.element.css("width", "90%").addClass("k-textbox").keydown(function (e) {
                                setTimeout(function () {
                                    $(e.target).trigger("change");
                                });
                            });
                        },
                        showOperators: false
                    }
                }
            },
            {
                attributes: { "style": "white-space:nowrap" },
                field: "Bakiye",
                title: "Bakiye (₺)",
                width: "110px",
                format: "{0:c5}",
                type: "number",
                //footerTemplate: "#= kendo.toString(sum, 'C2') #",
                //footerTemplate: "{{Total_Tutar | currency:'₺ ':3 }}"
            },

        ];

    var aggregate = [{ field: "Tutar", aggregate: "sum" }, { field: "Tonaj", aggregate: "sum" }, { field: "min", aggregate: "average" }]

    $scope.Filter = function () {

        var query = 1 + "#" + $scope.filtre.BasTarih.toUTCString()
            + "#" + $scope.filtre.BitTarih.toUTCString()
            + "#" + $scope.filtre.FirmaId
            + "#" + $scope.filtre.DepolamaAlanId
            + "#" + $scope.filtre.DepolamaAlaniSahaId
            + "#" + $scope.filtre.raportur
            + "#" + "Hayir"

            ;

        var ops = kendoExt.datasource("api/ParaYukleme/GetRapor?q=" + $base64.encode(query),
            $scope.col, null, null, onDataBinding, aggregate);
        $("#grid").data("kendoGrid").setOptions(ops);
    };

    var query = 1 + "#" + $scope.filtre.BasTarih.toUTCString()
        + "#" + $scope.filtre.BitTarih.toUTCString()
        + "#" + $scope.filtre.FirmaId
        + "#" + $localStorage.user.depolamaalani.DepolamaAlanId
        + "#" + $scope.filtre.DepolamaAlaniSahaId
        + "#" + $scope.filtre.raportur
        + "#" + "Hayir";

    $scope.mainGridOptions = kendoExt.datasource("api/ParaYukleme/GetRapor?q=" + $base64.encode(query),
        $scope.col, null, null, onDataBinding, aggregate);




    function onDataBinding(e) {

        resizeGrid();

        $scope.Total_Tutar = 0;
        $scope.Total_Tonaj = 0;
        var data = this.dataSource.data();
        $scope.Total_Arac = data.length;

        $scope.Total_Diff = 0;

        var IslemTarihi;
        $(data).each(function () {
            $scope.Total_Tutar = $scope.Total_Tutar + this.Tutar;
            $scope.Total_Tonaj = $scope.Total_Tonaj + this.Tonaj;

            if (IslemTarihi !== undefined) {
                var now = moment(IslemTarihi); //todays date
                var end = moment(this.IslemTarihi); // another date
                var duration = moment.duration(now.diff(end));
                var min = duration.asMinutes();

                $scope.Total_Diff = $scope.Total_Diff + min;

                this.min = min;
            } else {
                this.min = 0;
            }

            IslemTarihi = this.IslemTarihi;
        });

        $scope.Total_Tonaj = parseInt($scope.Total_Tonaj / 1000);

        //$scope.Total_Diff_Ortalama = ($scope.Total_Arac - 1) / $scope.Total_Diff;

        // var query1 = $linq.Enumerable().From(data)
        //     .GroupBy("$.DepolamaAlanAdi", null, "{ DepolamaAlanAdi: $, Count: $$.Count() }")
        //     .OrderBy(function (x) {
        //         return x.Count
        //     })
        //     .ToArray();

        // createChart1(query1);

        // var query2 = $linq.Enumerable().From(data)
        //     .GroupBy("$.Tur", null, "{ Tur: $, Count: $$.Count() }")
        //     .OrderBy(function (x) {
        //         return x.Count
        //     })
        //     .ToArray();

        // createChart2(query2);
    }


    $scope.selectOptionsSaha = {
        placeholder: "Saha Seçiniz...",
        dataTextField: "SahaAdi",
        dataValueField: "DepolamaAlaniSahaId",
        valuePrimitive: true,
        autoBind: false,
        dataSource: kendoExt.getDs("api/DepolamaAlani/Saha?DepolamaAlaniId=" + $localStorage.user.depolamaalani.DepolamaAlanId)
    };

    $scope.selectOptionsFirma = {
        placeholder: "Firma Seçiniz...",
        dataTextField: "FirmaAdi",
        dataValueField: "FirmaId",
        valuePrimitive: true,
        autoBind: false,
        dataSource: kendoExt.getDs("Api/FirmaListesiMini?BuyukSehirId=1")
    };

    $scope.excel = function () {
        $("#grid").getKendoGrid().saveAsExcel();
    };

    $scope.pdf = function () {
        $("#grid").getKendoGrid().saveAsPDF();
    };

    function resizeGrid() {

        var gridElement = $("#grid");

        if (gridElement.data("kendoGrid")) {
            gridElement.height($(window).height() - 80 + "px");
            gridElement.data("kendoGrid").resize();
        }
    }

    $(window).resize(function () {

        resizeGrid();
    });

});



app.controller('plakasecCtrl', function ($scope, $rootScope, kendoExt, $linq, $timeout, $localStorage, $base64, $modalInstance, PlakaListesi) {
    $scope.PlakaListesi = PlakaListesi;
    $scope.AracId = null;

    $timeout(function () {
        $("#txtSearch").focus();
        $scope.TumPlakalar = angular.copy(PlakaListesi);
        if ($scope.TumPlakalar.length > 0) {
            $scope.AracId = $scope.TumPlakalar[0].AracId;
            $scope.PlakaNo = " | " + $scope.TumPlakalar[0].PlakaNo;
        }


    }, 200);



    $scope.setSelected = function (item) {
        $scope.AracId = item.AracId;
        $scope.PlakaNo = " | " + item.PlakaNo;
    };




    $scope.$watch('filter', function () {

        $scope.TumPlakalar = $linq.Enumerable().From($scope.PlakaListesi)
            .Where(function (x) {
                return x.PlakaNo.startsWith($scope.filter)
            }).ToArray();


        if ($scope.TumPlakalar.length > 0)
            $scope.AracId = $scope.TumPlakalar[0].AracId;


    });


    $scope.Enter = function (e) {

        if (e.which === 13) {
            var selected = $linq.Enumerable().From($scope.PlakaListesi)
                .Where(function (x) {
                    return x.AracId === $scope.AracId
                }).FirstOrDefault();

            $modalInstance.close(selected);
        }


    };



    $scope.Sec = function () {

        var selected = $linq.Enumerable().From($scope.PlakaListesi)
            .Where(function (x) {
                return x.AracId === $scope.AracId
            }).FirstOrDefault();

        $modalInstance.close(selected);
    };




});


app.controller('sahaCtrl', function ($scope, $rootScope, kendoExt, $linq, $timeout, $localStorage, $base64, $modalInstance, SahaListesi) {
    $scope.SahaListesi = SahaListesi;
    $scope.DepolamaAlaniSahaId = null;



    $scope.setSelected = function (item) {
        $scope.DepolamaAlaniSahaId = item.DepolamaAlaniSahaId;
    };


    $scope.Sec = function () {

        var selected = $linq.Enumerable().From($scope.SahaListesi)
            .Where(function (x) {
                return x.DepolamaAlaniSahaId === $scope.DepolamaAlaniSahaId
            }).FirstOrDefault();

        $modalInstance.close(selected);
    };




});



function byteToHex(byte) {
    // convert the possibly signed byte (-128 to 127) to an unsigned byte (0 to 255).
    // if you know, that you only deal with unsigned bytes (Uint8Array), you can omit this line
    const unsignedByte = byte & 0xff;

    // If the number can be represented with only 4 bits (0-15), 
    // the hexadecimal representation of this number is only one char (0-9, a-f). 
    if (unsignedByte < 16) {
        return '0' + unsignedByte.toString(16);
    } else {
        return unsignedByte.toString(16);
    }
}