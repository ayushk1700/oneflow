/** Build CSS only from the settings engine's validated gradient values. */
export function gradientCSS(gradient){
  const stops=gradient.stops.map(stop=>`${stop.color} ${stop.position}%`).join(',');
  if(gradient.type==='radial')return `radial-gradient(circle,${stops})`;
  if(gradient.type==='conic')return `conic-gradient(from ${gradient.angle}deg,${stops})`;
  return `linear-gradient(${gradient.angle}deg,${stops})`;
}
