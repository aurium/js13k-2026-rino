const ClassWater = (L,R,T,B,z=1)=> ({
  K: 'W', // Klass: Water
  L,R,T,B,z,
  x: (L+R)/2,
  C: ['#999C', '#EEE0'],
  /** Draw */
  d() {
    let t = Date.now() % 5000 / 5000;
    let v = sin(t*halfTurn*2); // Wave
    const {L,R,T,B,z,C} = this
    style();
    const gradient = ctx.crLGt(0, T-camera.y, 0, B-camera.y);
    // Add three color stops
    gradient.addColorStop(0, C[0]);
    gradient.addColorStop(1, C[1]);
    // Set the fill style and draw a rectangle
    ctx.fillStyle = gradient;

    let size = R-L;
    let w = size/floor(size/3); // Wave length
    const path =
      `M${untZ(L-camera.x)},${untZ(T-camera.y+.5)}` +
      Array.from({length: (size)/w}, (_,i) => {
        return 'C' +
        untZ(L+ i   *w-camera.x+1+v/2)+','+untZ(T-camera.y+1)+' '+
        untZ(L+(i+1)*w-camera.x-1+v/2)+','+untZ(T-camera.y+1)+' '+
        untZ(L+(i+1)*w-camera.x  +v)+','+untZ(T-camera.y)
      }).join('');

    ctx.fill(new Path2D(
      path +
      `L${untZ(R-camera.x)},${untZ(B-camera.y)}L${untZ(L-camera.x)},${untZ(B-camera.y)}`
    ));
    ctx.stroke(new Path2D(path));

    // ctx.fillStyle = '#F008';
    // ctx.fiRt(L-camera.x, T-camera.y, R-L, B-T);
  }
})
