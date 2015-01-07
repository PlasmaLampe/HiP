/**
 * Created by Jörg Amelunxen on 06.01.15.
 */

controllersModule.directive('mediaGallery', function() {
    return {
        restrict: 'E',
        scope: {
            files: '=files',
            picturetooltip: '=picturetooltip',
            deletetext: '=deletetext',
            copyto: '=copyto'
        },
        templateUrl: '/assets/directives/mediaGallery.html'
    };
});