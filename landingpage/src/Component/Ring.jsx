import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Ring(props) {
  const { nodes, materials } = useGLTF('/the_ring_1_carat.glb')
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.defaultMaterial.geometry}
          material={materials.Thering}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/the_ring_1_carat.glb')