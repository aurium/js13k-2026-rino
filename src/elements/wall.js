/**
 @function
 @arg {number} L - left
 @arg {number} R - rigth
 @arg {number} T - top
 @arg {number} B - bottom
 @arg {number} z - Z Plan
 */
const ClassWall = (L,R,T,B,z=1,drawTop)=> ({
  K: 'W', // Klass: Wall
  L,R,T,B,z,
  x: (L+R)/2,
  /** Draw */
  d() {
    const {L,R,T,B,z} = this
    style();
    const gradient = ctx.crLGt(L-camera.x, 0, R-camera.x, 0);
    // Add three color stops
    gradient.addColorStop(0, '#AAA');
    gradient.addColorStop(.5, '#888');
    gradient.addColorStop(1, '#AAA');
    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;

    let w = 3; // Texture Width
    let pathLeft = [];
    let pathRight = Array.from({length: (B-T)*w+1}, (_,i) => {
      let h = ( i%4 + (i-999)%5 ) / 30 // Texture Heigth Increment
      pathLeft[i]=[ L+h, B-i/w ]
      return [ R+h, T+i/w ]
    }).flat()
    pathLeft.push(L,T)
    pathRight.push(R,B)
    let pathTop = drawTop ? Array.from({length: (R-L)*w+1}, (_,i) => {
      let h = ( i%4 + (i-999)%5 ) / 15 // Texture Heigth Increment
      return [ L+i/w, T+h ]
    }).flat() : []
    ctx.fill(mkPath(...pathLeft.flat(), ...pathTop, ...pathRight));
    ctx.stroke(mkPath(...pathLeft.flat()));
    if (pathTop) ctx.stroke(mkPath(...pathTop));
    ctx.stroke(mkPath(...pathRight));
    // ctx.fillStyle = '#F004'
    // ctx.fiRt(L-camera.x,T-camera.y, R-L, B-T);
  }
})
