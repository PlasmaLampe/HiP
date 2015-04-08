/**
 * Created by Jörg Amelunxen on 08.04.15.
 */

controllersModule.controller('MeshCtrl', ['$scope',function($scope) {
    var that = this;

    var width = 800;
    var height = 600;

    var camera;

    this.resetCamera = function(){
        camera.position.z = 5;
        camera.position.y = 0;
        camera.position.x = 0;

        camera.up = new THREE.Vector3(0,0,1);

        camera.lookAt(new THREE.Vector3(0,0,0));
    };

    function Load (obj)
    {
        var scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 1000 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        document.getElementById('meshViewer').appendChild( renderer.domElement );

        var manager = new THREE.LoadingManager();

        var material = new THREE.MeshBasicMaterial( { color: 0x009900 } );

        var loader = new THREE.OBJLoader( manager );

        var loadedObj = undefined;
        loader.load( obj, function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.geometry.computeFaceNormals();
                    child.material = material;
                }
            } );

            object.position.x = 0;
            object.position.y = 0;
            object.position.z = 0;

            object.scale.x = 0.01;
            object.scale.y = 0.01;
            object.scale.z = 0.01;

            loadedObj = object;
            scene.add( object );
        });

        var render = function () {
            requestAnimationFrame( render );

            if(loadedObj != undefined){
                loadedObj.rotation.x += 0.01;
                loadedObj.rotation.y += 0.01;
            }

            if(camera.position.z != 5){
                camera.position.z = 5;
                camera.up = new THREE.Vector3(0,0,1);
                camera.lookAt(new THREE.Vector3(0,0,0));
            }

            renderer.render(scene, camera);
        };

        var controls = new THREE.OrbitControls( camera, document, renderer.domElement );
        //controls.damping = 0.2;
        controls.addEventListener( 'change', render );

        render();
    }

    Load("/assets/obj/cessna.obj");
}]);