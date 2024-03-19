export function meshToObj3D(group,instances){
    let g = new THREE.Group()
    let newInst = instances.map((e,i)=>{
      let ca = group.children[i]
      let sg = new THREE.Group()
      sg.position.copy(ca.position.clone())
      sg.rotation.copy(ca.rotation.clone())
      g.add(sg)
      return e.map((f,j)=>{
        var q = new THREE.Object3D()
        q.position.copy(f.plane.position.clone())
        f.nodeColor = f.plane.material.colorNode
        f.nodePosition = f.plane.material.positionNode
  
        //console.log(ca.children)
        //ca.children[j].removeFromParent()
        sg.add(q)
        f.plane = q
        return f
      })
    })
    return {g,newInst}
  }