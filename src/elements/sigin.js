// x,y is the flor poin to fix.
const ClassSign = (x,y,text,z=1)=> {
  let lines = text.split('\n').reverse(), lineH = 1.3;
  return {
    K: 'S', // Klass: Sign
    B: y,
    L: x-4,
    R: x+4,
    z,
    /** Draw */
    d() {
      style();
      ctx.textAlign = 'center';
      ctx.font = `bold ${unt}px sans-serif`;
      let w = max(...lines.map((line, i)=> ctx.measureText(line).width / unt + z));
      ctx.sae();
      ctx.tre(x-camera.x,this.B-camera.y);
      ctx.rotate(.2);
      ctx.fiRt(-.3, -2, .6, 2.2);
      ctx.stRt(-.3, -2, .6, 2.2);
      ctx.fiRt(-w/2, -3-lineH*lines.length, w, 1+lineH*lines.length);
      ctx.stRt(-w/2, -3-lineH*lines.length, w, 1+lineH*lines.length);
      ctx.fillStyle = '#000';
      lines.map((line, i)=> ctx.fiTt(line, 0, -2.8-lineH*i));
      ctx.ree();
    }
  };
}
