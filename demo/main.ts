import {RandomCubes} from "../dist/demos/randomCubes";
// import {Editor} from "../dist/demos/editor";
import { Editor } from "../dist/editor/editor"
import { Clock } from "three";

window.onload = async () => {

    console.log("ONLOAD");

    const container = document.getElementById('main')! as HTMLDivElement;
    
    const scene = new Editor(container);
    scene.initialize();

    // @ts-ignore
    // window.scene = scene;

    // container.appendChild(scene.renderer.domElement);

    // const gl = scene.renderer.getContext();

    // // try to get the debug extension
    // const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    // window.onresize = () => {
    //     scene.resize(container.clientWidth, container.clientHeight);
    // }

    // if (debugInfo) {
    //     const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    //     const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    //     console.log('GPU Vendor:', vendor);
    //     console.log('GPU Renderer:', rendererName);
    // } else {
    //     console.log('WEBGL_debug_renderer_info not supported');
    // }

    // let lastTime = 0;

    // scene.start();

    // scene.resize(container.clientWidth, container.clientHeight);

    // const clock = new Clock();

    // function animate(time: number) {
        
    //     scene.update(clock.getDelta());

    //     requestAnimationFrame(animate);
    // }

    // requestAnimationFrame(animate);
}