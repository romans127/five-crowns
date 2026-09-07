import { HAND_SIZES } from '../game/types.ts'
import { JOKER_POINTS, WILD_POINTS, wildLabel } from '../game/rules.ts'
import { TextButton } from '../platform/IosChrome.tsx'

type RulesProps = {
  onBack: () => void
}

export function Rules({ onBack }: RulesProps) {
  return (
    <section className="screen rules-screen">
      <header className="screen-head">
        <TextButton onClick={onBack}>Back to the table</TextButton>
        <h1>How Five Crowns works</h1>
        <p>Rummy with a fifth suit and a wild that climbs every hand.</p>
      </header>

      <article className="rule-card">
        <h2>The deck</h2>
        <p>
          Two 58-card decks, 116 cards total. Five suits — stars, hearts, clubs, spades, diamonds — each running
          3 through King. No aces, no twos. Six jokers sit in the mix, and they are wild every hand.
        </p>
      </article>

      <article className="rule-card">
        <h2>Eleven hands</h2>
        <p>
          Deal 3 cards in hand 1, then one more card each hand until the last deal is 13. The rotating wild is
          always the rank that matches the deal: 3s when 3 cards are dealt, Kings when 13 cards are dealt.
          Jokers stay wild the whole game.
        </p>
        <ol className="wild-list">
          {HAND_SIZES.map((size, index) => (
            <li key={size}>
              <strong>Hand {index + 1}</strong>
              <span>
                {size} cards · {wildLabel(index)} wild
              </span>
            </li>
          ))}
        </ol>
      </article>

      <article className="rule-card">
        <h2>Books and runs</h2>
        <p>
          A book is three or more of a kind. A run is three or more cards in sequence in the same suit. Wilds and
          jokers can stand in anywhere, and you can use as many as you want. You cannot play onto someone else’s
          melds.
        </p>
      </article>

      <article className="rule-card">
        <h2>A turn</h2>
        <p>
          Draw from the stock or the discard pile, then discard one card. Go out by laying down your whole hand as
          books and/or runs and discarding. Everyone else gets one last turn to meld what they can. Unused cards
          score against you.
        </p>
      </article>

      <article className="rule-card">
        <h2>Scoring leftover cards</h2>
        <ul className="score-legend">
          <li>
            <span>3–10</span>
            <strong>Face value</strong>
          </li>
          <li>
            <span>Jack</span>
            <strong>11</strong>
          </li>
          <li>
            <span>Queen</span>
            <strong>12</strong>
          </li>
          <li>
            <span>King</span>
            <strong>13</strong>
          </li>
          <li>
            <span>Current wild</span>
            <strong>{WILD_POINTS}</strong>
          </li>
          <li>
            <span>Joker</span>
            <strong>{JOKER_POINTS}</strong>
          </li>
        </ul>
        <p>The player who goes out scores zero for that hand. Nobody can hold more cards than were dealt that round — hand 3 means up to 3 leftovers. After the Kings-wild hand, lowest total wins.</p>
      </article>
    </section>
  )
}
