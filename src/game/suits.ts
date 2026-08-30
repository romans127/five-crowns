export const SUITS = [
  { id: 'star', symbol: '★', name: 'stars', tone: 'gold' as const },
  { id: 'heart', symbol: '♥', name: 'hearts', tone: 'red' as const },
  { id: 'club', symbol: '♣', name: 'clubs', tone: 'blue' as const },
  { id: 'spade', symbol: '♠', name: 'spades', tone: 'blue' as const },
  { id: 'diamond', symbol: '♦', name: 'diamonds', tone: 'red' as const },
] as const

export type SuitId = (typeof SUITS)[number]['id']

export function suitForHand(handIndex: number): (typeof SUITS)[number] {
  return SUITS[handIndex % SUITS.length]!
}
