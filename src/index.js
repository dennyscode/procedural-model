import { BoxGeometry, CylinderGeometry, Vector2, FloatType, PMREMGenerator, MeshStandardMaterial, Scene, PerspectiveCamera, ACESFilmicToneMapping, WebGLRenderer, Color, sRGBEncoding, Mesh, MeshBasicMaterial, SphereGeometry } from 'https://cdn.skypack.dev/three@0.137';
import { RGBELoader } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/loaders/RGBELoader'; // for environment map and to look around in that scene
import { OrbitControls } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/controls/OrbitControls';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';


const scene = new Scene();
scene.background = new Color('#FFEECC');

const camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
// camera.position.set(-17, 31, 33);
camera.position.set(0, 0, 50);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0) // look at original scene
controls.dampingFactor = 0.05; // damping smoothenes the movements while rotating the scene with OrbitControls
controls.enableDamping = true;

let envmap;

(async function() {
    let parem = new PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader().setDataType(FloatType).loadAsync("assets/envmap.hdr");
    envmap = parem.fromEquirectangular(envmapTexture).texture;
    

    // SphereMesh NO further needed because hexagons will take place
    // let sphereMesh = new Mesh(
    //     new SphereGeometry(5, 10, 10),
    //     // new MeshBasicMaterial({ color: 0xff000 })
    //     new MeshStandardMaterial({
    //         envMap: envmap,
    //         roughness: 0,
    //         metalness: 1,
    //     })
    // );
    // scene.add(sphereMesh);

    for (let i = -10; i <= 10; i++) {
        for (let j=-10; j <= 10; j++) {
            // makeHex(3, new Vector2(i, j))
            makeHex(3, tileToPosition(i, j))
        }
    }

    // makeHex(3, new Vector2(0, 0));

    let hexagonMesh = new Mesh(
        hexagonGeometries,
        new MeshStandardMaterial({
            envMap: envmap,
            flatShading: true,
        })
    );
    scene.add(hexagonMesh)

    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    })
})();

function tileToPosition(tileX, tileY) {
    return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);

    
}

let hexagonGeometries = new BoxGeometry(0,0,0);

function hexGeometry(height, position) {
    let geo = new CylinderGeometry(1, 1, height, 6, 1, false);
    geo.translate(position.x, height * 0.5, position.y);

    return geo;
}

function makeHex(height, position) {
    let geo = hexGeometry(height, position)
    hexagonGeometries = mergeBufferGeometries([hexagonGeometries, geo]);
}
