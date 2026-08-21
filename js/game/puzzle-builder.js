window.Suji=window.Suji||{}; window.Suji.game=window.Suji.game||{};
window.Suji.game.makePieces=function(seed,sudoku){
 const {mulberry32,shuffle}=window.Suji.core.utils; const pattern=window.Suji.data.patterns.sujiPatternForLevel(seed);
 const raw=pattern.pieces.map((def,id)=>({id,type:def.type,cells:def.cells.map(([r,c])=>[r,c]),home:{r:def.home[0],c:def.home[1]},patternId:pattern.id}));
 raw.forEach(p=>{p.tiles=p.cells.map(([dr,dc])=>({dr,dc,srcR:p.home.r+dr,srcC:p.home.c+dc,n:sudoku[p.home.r+dr][p.home.c+dc]}));});
 const rng=mulberry32((seed^0x9e3779b9)>>>0); const shuffled=shuffle(raw,rng); shuffled.forEach((p,i)=>p.rackIndex=i); return shuffled;
};
