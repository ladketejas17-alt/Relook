export type Hairstyle = {
  id: string
  name: string
  src: string
  gender: string
  category: string
  length: string
}

export const hairstyles: Hairstyle[] = [
  {
    id: 'pompadour',
    name: 'Pompadour',
    src: '/hairstyles/pompadour.jpg',
    gender: 'men',
    category: 'classic',
    length: 'medium',
  },
]