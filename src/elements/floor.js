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
  K: 'F', // Klass: Floor
  L,R,T,B,z,k,
  C:['000', '#999', '#EEE0'],
  /** Draw */
  d() {
    let t = Date.now() % 3000 / 3000;
    let v = sin(t*halfTurn*2); // Wind
    const {L,R,T,B,z,k,C} = this
    style(C[0]);
    const gradient = ctx.crLGt(0, T-camera.y, 0, B-camera.y);
    // Add three color stops
    gradient.addColorStop(0, C[1]);
    gradient.addColorStop(1, C[2]);
    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;

    let w = 4.5-z/2; // Grass Width
    let pathGrass = Array.from({length: (R-L)*w+1}, (_,i) => {
      let h = ( i%9 + i%7 ) / 15 // Grass Heigth Increment
      return i%2==0 ? [L+i/w,T+.2] :
      !(i%3||i%7) ? [L+i/w,T+.2] :
      !(i%3||i%5) ? [L+i/w,T+.1] :
      [L+i/w+(v*h*((i%5+i%3)/8))/1.5,T-.5-h]
    }).flat()
    ctx.fill(mkPath(...pathGrass, R,B, L,B));
    ctx.stroke(mkPath(...pathGrass));
  }
})
