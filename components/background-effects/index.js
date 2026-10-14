let canvas,context,frame,last=0,options,color,size=0,particles=[];
const random=()=>Math.random();
function resize(){if(!canvas)return;canvas.width=innerWidth;canvas.height=innerHeight;particles=Array.from({length:Math.round(options.intensity*1.5)},()=>({x:random()*canvas.width,y:random()*canvas.height,speed:.5+random()*2,radius:.5+random()*size}));draw(0);}
function draw(time){if(!context)return;context.clearRect(0,0,canvas.width,canvas.height);context.fillStyle=context.strokeStyle=color;const delta=last?Math.min(32,time-last):16;last=time;
 for(const p of particles){if(options.type==='starfield'){context.globalAlpha=.35+Math.abs(Math.sin(time/3000+p.x))*.65;}else context.globalAlpha=.65;context.beginPath();if(options.type==='rain'){context.moveTo(p.x,p.y);context.lineTo(p.x-size,p.y+size*4);context.stroke();}else{context.arc(p.x,p.y,p.radius,0,Math.PI*2);context.fill();}if(!options.static){p.y=(p.y+p.speed*delta/(options.type==='rain'?4:20))%canvas.height;if(options.type!=='rain')p.x=(p.x+Math.sin(p.y/100)*.15+canvas.width)%canvas.width;}}
 context.globalAlpha=1;if(!options.static&&!document.hidden)frame=requestAnimationFrame(draw);
}
function visibility(){cancelAnimationFrame(frame);last=0;if(!document.hidden&&options?.type!=='none')draw(0);}
/** Scenic canvas is decorative, bounded, and never runs while hidden. */
export function apply(value,reduced){options={...value,static:reduced};cancelAnimationFrame(frame);if(value.type==='none'||!value.intensity){destroy();return;}if(!canvas){canvas=document.createElement('canvas');canvas.className='background-atmosphere';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);context=canvas.getContext('2d');addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);}const style=getComputedStyle(document.documentElement);color=style.getPropertyValue('--ambient-ink').trim();size=parseFloat(style.getPropertyValue('--effect-particle-size'))||2;resize();}
export function destroy(){cancelAnimationFrame(frame);canvas?.remove();canvas=null;context=null;removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);}
