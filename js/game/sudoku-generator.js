window.Suji=window.Suji||{}; window.Suji.game=window.Suji.game||{};
window.Suji.game.makeSudoku=function(seed){
 const {mulberry32,shuffle}=window.Suji.core.utils; const rng=mulberry32(seed*2654435761>>>0);
 const base=(r,c)=>(r*3+Math.floor(r/3)+c)%9; let digits=shuffle([1,2,3,4,5,6,7,8,9],rng);
 let bands=shuffle([0,1,2],rng),stacks=shuffle([0,1,2],rng);
 let rows=bands.flatMap(b=>shuffle([0,1,2],rng).map(x=>b*3+x)); let cols=stacks.flatMap(s=>shuffle([0,1,2],rng).map(x=>s*3+x));
 let grid=rows.map(r=>cols.map(c=>digits[base(r,c)])); if(rng()>.5) grid=grid[0].map((_,c)=>grid.map(row=>row[c])); return grid;
};
