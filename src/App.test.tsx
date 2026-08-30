import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('Five Crowns scorekeeper', () => {
  it('starts a game, records leftovers, and opens the rules', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Five Crowns' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /deal a new game/i }))
    await user.type(screen.getByLabelText('Player 1 name'), 'Ryan')
    await user.type(screen.getByLabelText('Player 2 name'), 'Ada')
    await user.click(screen.getByRole('button', { name: /shuffle up and deal/i }))

    expect(screen.getByRole('heading', { name: /3s are wild/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ryan/i }))
    const pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    await user.click(within(pad).getByRole('button', { name: /^9/ }))
    await user.click(within(pad).getByRole('button', { name: /lock in 9/i }))
    expect(screen.getByRole('button', { name: /ryan.*total 9/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Rules' }))
    expect(screen.getByRole('heading', { name: /how five crowns works/i })).toBeInTheDocument()
    expect(screen.getByText(/six jokers/i)).toBeInTheDocument()
    expect(screen.getByText(/kings when 13 cards are dealt/i)).toBeInTheDocument()
  })
})
