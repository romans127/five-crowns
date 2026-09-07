import { useMemo } from 'react'
import { listHistory } from '../game/history.ts'
import {
  buildLeaderboard,
  isLeaderboardGame,
  leaderboardHasStats,
  sortByLastPlace,
  sortByWins,
  type LeaderboardEntry,
} from '../game/leaderboard.ts'
import { TextButton } from '../platform/IosChrome.tsx'

type LeaderboardProps = {
  onBack: () => void
}

export function Leaderboard({ onBack }: LeaderboardProps) {
  const records = useMemo(() => listHistory(), [])
  const entries = useMemo(() => buildLeaderboard(records), [records])
  const crowns = useMemo(() => sortByWins(entries).filter((entry) => entry.wins > 0), [entries])
  const lanterns = useMemo(() => sortByLastPlace(entries).filter((entry) => entry.lastPlace > 0), [entries])
  const hasStats = leaderboardHasStats(entries)
  const finishedGames = useMemo(() => records.filter(isLeaderboardGame).length, [records])

  return (
    <section className="screen leaderboard-screen">
      <header className="screen-head">
        <TextButton onClick={onBack}>Back home</TextButton>
        <h1>Hall of crowns</h1>
        <p>All-time wins and last-place finishes from completed games on this phone.</p>
      </header>

      {!hasStats ? (
        <p className="hint center history-empty">No completed games yet. Finish a full match and stats will show up here.</p>
      ) : (
        <>
          <LeaderboardPanel
            title="Most crowns"
            subtitle={`${finishedGames} completed ${finishedGames === 1 ? 'game' : 'games'}`}
            rows={crowns}
            stat="wins"
            empty="No crowned winners yet."
          />
          <LeaderboardPanel
            title="Most last place"
            subtitle="Lantern holders"
            rows={lanterns}
            stat="lastPlace"
            empty="Nobody has taken the lantern yet."
          />
        </>
      )}
    </section>
  )
}

function LeaderboardPanel({
  title,
  subtitle,
  rows,
  stat,
  empty,
}: {
  title: string
  subtitle: string
  rows: LeaderboardEntry[]
  stat: 'wins' | 'lastPlace'
  empty: string
}) {
  return (
    <article className="leaderboard-panel">
      <header>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      {rows.length === 0 ? (
        <p className="hint center">{empty}</p>
      ) : (
        <ol className="leaderboard-list">
          {rows.map((entry, index) => (
            <li key={entry.name}>
              <span className="place">{index + 1}</span>
              <div className="leaderboard-name">
                <strong>{entry.name}</strong>
                <small>{entry.gamesPlayed} games played</small>
              </div>
              <span className={`leaderboard-stat ${stat === 'wins' ? 'gold-stat' : 'lantern-stat'}`}>
                {stat === 'wins' ? entry.wins : entry.lastPlace}
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}
