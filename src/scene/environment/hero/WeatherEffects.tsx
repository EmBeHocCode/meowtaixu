import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { useEnvironment } from '../../../features/environment';

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 78.233 + salt * 19.71) * 43758.5453;
  return value - Math.floor(value);
}

function makeRainGeometry(count: number) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  const depth = new Float32Array(count);
  const scale = new Float32Array(count);
  const stretch = new Float32Array(count);
  const visibility = new Float32Array(count);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    depth[i] = seeded(i, 3);
    scale[i] = 0.84 + seeded(i, 4) * 0.76;
    stretch[i] = 0.84 + seeded(i, 5) * 0.4;
    visibility[i] = seeded(i, 6);
    seeds[i * 3] = seeded(i, 1);
    seeds[i * 3 + 1] = seeded(i, 2);
    seeds[i * 3 + 2] = seeded(i, 7);
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aDepth', new BufferAttribute(depth, 1));
  geometry.setAttribute('aScale', new BufferAttribute(scale, 1));
  geometry.setAttribute('aStretch', new BufferAttribute(stretch, 1));
  geometry.setAttribute('aVisibility', new BufferAttribute(visibility, 1));
  geometry.userData.seeds = seeds;
  return geometry;
}

export function RainSystem({ active, mobile }: { active: boolean; mobile: boolean }) {
  const { values } = useEnvironment();
  const geometry = useMemo(() => makeRainGeometry(mobile ? 320 : 900), [mobile]);
  const material = useMemo(() => new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uOpacity: { value: 0 },
      uRain: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio, 1.5) },
      uSlant: { value: 0 },
    },
    vertexShader: `
      attribute float aDepth;
      attribute float aScale;
      attribute float aStretch;
      attribute float aVisibility;
      uniform float uRain;
      uniform float uPixelRatio;
      varying float vStretch;
      varying float vVisibility;
      varying float vDepth;
      void main(){
        vStretch=aStretch;
        vVisibility=aVisibility;
        vDepth=aDepth;
        vec4 mvPosition=modelViewMatrix*vec4(position,1.0);
        gl_Position=projectionMatrix*mvPosition;
        gl_PointSize=(2.2+aDepth*4.8)*aScale*uPixelRatio*(0.82+uRain*.3);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform float uRain;
      uniform float uSlant;
      varying float vStretch;
      varying float vVisibility;
      varying float vDepth;
      void main(){
        if(vVisibility>min(1.0,.12+uRain*1.08)) discard;
        vec2 p=gl_PointCoord-vec2(.5);
        p.x+=p.y*uSlant*.24;
        float drop=length(vec2(p.x*1.85,p.y*(1.24/vStretch)));
        float alpha=smoothstep(.5,.14,drop);
        float head=smoothstep(.3,.04,length(vec2(p.x*1.75,(p.y+.16)*1.7)));
        alpha=max(alpha*.76,head);
        gl_FragColor=vec4(mix(vec3(.58,.72,.78),vec3(.9,.95,.96),vDepth),alpha*uOpacity*(.52+vDepth*.48));
      }
    `,
  }), []);
  const elapsed = useRef(0);
  const { viewport } = useThree();

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((_state, delta) => {
    if (!active) return;
    elapsed.current += Math.min(delta, 0.06);
    const positions = geometry.getAttribute('position') as BufferAttribute;
    const depth = geometry.getAttribute('aDepth') as BufferAttribute;
    const seeds = geometry.userData.seeds as Float32Array;
    const rain = values.rain;
    const width = viewport.width * 1.28;
    const height = viewport.height * 1.24;
    const downward = 0.62 + rain * 1.72;
    const windPush = values.windDirection * values.wind * 0.13;
    for (let i = 0; i < positions.count; i += 1) {
      const layer = depth.getX(i);
      const seedX = seeds[i * 3];
      const seedY = seeds[i * 3 + 1];
      const seedSpeed = seeds[i * 3 + 2];
      const progress = (seedY + elapsed.current * downward * (0.7 + layer * 0.72 + seedSpeed * 0.32)) % 1;
      const y = height * (0.5 - progress);
      const x = width * (seedX - 0.5) + progress * width * windPush;
      positions.setXYZ(i, x, y, -2.8 + layer * 6.1);
    }
    positions.needsUpdate = true;
    material.uniforms.uRain.value = rain;
    material.uniforms.uOpacity.value = Math.max(0, rain - 0.025) * (mobile ? 0.78 : 0.92);
    material.uniforms.uSlant.value = values.wind * values.windDirection;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={18} />;
}

const impactZones = [
  { x: -0.43, y: -0.43, spread: 0.22 },
  { x: -0.1, y: -0.46, spread: 0.18 },
  { x: 0.2, y: -0.39, spread: 0.2 },
  { x: 0.42, y: -0.23, spread: 0.12 },
] as const;

function RainImpacts({ active, mobile }: { active: boolean; mobile: boolean }) {
  const { values } = useEnvironment();
  const count = mobile ? 42 : 110;
  const geometry = useMemo(() => {
    const next = new BufferGeometry();
    next.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    next.setAttribute('aLife', new BufferAttribute(new Float32Array(count), 1));
    next.setAttribute('aSize', new BufferAttribute(Float32Array.from({ length: count }, (_, i) => 0.65 + seeded(i, 11) * 1.25), 1));
    next.userData.seeds = Float32Array.from({ length: count * 4 }, (_, i) => seeded(i, 12));
    return next;
  }, [count]);
  const splashMaterial = useMemo(() => new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uOpacity: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio, 1.5) } },
    vertexShader: `
      attribute float aLife; attribute float aSize; uniform float uPixelRatio; varying float vLife;
      void main(){ vLife=aLife; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_PointSize=(2.0+aSize*2.5)*uPixelRatio*(1.0-aLife*.45); }
    `,
    fragmentShader: `
      uniform float uOpacity; varying float vLife;
      void main(){ vec2 p=gl_PointCoord-.5; float a=smoothstep(.5,.08,length(p))*sin(3.14159*vLife); gl_FragColor=vec4(.66,.81,.86,a*uOpacity); }
    `,
  }), []);
  const rippleGeometry = useMemo(() => {
    const rippleCount = mobile ? 12 : 28;
    const next = new BufferGeometry();
    next.setAttribute('position', new BufferAttribute(new Float32Array(rippleCount * 3), 3));
    next.setAttribute('aLife', new BufferAttribute(new Float32Array(rippleCount), 1));
    next.userData.seeds = Float32Array.from({ length: rippleCount * 3 }, (_, i) => seeded(i, 19));
    return next;
  }, [mobile]);
  const rippleMaterial = useMemo(() => new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uOpacity: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio, 1.5) } },
    vertexShader: `
      attribute float aLife; uniform float uPixelRatio; varying float vLife;
      void main(){ vLife=aLife; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_PointSize=(5.0+aLife*13.0)*uPixelRatio; }
    `,
    fragmentShader: `
      uniform float uOpacity; varying float vLife;
      void main(){ vec2 p=gl_PointCoord-.5; float d=length(vec2(p.x,p.y*2.2)); float ring=smoothstep(.08,.0,abs(d-(.18+vLife*.24))); float edge=smoothstep(.5,.35,length(p)); gl_FragColor=vec4(.57,.75,.81,ring*edge*(1.0-vLife)*uOpacity); }
    `,
  }), []);
  const elapsed = useRef(0);
  const { viewport } = useThree();

  useEffect(() => () => {
    geometry.dispose(); splashMaterial.dispose(); rippleGeometry.dispose(); rippleMaterial.dispose();
  }, [geometry, rippleGeometry, rippleMaterial, splashMaterial]);

  useFrame((_state, delta) => {
    if (!active) return;
    elapsed.current += Math.min(delta, 0.06);
    const update = (target: BufferGeometry, ripple: boolean) => {
      const positions = target.getAttribute('position') as BufferAttribute;
      const life = target.getAttribute('aLife') as BufferAttribute;
      const seeds = target.userData.seeds as Float32Array;
      for (let i = 0; i < positions.count; i += 1) {
        const zone = impactZones[i % impactZones.length];
        const stride = ripple ? 3 : 4;
        const phase = (elapsed.current * (ripple ? 0.72 : 1.75) + seeds[i * stride] * 2.4) % 1;
        const spread = (seeds[i * stride + 1] - 0.5) * zone.spread * viewport.width;
        const baseX = zone.x * viewport.width + spread;
        const baseY = zone.y * viewport.height;
        const burst = ripple ? 0 : Math.sin(Math.PI * Math.min(1, phase * 3.2)) * viewport.height * (0.008 + seeds[i * 4 + 2] * 0.018);
        const scatter = ripple ? 0 : (seeds[i * 4 + 3] - 0.5) * phase * viewport.width * 0.012;
        positions.setXYZ(i, baseX + scatter, baseY + burst, 3.48);
        life.setX(i, phase);
      }
      positions.needsUpdate = true;
      life.needsUpdate = true;
    };
    update(geometry, false);
    update(rippleGeometry, true);
    const impact = Math.max(0, values.rain - 0.12);
    splashMaterial.uniforms.uOpacity.value = impact * (mobile ? 0.45 : 0.72);
    rippleMaterial.uniforms.uOpacity.value = impact * (mobile ? 0.22 : 0.42);
  });

  return <>
    <points geometry={rippleGeometry} material={rippleMaterial} frustumCulled={false} renderOrder={19} />
    <points geometry={geometry} material={splashMaterial} frustumCulled={false} renderOrder={20} />
  </>;
}

