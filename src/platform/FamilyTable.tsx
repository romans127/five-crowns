import { Alert, ListRow, ListSection, TextField } from '@ios27_design_system/react'
import { useState } from 'react'
import { GlassButton, PrimaryButton } from './IosChrome.tsx'
import { SceneShell } from './SceneNav.tsx'
import {
  formatTableId,
  getHouseholdId,
  isUuidTableId,
  joinTable,
  normalizeTableId,
  pinNewTable,
  shareableTableId,
  TABLE_ID_ERROR,
} from './household.ts'

type FamilyTableProps = {
  onBack: () => void
}

type PendingPin = { type: 'create' } | { type: 'join'; id: string }

const SWITCH_MESSAGE =
  'Cloud history and leaderboards will follow the new table. Games saved on this phone stay on this phone.'

export function FamilyTableScreen({ onBack }: FamilyTableProps) {
  const [tableId, setTableId] = useState(() => getHouseholdId())
  const [joinInput, setJoinInput] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState<PendingPin | null>(null)

  const shareId = shareableTableId(tableId)
  const formatted = formatTableId(tableId)

  const copyTableId = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        return
      }
      await navigator.clipboard.writeText(shareId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const requestCreate = () => {
    setJoinError(null)
    setPending({ type: 'create' })
  }

  const requestJoin = () => {
    const normalized = normalizeTableId(joinInput)
    if (!normalized) {
      setJoinError(TABLE_ID_ERROR)
      return
    }
    if (normalized === tableId) {
      setJoinError(null)
      setJoinInput('')
      return
    }
    setJoinError(null)
    setPending({ type: 'join', id: normalized })
  }

  const applyPending = () => {
    if (!pending) {
      return
    }
    switch (pending.type) {
      case 'create': {
        setTableId(pinNewTable())
        setJoinInput('')
        break
      }
      case 'join': {
        const result = joinTable(pending.id)
        if (result.ok) {
          setTableId(result.id)
          setJoinInput('')
        } else {
          setJoinError(result.error)
        }
        break
      }
      default: {
        const _never: never = pending
        return _never
      }
    }
    setPending(null)
  }

  const alertTitle = pending?.type === 'create' ? 'Start a new family table?' : 'Switch family table?'
  const alertMessage =
    pending?.type === 'join'
      ? `This phone will pin to ${formatTableId(pending.id)}. ${SWITCH_MESSAGE}`
      : SWITCH_MESSAGE

  return (
    <SceneShell
      className="family-table-screen"
      nav={{
        back: { label: 'Game Night', onClick: onBack },
        title: 'Family table',
        subtitle: 'Household pin for cloud history',
      }}
    >
      <div className="hero-block family-table-hero">
        <p className="eyebrow">Pinned on this phone</p>
        <p className={`table-code-hero${isUuidTableId(tableId) ? ' is-legacy' : ''}`}>{formatted}</p>
        <p className="tagline">
          {isUuidTableId(tableId)
            ? 'This table still uses the original household ID so existing cloud games stay attached. Copy it to join from another phone.'
            : 'Text this code to the household. Every game on this phone syncs to the same family table.'}
        </p>
      </div>

      <ListSection header="This device" footer="Cloud sync uses this pin. Past games on this phone stay on this phone.">
        <ListRow separator={false} trailing={copied ? 'Copied' : 'Copy'} onClick={() => void copyTableId()}>
          Copy table ID
        </ListRow>
      </ListSection>

      <ListSection
        header="Join another table"
        footer="Use a 6-character code, or paste a full table ID from a phone that already has history in the cloud."
      >
        <ListRow separator={false}>
          <TextField
            label="Table code"
            value={joinInput}
            onChange={(value) => {
              setJoinInput(value)
              if (joinError) {
                setJoinError(null)
              }
            }}
            placeholder="K7M 3PQ"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            clearable
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                requestJoin()
              }
            }}
          />
        </ListRow>
      </ListSection>

      {joinError ? (
        <p className="hint" role="status">
          {joinError}
        </p>
      ) : null}

      <div className="family-table-actions">
        <PrimaryButton onClick={requestJoin}>Join table</PrimaryButton>
        <GlassButton onClick={requestCreate}>Create a new table</GlassButton>
      </div>

      <Alert
        open={pending !== null}
        onChange={(open) => {
          if (!open) {
            setPending(null)
          }
        }}
        title={alertTitle}
        message={alertMessage}
        actions={[
          { label: 'Cancel', style: 'cancel', onClick: () => setPending(null) },
          {
            label: pending?.type === 'create' ? 'Create table' : 'Switch table',
            onClick: applyPending,
          },
        ]}
      />
    </SceneShell>
  )
}
