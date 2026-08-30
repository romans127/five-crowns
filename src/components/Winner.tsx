import { playerColor, standings, winners } from '../game/engine.ts'
import type { Game } from '../game/types.ts'
import { CrownMark, SuitRow } from './Suits.tsx'

type WinnerProps = {
  game: Game
  onPlayAgain: (names: string[]) => void
  onHome: () => void
  onRules: () => void
}

export function Winner({ game, onPlayAgain, onHome, onRules }: WinnerProps) {
  const champs = winners(game)
  const rows = standings(game)
  const title = champs.length > 1 ? 'Shared crown!' : 'The crown is yours'

  return (
    <section className="screen winner-screen">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} className={`speck speck-${index % 5}`} />
        ))}
      </div>
      <SuitRow size="lg" />
      <CrownMark />
      <p className="eyebrow">Kings went wild</p>
      <h1>{title}</h1>
      <p className="champs">
        {champs.map((player) => (
          <span key={player.id} style={{ color: playerColor(player).hex }}>
            {player.name}
          </span>
        ))}
      </p>
      <ol className="final-standings">
        {rows.map((row, index) => (
          <li key={row.player.id}>
            <span className="place">{index + 1}</span>
            <strong style={{ color: playerColor(row.player).hex }}>{row.player.name}</strong>
            <span>{row.total}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn primary"
        onClick={() => onPlayAgain(game.players.map((player) => player.name))}
      >
        Same table, new deal
      </button>
      <button type="button" className="btn ghost" onClick={onHome}>
        Back home
      </button>
      <button type="button" className="btn text" onClick={onRules}>
        Review the rules
      </button>
    </section>
  )
}
