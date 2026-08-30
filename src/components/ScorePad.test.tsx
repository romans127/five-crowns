import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScorePad } from './ScorePad.tsx'

describe('ScorePad', () => {
  it('shows the round card limit and blocks extra tap-cards', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <ScorePad
        playerName="Ryan"
        playerColor="#fff"
        handIndex={0}
        currentScore={null}
        onSave={onSave}
        onClose={() => undefined}
      />,
    )

    expect(screen.getByText(/up to 3 cards/i)).toBeInTheDocument()
    expect(screen.getByText('0 / 3 cards')).toBeInTheDocument()

    const pad = screen.getByRole('dialog', { name: /leftovers this hand/i })
    const sevens = within(pad).getAllByRole('button', { name: /7/i })
    const rankSeven = sevens.find((button) => button.classList.contains('playing-card'))
    expect(rankSeven).toBeDefined()

    await user.click(rankSeven!)
    await user.click(rankSeven!)
    await user.click(rankSeven!)
    expect(screen.getByText('3 / 3 cards')).toBeInTheDocument()

    await user.click(rankSeven!)
    expect(screen.getByText('3 / 3 cards')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })
})
