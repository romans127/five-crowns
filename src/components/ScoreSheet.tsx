import { playerColor, playerTotal } from '../game/engine.ts'
import { cardsDealt } from '../game/rules.ts'
import { HAND_SIZES, type Game } from '../game/types.ts'

export function ScoreSheet({ game }: { game: Game }) {
  return (
    <div className="score-sheet-grid-wrap">
      <table className="score-sheet-grid">
        <thead>
          <tr>
            <th scope="col">Player</th>
            {HAND_SIZES.map((size, index) => (
              <th key={size} scope="col">
                <span className="sheet-hand">{index + 1}</span>
                <span className="sheet-deal">{size}</span>
              </th>
            ))}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {game.players.map((player) => {
            const color = playerColor(player)
            return (
              <tr key={player.id}>
                <th scope="row">
                  <span style={{ color: color.hex }}>{player.name}</span>
                </th>
                {HAND_SIZES.map((size, index) => {
                  const value = game.scores[index]?.[player.id]
                  return (
                    <td key={size} className={typeof value !== 'number' ? 'sheet-empty' : ''}>
                      {typeof value === 'number' ? value : '—'}
                    </td>
                  )
                })}
                <td className="sheet-total">{playerTotal(game, player.id)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="hint sheet-footnote">Hand numbers show cards dealt ({cardsDealt(0)} through {cardsDealt(10)}).</p>
    </div>
  )
}
