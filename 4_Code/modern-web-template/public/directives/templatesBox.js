/**
 * Created by Jörg Amelunxen on 30.01.15.
 */

controllersModule.directive('templatesBox', function() {
    return {
        restrict: 'E',
        scope: {
            lc: '=languagecontroller',
            uc: '=usercontroller',
            gc: '=groupcontroller'
        },
        templateUrl: '/assets/directives/templatesBox.html'
    };
});
