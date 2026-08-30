import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlayingCard } from './PlayingCard.tsx'

describe('PlayingCard', () => {
  it('renders a round card with deal count and wild rank', () => {
    render(<PlayingCard face={13} suitId="star" size="xs" wild dealCount={13} active onClick={() => undefined} />)
    expect(screen.getByRole('button', { name: /K of stars, wild, 13 cards dealt/i })).toBeInTheDocument()
  })

  it('renders a joker card for leftover entry', () => {
    render(<PlayingCard face="joker" size="sm" wild pointsLabel="50" onClick={() => undefined} />)
    expect(screen.getByRole('button', { name: /Joker, 50/i })).toBeInTheDocument()
  })
})
