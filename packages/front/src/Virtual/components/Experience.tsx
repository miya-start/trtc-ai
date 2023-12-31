import React from 'react'
import { CameraControls, ContactShadows, Environment } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Avatar } from './Avatar'

export const Experience: React.FC = () => {
  const cameraControlsRef = useRef<CameraControls | null>(null)
  const cameraZoomed = true

  useEffect(() => {
    cameraControlsRef.current?.setLookAt(0, 2, 5, 0, 1.5, 0)
  }, [])

  useEffect(() => {
    if (cameraZoomed) {
      cameraControlsRef.current?.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true)
    } else {
      cameraControlsRef.current?.setLookAt(0, 2.2, 5, 0, 1.0, 0, true)
    }
  }, [cameraZoomed])
  return (
    <>
      <CameraControls ref={cameraControlsRef} />
      <Environment preset="warehouse" />
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  )
}
