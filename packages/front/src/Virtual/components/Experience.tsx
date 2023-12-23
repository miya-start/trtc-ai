import React from 'react'
import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { Avatar } from './Avatar'

type DotsProps = JSX.IntrinsicElements['group']
const Dots: React.FC<DotsProps> = (props) => {
  const { loading } = useChat()
  const [loadingText, setLoadingText] = useState('')
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return '.'
          }
          return loadingText + '.'
        })
      }, 800)
      return () => clearInterval(interval)
    } else {
      return setLoadingText('')
    }
  }, [loading])
  if (!loading) return null
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={'left'} anchorY={'bottom'}>
        {loadingText}
        <meshBasicMaterial color="black" />
      </Text>
    </group>
  )
}

export const Experience = () => {
  const cameraControlsRef = useRef<CameraControls | null>(null)
  const { cameraZoomed } = useChat()

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
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  )
}
