/**
 * Created by Jörg Amelunxen on 07.12.14.
 */

controllersModule.controller('AnnotationCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.startAnnotation = function(id){
        $(id).annotator();
    };
}]);