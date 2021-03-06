import { Vector2 } from "three";

const CustomPass = {
  uniforms: {
    tDiffuse: { value: null },
    tSize: { value: new Vector2(256, 256) },
    center: { value: new Vector2(0.5, 0.5) },
    angle: { value: 1.57 },
    scale: { value: 1.0 },
    time: { value: 0 },
    progress: { value: 0 },
    mouse: { value: new Vector2() },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform vec2 center;
		uniform float angle;
		uniform float scale;
		uniform float time;
		uniform vec2 tSize;
		uniform float progress;
		uniform vec2 mouse;
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

			vec2 centeredUV = 2.*vUv - vec2(1.); 
			newUv = vUv + centeredUV * vec2(0.,1.);

			vec2 p = 2.*vUv - vec2(1.); 

			p += 0.1*cos(scale * 3.*p.yx + time + vec2(1.2,3.4)); 
			p += 0.1*cos(scale * 3.7*p.yx + 1.4*time + vec2(2.2,3.4)); 
			p += 0.1*cos(scale * 5.*p.yx + 2.6*time + vec2(4.2,1.4)); 
			p += 0.3*cos(scale * 7.*p.yx + 3.6*time+ vec2(10.2,3.4)); 


			newUv.x = mix(vUv.x, length(p), progress);
			newUv.y = mix(vUv.y, 0.5, progress);

			vec4 color = texture2D( tDiffuse, newUv );
			vec4 color2 = vec4(mouse.x, time, mouse.y, mouse.y );

			gl_FragColor = color;

		}`,
};

export { CustomPass };
