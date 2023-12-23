import React from 'react'
import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ChatProvider } from './hooks/useChat'
import { Experience } from './components/Experience'

const Virtual: React.FC = () => {
  return (
    <div className="bg-gradient-to-t from-pink-400 to-purple-300">
      <Loader />
      <Canvas
        shadows
        camera={{ position: [0, 0, 1], fov: 20 }}
        style={{ width: '50vw', height: '100vh' }}
      >
        <Experience />
      </Canvas>
    </div>
  )
}

export const VirtualWithProvider: React.FC = () => {
  return (
    <ChatProvider>
      <Virtual />
    </ChatProvider>
  )
}
