/** La escarcha dispersa el reflejo y las fisuras conservan profundidad oscura.
 * No hay ondas ni desplazamiento temporal: el hielo permanece sólido aunque
 * el resto del escenario siga animándose. Comparte una sola captura planar. */
export const frozenIceFragmentShader = /* glsl */`
  uniform sampler2D uRipples;
  uniform sampler2D uIce;
  uniform sampler2D uReflection;
  uniform vec3 uColor;
  uniform float uHasReflection;
  uniform float uRadius;
  varying vec3 vWorld;
  varying vec4 vReflection;
  #include <fog_pars_fragment>
  void main() {
    vec3 field = texture2D(uIce, vWorld.xz * 0.071).rgb;
    vec2 slope = (texture2D(uRipples, vWorld.xz * 0.12).rg - 0.5) * 0.055;
    vec3 normal = normalize(vec3(slope.x, 1.0, slope.y));
    vec3 view = normalize(cameraPosition - vWorld);
    float fresnel = 0.12 + 0.62 * pow(1.0 - max(dot(view, normal), 0.0), 5.0);
    vec3 color = mix(uColor, vec3(0.32, 0.4, 0.45), field.g * 0.58);
    color = mix(color, uColor * 0.24, field.r * 0.68);
    color += vec3(0.07, 0.1, 0.12) * field.b * 0.4;
    if (uHasReflection > 0.5 && vReflection.w > 0.0) {
      vec2 uv = vReflection.xy / vReflection.w + slope * 0.004;
      vec3 reflected = texture2D(uReflection, clamp(uv, 0.001, 0.999)).rgb;
      color = mix(color, reflected, fresnel * (1.0 - field.g * 0.7 - field.r * 0.2));
    }
    vec3 moon = normalize(vec3(-0.35, 0.65, -0.68));
    float glint = pow(max(dot(reflect(-moon, normal), view), 0.0), 100.0);
    color += vec3(0.28, 0.37, 0.45) * glint * (1.0 - field.g) * 0.18;
    float alpha = 1.0 - smoothstep(uRadius * 0.73, uRadius, length(vWorld.xz));
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`
