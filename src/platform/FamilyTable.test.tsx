import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { FamilyTableScreen } from './FamilyTable.tsx'
import { HOUSEHOLD_KEY, getHouseholdId } from './household.ts'

describe('Family table screen', () => {
  beforeEach(() => {
    cleanup()
    localStorage.setItem(HOUSEHOLD_KEY, 'K7M3PQ')
  })

  it('shows the pinned table and joins another after confirm', async () => {
    const user = userEvent.setup()
    render(<FamilyTableScreen onBack={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'Family table' })).toBeInTheDocument()
    expect(screen.getByText('K7M 3PQ')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Table code'), 'abc234')
    await user.click(screen.getByRole('button', { name: 'Join table' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Switch family table?' })
    expect(dialog).toHaveTextContent(/ABC 234/)
    await user.click(screen.getByRole('button', { name: 'Switch table' }))

    expect(screen.getByText('ABC 234')).toBeInTheDocument()
    expect(getHouseholdId()).toBe('ABC234')
  })

  it('keeps the pin when the switch is cancelled', async () => {
    const user = userEvent.setup()
    render(<FamilyTableScreen onBack={() => undefined} />)

    await user.type(screen.getByLabelText('Table code'), 'ABC234')
    await user.click(screen.getByRole('button', { name: 'Join table' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(getHouseholdId()).toBe('K7M3PQ')
    expect(screen.getByText('K7M 3PQ')).toBeInTheDocument()
  })

  it('creates a new table after confirm', async () => {
    const user = userEvent.setup()
    render(<FamilyTableScreen onBack={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'Create a new table' }))
    expect(screen.getByRole('alertdialog', { name: 'Start a new family table?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Create table' }))

    const next = getHouseholdId()
    expect(next).not.toBe('K7M3PQ')
    expect(screen.queryByText('K7M 3PQ')).not.toBeInTheDocument()
  })

  it('rejects an invalid join without opening the switch alert', async () => {
    const user = userEvent.setup()
    render(<FamilyTableScreen onBack={() => undefined} />)

    await user.type(screen.getByLabelText('Table code'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Join table' }))

    expect(screen.getByRole('status')).toHaveTextContent(/6-character table code/i)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(getHouseholdId()).toBe('K7M3PQ')
  })
})
