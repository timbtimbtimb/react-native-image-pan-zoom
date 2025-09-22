import React, { useCallback, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { Image, PanResponder, View } from 'react-native'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

type Position = {
  x: number
  y: number
}

interface Props {
  source: string
}

export default function ImagePanZoom ({ source }: Props): ReactElement {
  const lastTouchTimestamp = useRef<number>(0)

  const touchesStartSize = useRef<number>(1)
  const startScale = useRef<number>(1)
  const currentScale = useRef<number>(1)
  const [scale, setScale] = useState<number>(1)

  const touchesStartCenter = useRef<Position>({ x: 0, y: 0 })
  const startCenter = useRef<Position>({ x: 0, y: 0 })
  const currentCenter = useRef<Position>({ x: 0, y: 0 })
  const [center, setCenter] = useState<Position>({ x: 0, y: 0 })

  const reset = useCallback((event: GestureResponderEvent): boolean => {
    if (event.nativeEvent.touches.length !== 1) return false
    if (event.timeStamp - lastTouchTimestamp.current > 150) return false

    startScale.current = 1
    currentScale.current = 1
    setScale(1)

    startCenter.current = { x: 0, y: 0 }
    currentCenter.current = { x: 0, y: 0 }
    setCenter({ x: 0, y: 0 })

    return true
  }, [])

  const onPanResponderStart = useCallback((event: GestureResponderEvent) => {
    if (reset(event)) return

    lastTouchTimestamp.current = event.timeStamp

    if (event.nativeEvent.touches.length === 1) {
      touchesStartCenter.current = {
        x: event.nativeEvent.touches[0].pageX,
        y: event.nativeEvent.touches[0].pageY,
      }
    }

    if (event.nativeEvent.touches.length === 2) {
      touchesStartSize.current = getTouchesSize(event)
      touchesStartCenter.current = getTouchesCenter(event)
    }
  }, [])

  const onPanResponderMove = useCallback((event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length === 1) {
      const centerDelta = getTouchesCenterDelta(event, touchesStartCenter.current)
      const scaledCenterDelta = {
        x: (centerDelta.x / currentScale.current),
        y: (centerDelta.y / currentScale.current),
      }

      currentCenter.current = {
        x: startCenter.current.x + scaledCenterDelta.x,
        y: startCenter.current.y + scaledCenterDelta.y,
      }

      setCenter(currentCenter.current)
    }

    if (event.nativeEvent.touches.length === 2) {
      const touchesSize = getTouchesSize(event)
      const ratio = touchesSize / touchesStartSize.current
      currentScale.current = startScale.current * ratio
      setScale(currentScale.current)

      const touchesCenter = getTouchesCenter(event)
      const centerDelta = {
        x: touchesCenter.x - touchesStartCenter.current.x,
        y: touchesCenter.y - touchesStartCenter.current.y,
      }
      currentCenter.current = {
        x: startCenter.current.x + (centerDelta.x / currentScale.current),
        y: startCenter.current.y + (centerDelta.y / currentScale.current),
      }
      setCenter(currentCenter.current)
    }
  }, [])

  const onPanResponderRelease = useCallback((event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length === 1) {
      onPanResponderStart(event)
    }

    startCenter.current = currentCenter.current
    startScale.current = currentScale.current
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderStart,
      onPanResponderMove,
      onPanResponderRelease,
    }),
  )

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
      }}
      {...panResponder.current.panHandlers}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          transform: [
            { scale },
          ],
        }}
      >
        <Image
          src={source}
          style={{
            width: '100%',
            height: '100%',
            transform: [
              { translateX: center.x },
              { translateY: center.y },
            ],
          }}
        />
      </View>
    </View>
  )
}

function getTouchesSize (event: GestureResponderEvent) {
  const [a, b] = event.nativeEvent.touches
  const xDistance = Math.abs(a.pageX - b.pageX)
  const yDistance = Math.abs(a.pageY - b.pageY)
  const diagonal = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
  return diagonal
}

function getTouchesCenter (event: GestureResponderEvent) {
  const [a, b] = event.nativeEvent.touches
  const xCenter = (a.pageX + b.pageX) / 2
  const yCenter = (a.pageY + b.pageY) / 2
  return { x: xCenter, y: yCenter }
}

function getTouchesCenterDelta (event: GestureResponderEvent, touchesStartCenter: Position) {
  const touchesCenter = {
    x: event.nativeEvent.touches[0].pageX,
    y: event.nativeEvent.touches[0].pageY,
  }
  const centerDelta = {
    x: touchesCenter.x - touchesStartCenter.x,
    y: touchesCenter.y - touchesStartCenter.y,
  }

  return centerDelta
}
