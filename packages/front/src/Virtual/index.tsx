import React from 'react'
import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'

export const Virtual: React.FC = () => {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)`,
      }}
    >
      <Loader />
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 20 }}
        style={{ width: '50vw' }}
      >
        <Experience />
      </Canvas>
    </div>
  )
}
