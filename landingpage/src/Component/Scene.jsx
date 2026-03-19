import React,{useRef,useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {Environment,PersectiveCamera,OrbitControls} from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Ring } from './Ring'

gsap.registerPlugin(ScrollTrigger)

const Scene = () => {

    return (
        <>
                <PersectiveCamera fov={75} near={0.1} far={1000} makeDefault position={[0,0,5]} />
                <Environment preset='city' />
                <Ring/>

        </>

    )
}

export default Scene