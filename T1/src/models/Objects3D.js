import {FBXLoader} from "../../../build/jsm/loaders/FBXLoader.js"
import { OBJLoader } from '../../../build/jsm/loaders/OBJLoader.js';
import * as THREE from "three"

export class Objects3D {
    constructor(scene){
        this.scene = scene
    }

    async exportFBX(){
        const fbxLoader = new FBXLoader();
        
        this.shyGhost = await fbxLoader.loadAsync("../assets/shy_ghost.fbx")
        this.happyGhost = await fbxLoader.loadAsync("../assets/happy_ghost.fbx")
        this.besta = await fbxLoader.loadAsync("../assets/crossbow.fbx")

        this.scene.add(this.shyGhost)
    }

    async exportOBJ(){
        const oblLoader = new OBJLoader();
        this.arrow = await oblLoader.loadAsync( '../assets/arrow.obj' );
    }

    function loadGLBFile(asset, file, desiredScale)
    {
      let loader = new GLTFLoader( );
      loader.load( file, function ( gltf ) {
        let obj = gltf.scene;
        obj.traverse( function ( child ) {
          if ( child.isMesh ) {
              child.castShadow = true;
          }
        });
        obj = normalizeAndRescale(obj, desiredScale);
        obj = fixPosition(obj);
        obj.updateMatrixWorld( true )
        scene.add ( obj );
    
        // Store loaded gltf in our js object
        asset.object = gltf.scene;
        }, null, null);
    }
    
    // Normalize scale and multiple by the newScale
    function normalizeAndRescale(obj, newScale)
    {
      var scale = getMaxSize(obj); // Available in 'utils.js'
      obj.scale.set(newScale * (1.0/scale),
                    newScale * (1.0/scale),
                    newScale * (1.0/scale));
      return obj;
    }
}
