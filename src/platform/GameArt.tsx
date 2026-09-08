import { CrownMark, SuitRow } from '../components/Suits.tsx'
import { CribbageMark } from '../games/cribbage/Brand.tsx'
import { FarkleMark } from '../games/farkle/Brand.tsx'
import { GinMark } from '../games/gin-rummy/Brand.tsx'
import { HeartsMark } from '../games/hearts/Brand.tsx'
import { PhaseMark } from '../games/phase10/Brand.tsx'
import { QwixxMark } from '../games/qwixx/Brand.tsx'
import { DealMark } from '../games/monopoly-deal/Brand.tsx'
import { SorryMark } from '../games/sorry/Brand.tsx'
import { TtrMark } from '../games/ticket-to-ride/Brand.tsx'
import { SequenceMark } from '../games/sequence/Brand.tsx'
import { UnoCardColors, UnoMark } from '../games/uno/Brand.tsx'
import { DiceRow } from '../games/yahtzee/Brand.tsx'
import type { GameId } from './types.ts'

export function GameArt({ id }: { id: GameId }) {
  switch (id) {
    case 'five-crowns':
      return (
        <span className="game-art game-art--five-crowns">
          <CrownMark />
          <SuitRow size="sm" />
        </span>
      )
    case 'phase-10':
      return (
        <span className="game-art game-art--phase-10">
          <PhaseMark />
        </span>
      )
    case 'uno':
      return (
        <span className="game-art game-art--uno">
          <UnoMark />
          <UnoCardColors size="sm" />
        </span>
      )
    case 'yahtzee':
      return (
        <span className="game-art game-art--yahtzee">
          <DiceRow values={[5, 6, 5]} variant="red" size="sm" />
        </span>
      )
    case 'cribbage':
      return (
        <span className="game-art game-art--cribbage">
          <CribbageMark />
        </span>
      )
    case 'hearts':
      return (
        <span className="game-art game-art--hearts">
          <HeartsMark />
        </span>
      )
    case 'gin-rummy':
      return (
        <span className="game-art game-art--gin-rummy">
          <GinMark />
        </span>
      )
    case 'farkle':
      return (
        <span className="game-art game-art--farkle">
          <FarkleMark />
        </span>
      )
    case 'qwixx':
      return (
        <span className="game-art game-art--qwixx">
          <QwixxMark />
        </span>
      )
    case 'monopoly-deal':
      return (
        <span className="game-art game-art--monopoly-deal">
          <DealMark />
        </span>
      )
    case 'sorry':
      return (
        <span className="game-art game-art--sorry">
          <SorryMark />
        </span>
      )
    case 'ticket-to-ride':
      return (
        <span className="game-art game-art--ticket-to-ride">
          <TtrMark />
        </span>
      )
    case 'sequence':
      return (
        <span className="game-art game-art--sequence">
          <SequenceMark />
        </span>
      )
    default: {
      const _never: never = id
      return _never
    }
  }
}
