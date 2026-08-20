"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;
void main(){
  v_uv=a_position*.5+.5;
  gl_Position=vec4(a_position,0.0,1.0);
}`;

const simulationShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_texel;
uniform vec2 u_drop;
uniform float u_radius;
uniform float u_strength;
uniform float u_damping;
float heightAt(vec2 point){return texture2D(u_state,point).r*2.0-1.0;}
void main(){
  vec4 state=texture2D(u_state,v_uv);
  float previous=state.g*2.0-1.0;
  float neighbors=heightAt(v_uv+vec2(u_texel.x,0.0))+heightAt(v_uv-vec2(u_texel.x,0.0))+heightAt(v_uv+vec2(0.0,u_texel.y))+heightAt(v_uv-vec2(0.0,u_texel.y));
  float next=(neighbors*.5-previous)*u_damping;
  vec2 delta=v_uv-u_drop;
  next+=exp(-dot(delta,delta)/(u_radius*u_radius))*u_strength;
  gl_FragColor=vec4(next*.5+.5,state.r,0.0,1.0);
}`;

const renderShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_state;
uniform sampler2D u_image;
uniform vec2 u_texel;
uniform float u_canvasAspect;
uniform float u_imageAspect;
vec2 coverUv(vec2 uv){
  if(u_canvasAspect>u_imageAspect){
    float scale=u_imageAspect/u_canvasAspect;
    return vec2(uv.x,(uv.y-.5)*scale+.5);
  }
  float scale=u_canvasAspect/u_imageAspect;
  return vec2((uv.x-.5)*scale+.5,uv.y);
}
float heightAt(vec2 point){return texture2D(u_state,point).r*2.0-1.0;}
void main(){
  float left=heightAt(v_uv-vec2(u_texel.x,0.0));
  float right=heightAt(v_uv+vec2(u_texel.x,0.0));
  float bottom=heightAt(v_uv-vec2(0.0,u_texel.y));
  float top=heightAt(v_uv+vec2(0.0,u_texel.y));
  vec2 gradient=vec2(right-left,top-bottom);
  vec2 imageUv=coverUv(v_uv+gradient*.055);
  vec3 color=texture2D(u_image,imageUv).rgb;
  float crest=clamp(length(gradient)*2.4,0.0,.16);
  color+=crest;
  gl_FragColor=vec4(color,1.0);
}`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, fragmentSource: string) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  return program;
}

export function WaterSurface() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = element.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const simulation = createProgram(gl, simulationShader);
    const render = createProgram(gl, renderShader);
    if (!simulation || !render) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    const stateSize = 384;
    const initialState = new Uint8Array(stateSize * stateSize * 4);
    for (let index = 0; index < initialState.length; index += 4) { initialState[index] = 128; initialState[index + 1] = 128; initialState[index + 3] = 255; }
    const textures: Array<WebGLTexture> = [];
    const framebuffers: Array<WebGLFramebuffer> = [];
    for (let index = 0; index < 2; index++) {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, stateSize, stateSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialState);
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      textures.push(texture);
      framebuffers.push(framebuffer);
    }

    const imageTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([4,29,25,255]));
    let imageAspect = 1.5;
    const image = new Image();
    image.src = "/media/portal-hero-v3.png";
    image.onload = () => { imageAspect = image.naturalWidth / image.naturalHeight; gl.bindTexture(gl.TEXTURE_2D, imageTexture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); };

    const positionLocation = new Map<WebGLProgram, number>();
    const bindProgram = (program: WebGLProgram) => {
      gl.useProgram(program);
      let location = positionLocation.get(program);
      if (location === undefined) { location = gl.getAttribLocation(program, "a_position"); positionLocation.set(program, location); }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };
    const uniform = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);
    const resize = () => { const ratio = Math.min(devicePixelRatio, 1.5); element.width = Math.round(innerWidth * ratio); element.height = Math.round(innerHeight * ratio); };
    resize();

    let source = 0;
    let target = 1;
    let frame = 0;
    let pendingDrop: { x: number; y: number; strength: number } | null = null;
    let previousPoint: { x: number; y: number; time: number } | null = null;
    const pointerMove = (event: PointerEvent) => {
      const now = performance.now();
      const elapsed = Math.max(8, now - (previousPoint?.time ?? now - 16));
      const distance = previousPoint ? Math.hypot(event.clientX - previousPoint.x, event.clientY - previousPoint.y) : 0;
      pendingDrop = { x: event.clientX / innerWidth, y: 1 - event.clientY / innerHeight, strength: Math.min(.24, .07 + distance / elapsed * .018) };
      previousPoint = { x: event.clientX, y: event.clientY, time: now };
    };
    const pointerLeave = () => { previousPoint = null; pendingDrop = null; };

    const draw = () => {
      bindProgram(simulation);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[target]);
      gl.viewport(0, 0, stateSize, stateSize);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[source]);
      gl.uniform1i(uniform(simulation, "u_state"), 0);
      gl.uniform2f(uniform(simulation, "u_texel"), 1 / stateSize, 1 / stateSize);
      gl.uniform2f(uniform(simulation, "u_drop"), pendingDrop?.x ?? -2, pendingDrop?.y ?? -2);
      gl.uniform1f(uniform(simulation, "u_radius"), .018);
      gl.uniform1f(uniform(simulation, "u_strength"), pendingDrop?.strength ?? 0);
      gl.uniform1f(uniform(simulation, "u_damping"), .986);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      [source, target] = [target, source];
      pendingDrop = null;

      bindProgram(render);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, element.width, element.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[source]);
      gl.uniform1i(uniform(render, "u_state"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(uniform(render, "u_image"), 1);
      gl.uniform2f(uniform(render, "u_texel"), 1 / stateSize, 1 / stateSize);
      gl.uniform1f(uniform(render, "u_canvasAspect"), element.width / element.height);
      gl.uniform1f(uniform(render, "u_imageAspect"), imageAspect);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    addEventListener("resize", resize);
    addEventListener("pointermove", pointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", pointerLeave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", pointerMove);
      document.documentElement.removeEventListener("pointerleave", pointerLeave);
      textures.forEach(texture => gl.deleteTexture(texture));
      framebuffers.forEach(framebuffer => gl.deleteFramebuffer(framebuffer));
      gl.deleteTexture(imageTexture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(simulation);
      gl.deleteProgram(render);
    };
  }, []);

  return <canvas ref={canvas} className="pointer-events-none absolute inset-0 z-[-25] h-full w-full motion-reduce:hidden" aria-hidden="true" />;
}