function SurfaceRainResponse({ active, mobile }: { active: boolean; mobile: boolean }) {
  const { values } = useEnvironment();
  const ground = useRef<ShaderMaterial>(null);
  const cliff = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const { viewport } = useThree();
  useFrame((_state, delta) => {
    if (!active || !ground.current || (!mobile && !cliff.current)) return;
    elapsed.current += Math.min(delta, 0.08);
    const wetness = Math.max(0, values.rain - 0.06);
    ground.current.uniforms.uWet.value = wetness;
    ground.current.uniforms.uTime.value = elapsed.current;
    if (cliff.current) {
      cliff.current.uniforms.uWet.value = wetness;
      cliff.current.uniforms.uTime.value = elapsed.current;
      cliff.current.uniforms.uWind.value = values.wind;
    }
  });
  return <>
    <mesh position={[0, -viewport.height * 0.39, 2.86]} renderOrder={15}>
      <planeGeometry args={[viewport.width * 1.16, viewport.height * 0.32]} />
      <shaderMaterial ref={ground} transparent depthWrite={false} toneMapped={false}
        uniforms={{ uWet: { value: 0 }, uTime: { value: 0 } }}
        vertexShader={`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`
          varying vec2 vUv; uniform float uWet; uniform float uTime;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          void main(){
            float feather=smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,1.-vUv.x)*smoothstep(0.,.2,vUv.y)*smoothstep(0.,.16,1.-vUv.y);
            float pools=smoothstep(.68,.94,sin(vUv.x*31.+sin(vUv.y*8.))*0.5+0.5);
            float glint=smoothstep(.91,.995,hash(floor(vUv*vec2(70.,18.))+floor(uTime*2.)));
            vec3 wet=mix(vec3(.015,.035,.052),vec3(.2,.34,.39),pools*.42+glint*.38);
            gl_FragColor=vec4(wet,(.1+pools*.08+glint*.12)*uWet*feather);
          }
        `} />
    </mesh>
    {!mobile && <mesh position={[viewport.width * 0.35, viewport.height * 0.02, 2.82]} renderOrder={15}>
      <planeGeometry args={[viewport.width * 0.34, viewport.height * 0.78]} />
      <shaderMaterial ref={cliff} transparent depthWrite={false} toneMapped={false}
        uniforms={{ uWet: { value: 0 }, uTime: { value: 0 }, uWind: { value: 0.1 } }}
        vertexShader={`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`
          varying vec2 vUv; uniform float uWet; uniform float uTime; uniform float uWind;
          float hash(float n){return fract(sin(n)*43758.5453);}
          void main(){
            float column=floor(vUv.x*28.); float lane=fract(vUv.x*28.);
            float chosen=step(.79,hash(column));
            float trail=smoothstep(.14,.02,abs(lane-.5))*chosen;
            float flow=fract(vUv.y*1.7+uTime*(.12+uWind*.18)+hash(column)*.8);
            float water=trail*smoothstep(.8,.18,flow)*smoothstep(0.,.18,flow);
            float irregular=smoothstep(.18,.72,sin(vUv.y*11.+hash(column)*7.)*.5+.5);
            float feather=smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,1.-vUv.x)*smoothstep(0.,.12,vUv.y)*smoothstep(0.,.14,1.-vUv.y);
            gl_FragColor=vec4(.34,.48,.52,water*irregular*uWet*.15*feather);
          }
        `} />
    </mesh>}
  </>;
}

export function WeatherEffects({ active, mobile }: { active: boolean; mobile: boolean }) {
  return <>
    <SurfaceRainResponse active={active} mobile={mobile} />
    <RainSystem active={active} mobile={mobile} />
    <RainImpacts active={active} mobile={mobile} />
  </>;
}
