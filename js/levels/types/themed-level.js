/** Adapter for future purchasable/unlockable artwork packs. */
export function createThemedLevel({id,number,puzzle,artwork,rules={},progression={},metadata={}}){
  return Object.freeze({id,number,type:'themed',puzzle,artwork,rules:Object.freeze({hintsAllowed:true,rotationsAllowed:false,...rules}),progression,metadata});
}
