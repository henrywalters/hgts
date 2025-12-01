import {RandomCubes} from "../dist/demos/randomCubes";


window.onload = () => {

    const container = document.getElementById('container')! as HTMLDivElement;
    const fps = document.getElementById('fps')! as HTMLSpanElement;

    const scene = new RandomCubes();
    scene.resize(container.clientWidth, container.clientHeight);
    container.appendChild(scene.renderer.domElement);

    const gl = scene.renderer.getContext();

    // try to get the debug extension
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        console.log('GPU Vendor:', vendor);
        console.log('GPU Renderer:', rendererName);
    } else {
        console.log('WEBGL_debug_renderer_info not supported');
    }

    let lastTime = 0;

    scene.start();

    function animate(time: number) {

        const dt = (time - lastTime) / 1000;
        lastTime = time;

        scene.update(dt);

        fps.innerText = 1 / dt;



        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}