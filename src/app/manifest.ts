export default function manifest() {
  return {
    name: '풍문 자동 설문 플랫폼',
    short_name: '풍문 설문',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: '512x512' }
    ]
  } as const;
}


