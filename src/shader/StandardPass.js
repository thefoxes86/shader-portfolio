import { textures } from "./textures";
import { Vector2 } from "three";

const StandardPass = {
  uniforms: (texture) => {
    return {
      tDiffuse: { value: texture },
      tSize: { value: new Vector2(256, 256) },
      center: { value: new Vector2(0.5, 0.5) },
      angle: { value: 1.57 },
      scale: { value: 1.0 },
    };
  },

  fragmentShader: /* glsl */ `
	uniform vec2 center;
	uniform float angle;
	uniform float scale;
	uniform vec2 tSize;
	
	uniform sampler2D tDiffuse;
	
	varying vec2 vUv;
	
	float pattern() {
		
		float s = sin( angle ), c = cos( angle );
		
		vec2 tex = vUv * tSize - center;
		vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;
		
		return ( sin( point.x ) * sin( point.y ) ) * 4.0;
		
	}
	
	void main() {
		
		vec2 newUv = vUv;
		
		vec4 color = texture2D( tDiffuse, vUv );
		
		gl_FragColor = color;
		
	}
	`,

  vertexShader: /* glsl */ `
	varying vec2 vUv;
	
	void main() {
		
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		
	}
	`,
};

export { StandardPass };
