import fs from 'node:fs/promises';
const rate = 16000, length = rate * 12, overlap = 1600;
const types = ['rain','cafe','fireplace','forest','ocean','white','brown'];
for (const [index,type] of types.entries()) {
  let seed = 9384 + index * 781, low = 0, slow = 0;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
  const samples = new Float32Array(length + overlap);
  for (let i = 0; i < samples.length; i++) {
    const t = i / rate, noise = random(); low = low * .965 + noise * .035; slow = slow * .997 + noise * .003;
    let value;
    if (type === 'white') value = noise * .15;
    if (type === 'brown') value = low * 1.4;
    if (type === 'rain') value = noise * .10 + low * .45 + (Math.abs(noise) > .998 ? noise * .08 : 0);
    if (type === 'ocean') value = (low * .9 + noise * .035) * (.65 + .35 * Math.sin(2*Math.PI*t/6));
    if (type === 'fireplace') value = low * .8 + (Math.abs(noise) > .994 ? noise * .15 : noise * .012);
    if (type === 'forest') { const chirp = Math.max(0,Math.sin(2*Math.PI*t/3)) ** 25; value = low*.4 + noise*.012 + chirp*.07*Math.sin(2*Math.PI*(1800*t+95*Math.sin(t*19))); }
    if (type === 'cafe') value = low*.6 + slow*1.5 + .012*Math.sin(2*Math.PI*180*t)*Math.sin(t*3.5) + .008*Math.sin(2*Math.PI*330*t)*Math.sin(t*5.2);
    samples[i] = value;
  }
  const bytes = Buffer.alloc(44 + length * 2); bytes.write('RIFF',0); bytes.writeUInt32LE(bytes.length-8,4); bytes.write('WAVEfmt ',8); bytes.writeUInt32LE(16,16); bytes.writeUInt16LE(1,20); bytes.writeUInt16LE(1,22); bytes.writeUInt32LE(rate,24); bytes.writeUInt32LE(rate*2,28); bytes.writeUInt16LE(2,32); bytes.writeUInt16LE(16,34); bytes.write('data',36); bytes.writeUInt32LE(length*2,40);
  for(let i=0;i<length;i++){const w=i/overlap;const value=i<overlap?samples[length+i]*(1-w)+samples[i]*w:samples[i];bytes.writeInt16LE(Math.round(Math.max(-.95,Math.min(.95,value))*32767),44+i*2);}
  await fs.writeFile(`assets/sounds/${type}.wav`,bytes);
}
const topics = ['a small kindness','a comforting routine','a person who listened','a moment outside','something you learned','a meal you enjoyed','a place that felt peaceful','a helpful conversation','a small piece of progress','a good memory','a sound you enjoyed','something your body helped you do','a thoughtful message','a problem that became easier','a moment of laughter','a book or story','a useful tool','something you noticed on a walk','a chance to rest','a task you finished','someone you appreciate','a small act of courage','a familiar comfort','a beautiful color','an unexpected opportunity'];
const prompts=topics.flatMap(topic=>[`What made ${topic} meaningful to you today?`,`What would you like to remember about ${topic}?`,`How did ${topic} make your day a little different?`,`When you think about ${topic}, what are you grateful for?`]);
await fs.writeFile('data/prompts.json',JSON.stringify(prompts,null,2)+'\n');
console.log('Generated seven original seamless sound beds and 100 original journal prompts.');
