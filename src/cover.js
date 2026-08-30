/** This method is the "ReDraw" called affter a page resize */
cover.r = ()=> {
  ctx = getCtx(cover);

  ctx.fillStyle = '#621';
  ctx.fillRect(cover.width/2, 0, cover.width, cover.height);

  ctx.textAlign = 'center';
  ctx.strokeStyle = '#300';
  ctx.fillStyle = '#551200';

  ctx.lineWidth = unt/5;
  ctx.font = `bold ${12*unt}px cursive`;
  ctx.fillText("Rino", cover.width*.75+unt/4, cover.height*.40+unt/4);
  ctx.strokeText("Rino", cover.width*.75, cover.height*.40);

  ctx.lineWidth = unt/7;
  ctx.font = `bold ${4.5*unt}px cursive`;
  ctx.fillText("Search for Love", cover.width*.75+unt/6, cover.height*.55+unt/5);
  ctx.strokeText("Search for Love", cover.width*.75, cover.height*.55);

  ClassRino(60, 30, 1, ['300', .2, '60180A']).d();

  ctx.lineWidth = unt/5;
  const cbm = 2*unt // Cover Border Margin
  ctx.beginPath();
  ctx.setLineDash([unt/2]);
  ctx.roundRect(cover.width/2+cbm, cbm, cover.width/2-cbm*2, cover.height-cbm*2, cbm);
  ctx.stroke();

}

setZoom(1);
