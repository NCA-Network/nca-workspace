import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getLenisInstance } from './SmoothScrollProvider'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScrollOffset;
uniform float uScrollVelocity;
uniform vec2 uMouse;
uniform float uMouseActive;

varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 uv) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(uv * frequency + float(i) * 0.7);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

// Value noise
float hash(vec2 uv) {
  vec3 p3 = fract(vec3(uv.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 aspectUV = uv * uResolution;
  vec2 baseUV = aspectUV;
  float t = uTime;

  // Two independent animated noise layers for domain warping
  vec2 timeOffset1 = vec2(
    fbm(baseUV * 0.5 + t * 0.15),
    fbm(baseUV * 0.5 + vec2(5.2, 1.3) + t * 0.126)
  );
  vec2 timeOffset2 = vec2(
    fbm(baseUV * 0.8 + t * 0.2 + 3.0),
    fbm(baseUV * 0.8 + vec2(9.2, 4.3) + t * 0.15)
  );

  // Domain-warped coordinates
  vec2 q = vec2(
    fbm(baseUV + timeOffset1),
    fbm(baseUV + vec2(5.2, 1.3) + timeOffset1)
  );
  vec2 r = vec2(
    fbm(baseUV + 4.0 + q * 1.85 + timeOffset2),
    fbm(baseUV + vec2(8.3, 2.8) + q * 1.85 + timeOffset2)
  );
  vec2 warpedUV = baseUV + r * 0.35;

  // Color palette - warm amber, teal, burgundy
  vec3 color1 = vec3(0.831, 0.647, 0.467); // #d4a574 amber
  vec3 color2 = vec3(0.176, 0.420, 0.420); // #2d6b6b teal
  vec3 color3 = vec3(0.549, 0.357, 0.404); // #8c5b67 burgundy

  // Animated color positions - figure-eight orbit
  vec2 color1Pos = vec2(-0.40, -0.25) + vec2(sin(t * 0.30) * 0.15, sin(t * 0.30 * 2.0) * 0.075);
  vec2 color2Pos = vec2(0.00, 0.35) + vec2(cos(t * 0.20) * 0.12, cos(t * 0.20 * 2.0) * 0.06);
  vec2 color3Pos = vec2(0.40, -0.15) + vec2(sin(t * 0.25 + 1.0) * 0.14, sin(t * 0.25 * 2.0 + 1.0) * 0.07);

  // Domain-warped distances
  float d1 = length(warpedUV - color1Pos) + snoise(warpedUV + t * 0.15) * 0.3;
  float d2 = length(warpedUV - color2Pos) + snoise(warpedUV + t * 0.15) * 0.3;
  float d3 = length(warpedUV - color3Pos) + snoise(warpedUV + t * 0.15) * 0.3;

  // Inverted distances = color contribution
  float c1 = 1.0 / (d1 + 0.1) * 0.5;
  float c2 = 1.0 / (d2 + 0.1) * 0.5;
  float c3 = 1.0 / (d3 + 0.1) * 0.5;

  // Normalize
  float total = c1 + c2 + c3;
  c1 /= total;
  c2 /= total;
  c3 /= total;

  // Scroll-driven hue shift
  float scrollVel = clamp(uScrollVelocity, -1.0, 1.0);
  float hueShift = scrollVel * 0.06;

  // Build base color
  vec3 baseColor = color1 * c1 + color2 * c2 + color3 * c3;
  baseColor = mix(baseColor, baseColor * 1.15, hueShift);

  // Subtle luminance variation
  float luminanceNoise = fbm(warpedUV * 0.3 + t * 0.08) * 0.08;
  baseColor += luminanceNoise;

  // Mouse ripple
  if (uMouseActive > 0.5) {
    vec2 mUV = uMouse;
    float mDist = length(aspectUV - mUV);
    float mInfluence = smoothstep(0.45, 0.0, mDist) * 0.5;
    float ripple = sin(mDist - t * 2.5) * 0.12;
    vec2 rippleUV = warpedUV + ripple * mInfluence;

    float mDist2 = length(rippleUV - mUV);
    float mInfluence2 = smoothstep(0.45, 0.0, mDist2) * 0.5;

    // Chromatic aberration
    float aberration = mInfluence2 * 1.0;
    vec2 redUV = rippleUV + vec2(aberration * 0.015, 0.0);
    vec2 greenUV = rippleUV + vec2(0.0, aberration * -0.010);
    vec2 blueUV = rippleUV + vec2(aberration * -0.005, aberration * 0.008);

    float rChannel = vnoise(redUV * 3.0 + t * 0.1) * 0.5 + 0.5;
    float gChannel = vnoise(greenUV * 3.0 + t * 0.1 + 2.0) * 0.5 + 0.5;
    float bChannel = vnoise(blueUV * 3.0 + t * 0.1 + 4.0) * 0.5 + 0.5;

    vec3 mouseColor = vec3(
      rChannel * color1.r + gChannel * color2.g + bChannel * color3.z
    );
    baseColor = mix(baseColor, mouseColor, mInfluence2);
  }

  // Add warmth and vibrancy
  baseColor = pow(baseColor, vec3(0.95));

  // Tone mapping
  baseColor = baseColor / (1.0 + baseColor * 0.15);

  gl_FragColor = vec4(baseColor, 1.0);
}
`

export default function FluidCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animFrameRef = useRef<number>(0)
  const mouseRef = useRef({ x: -10, y: -10, active: false })

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // Check for WebGL support
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      container.classList.add('hero-gradient-fallback')
      return
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0.0 },
      uScrollOffset: { value: 0.0 },
      uScrollVelocity: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(-10, -10) },
      uMouseActive: { value: 0.0 },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const clock = new THREE.Clock()
    let isVisible = true

    const resize = () => {
      const w = container.offsetWidth
      const h = container.offsetHeight
      renderer.setSize(w, h)
      uniforms.uResolution.value.set(w, h)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      // Convert NDC to pixel-like coords for the shader
      const w = container.offsetWidth
      const h = container.offsetHeight
      mouseRef.current.x = x * w * 0.5
      mouseRef.current.y = y * h * 0.5
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    // IntersectionObserver for pausing
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting
      },
      { threshold: 0.1 }
    )
    intersectionObserver.observe(container)

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)

      if (!isVisible) return

      uniforms.uTime.value = clock.getElapsedTime()

      // Read from Lenis
      const lenis = getLenisInstance()
      if (lenis) {
        uniforms.uScrollOffset.value = lenis.scroll
        uniforms.uScrollVelocity.value = lenis.velocity * 0.001
      }

      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)
      uniforms.uMouseActive.value = mouseRef.current.active ? 1.0 : 0.0

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}
