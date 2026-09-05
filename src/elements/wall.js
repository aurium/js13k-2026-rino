/**
 @function
 @arg {number} L - left
 @arg {number} R - rigth
 @arg {number} T - top
 @arg {number} B - bottom
 @arg {number} z - Z Plan
 */
const ClassWall = (L,R,T,B,z=1)=> ({
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
    let steps = (B-T)*w+1;
    let pathRight = [];
    let pathLeft = Array.from({length: steps}, (_,i) => {
      let h = ( i%4 + (i-999)%5 ) / 30 // Texture Heigth Increment
      pathRight[i]=[ R+h, B-i/w ]
      return [ L+h, T+i/w ]
    }).flat()
    ctx.fill(mkPath(...pathLeft, ...pathRight.flat(), 'z'));
    ctx.stroke(mkPath(...pathLeft));
    //ctx.stroke(mkPath((L+R)/2, T, (L+R)/2, B));
    ctx.stroke(mkPath(...pathRight.flat()));
  }
})
