/**
 @function
 @arg {number} L - left
 @arg {number} R - rigth
 @arg {number} T - top
 @arg {number} B - bottom
 @arg {number} z - Z Plan
 @arg {string} k - G=grass R=rocky
 */
const ClassFloor = (L,R,T,B,z=1,k='G')=> ({
  K: 'T', // Klass: Terrain
  L,R,T,B,z,k,
  /** Draw */
  d() {
    let t = Date.now() % 3000 / 3000;
    let v = Math.sin(t*Math.PI*2); // Wind
    const {L,R,T,B,z,k} = this
    style();
    const gradient = ctx.crLGt(0, T-camera.y, 0, B-camera.y);
    // Add three color stops
    gradient.addColorStop(0, '#999');
    gradient.addColorStop(1, '#EEE0');
    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;

    let w = 5-z/2; // Grass Width
    let pathGrass = Array.from({length: (R-L)*w+1}, (_,i) => {
      let h = ( i%9 + i%7 ) / 15 // Grass Heigth Increment
      return i%2==0 ? [L+i/w,T+.2] :
      !(i%3||i%7) ? [L+i/w,T+.2] :
      !(i%3||i%5) ? [L+i/w,T+.1] :
      [L+i/w+(v*h*((i%5+i%3)/8))/1.5,T-.5-h]
    }).flat()
    let path = mkPath(
      ...pathGrass,
      R,B, L,B, 'z'
    );
    ctx.fill(mkPath(...pathGrass, R,B, L,B));
    ctx.stroke(mkPath(...pathGrass));

    // style('f004',.3,'0000');
    // ctx.Q(L,T,R-L,B-T);
  }
})
