/** Adapter for future sponsored/quiz-unlocked puzzle packs. */
export function createSponsoredLevel({id,number,puzzle,artwork,rules={},progression={},metadata={}}){
  return Object.freeze({id,number,type:'sponsored',puzzle,artwork,rules:Object.freeze({hintsAllowed:true,rotationsAllowed:false,...rules}),progression,metadata});
}
