import { ListRow, ListSection } from '@ios27_design_system/react'
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
import { SceneShell } from '../platform/SceneNav.tsx'

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
    <SceneShell
      className="leaderboard-screen"
      nav={{
        back: { label: 'Five Crowns', onClick: onBack },
        title: 'Hall of crowns',
        subtitle: 'All-time stats on this phone',
      }}
    >
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
    </SceneShell>
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
        <ListSection className="leaderboard-list">
          {rows.map((entry, index) => (
            <ListRow
              key={entry.name}
              leading={<span className="place">{index + 1}</span>}
              trailing={
                <span className={`leaderboard-stat ${stat === 'wins' ? 'gold-stat' : 'lantern-stat'}`}>
                  {stat === 'wins' ? entry.wins : entry.lastPlace}
                </span>
              }
              separator={index < rows.length - 1}
            >
              <div className="leaderboard-name">
                <strong>{entry.name}</strong>
                <small>{entry.gamesPlayed} games played</small>
              </div>
            </ListRow>
          ))}
        </ListSection>
      )}
    </article>
  )
}
