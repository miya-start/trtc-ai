import TRTC, { LocalStream } from 'trtc-js-sdk'

let cameraSelect: HTMLSelectElement
let deviceId: string
let localStream: LocalStream

function setDeviceId(event: Event) {
  deviceId = (event.target as HTMLSelectElement).value
}
export function generateCameraOption() {
  cameraSelect = document.getElementById('cameraSelect') as HTMLSelectElement
  cameraSelect.innerHTML = ''
  TRTC.getCameras().then((devices) => {
    deviceId = devices[0].deviceId
    devices.forEach((dev) => {
      const option = document.createElement('option')
      option.value = dev.deviceId
      option.text = dev.label
      cameraSelect.appendChild(option)
    })
  })

  cameraSelect.addEventListener('change', setDeviceId, { passive: true })
}

function switchDevice() {
  localStream.switchDevice('video', deviceId)
}
export function switchCamera(localStream: LocalStream) {
  localStream = localStream
  localStream.switchDevice('video', deviceId)
  cameraSelect.addEventListener('change', switchDevice, { passive: true })
}

export function removeCameraListener() {
  cameraSelect.removeEventListener('change', setDeviceId)
  cameraSelect.removeEventListener('change', switchDevice)
}
