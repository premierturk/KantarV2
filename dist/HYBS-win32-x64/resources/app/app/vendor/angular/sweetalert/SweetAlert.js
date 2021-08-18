//örnekler
//SweetAlert.swal('Here\'s a message');
//SweetAlert.swal("Good job!", "You clicked the button!", "success");
//SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");


//SweetAlert.swal({
//    title: "Are you sure?",
//    text: "Your will not be able to recover this imaginary file!",
//    type: "warning",
//    showCancelButton: true,
//    confirmButtonColor: "#DD6B55", confirmButtonText: "Yes, delete it!",
//    cancelButtonText: "No, cancel plx!",
//    closeOnConfirm: false,
//    closeOnCancel: false
//},
//function (isConfirm) {
//    if (isConfirm) {
//        SweetAlert.swal("Deleted!", "Your imaginary file has been deleted.", "success");
//    } else {
//        SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
//    }
//});






/**
@fileOverview

@toc

*/

'use strict';

angular.module('oitozero.ngSweetAlert', [])
.factory('SweetAlert', ['$rootScope', function ($rootScope) {

    var swal = window.swal;

    //public methods
    var self = {
        swal: function (arg1, arg2, arg3) {
            $rootScope.$evalAsync(function () {
                if (typeof (arg2) === 'function') {
                    swal(arg1, function (isConfirm) {
                        $rootScope.$evalAsync(function () {
                            arg2(isConfirm);
                        });
                    }, arg3);
                } else {
                    swal(arg1, arg2, arg3);
                }
            });
        },
        success: function (title, message) {
            $rootScope.$evalAsync(function () {
                swal(title, message, 'success');
            });
        },
        error: function (title, message) {
            $rootScope.$evalAsync(function () {
                swal(title, message, 'error');
            });
        },
        warning: function (title, message) {
            $rootScope.$evalAsync(function () {
                swal(title, message, 'warning');
            });
        },
        info: function (title, message) {
            $rootScope.$evalAsync(function () {
                swal(title, message, 'info');
            });
        },
        showInputError: function (message) {
            $rootScope.$evalAsync(function () {
                swal.showInputError(message);
            });
        },
        close: function () {
            $rootScope.$evalAsync(function () {
                swal.close();
            });
        },

        basarili: function (event) {
            $rootScope.$evalAsync(function () {


                swal({
                    title: "Kaydedildi!",
                    text: "Devam etmek için Tamam butonuna basiniz!",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonColor: "#27c24c", confirmButtonText: "Tamam",
                    closeOnConfirm: false,
                    closeOnCancel: true
                }, event);




            });
        }
    };

    return self;
}]);
