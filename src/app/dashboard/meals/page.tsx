'use client';

import { useState } from 'react';
import { Loading } from '@/components/Loading';
import { api } from '@/lib/client-api';
import { dhakaToday, formatDateTime } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useData } from '@/lib/use-data';

const MEALS = ['breakfast', 'lunch', 'dinner'] as const;
type Meal = (typeof MEALS)[number];
type Day = { date: string; meals: Record<Meal, { cancelled: boolean; cancellationDeadline: string }> };
type Plan = Record<Meal, { totalStudents: number; activeMeals: number; cancelled: number }>;

const addDays = (ymd: string, n: number) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

export default function MealsPage() {
  const { user } = useSession();
  if (!user) return null;
  return user.role === 'STUDENT' ? <MyMeals /> : <Planning />;
}

// A week ahead. Each meal can be switched off until 24 hours before it.
function MyMeals() {
  const from = dhakaToday();
  const { data, error, reload } = useData<Day[]>(`/meals/my-status?dateFrom=${from}&dateTo=${addDays(from, 6)}`);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  async function toggle(date: string, meal: Meal, cancelled: boolean) {
    const key = `${date}${meal}`;
    setBusy(key);
    setMessage('');
    try {
      const body = { dates: [date], mealTypes: [meal] };
      if (cancelled) await api('/meals/reactivate', { method: 'POST', json: body });
      else {
        const r = await api<{ failed: { reason: string }[] }>('/meals/cancel', { method: 'POST', json: body });
        if (r.failed.length) throw new Error(r.failed[0].reason);
      }
      reload();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Dining</span>
        <h1>My meals</h1>
        <p className="muted">Eating out? Switch a meal off up to 24 hours before it, so the kitchen cooks less and wastes less.</p>
      </header>
      <p className="error" role="alert">
        {message}
      </p>
      {!data ? (
        <Loading error={error} />
      ) : (
        <div className="table-wrap">
          <table className="meals">
            <thead>
              <tr>
                <th>Day</th>
                {MEALS.map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((day) => {
                const ymd = day.date.slice(0, 10);
                return (
                  <tr key={ymd}>
                    <td>{weekday.format(new Date(day.date))}</td>
                    {MEALS.map((m) => {
                      const { cancelled, cancellationDeadline } = day.meals[m];
                      const locked = new Date(cancellationDeadline) < new Date();
                      return (
                        <td key={m}>
                          <button
                            type="button"
                            className={`meal-toggle ${cancelled ? 'off' : 'on'}`}
                            aria-pressed={!cancelled}
                            disabled={locked || busy === `${ymd}${m}`}
                            title={locked ? 'Too late to change' : `Change until ${formatDateTime(cancellationDeadline)}`}
                            onClick={() => toggle(ymd, m, cancelled)}
                          >
                            {cancelled ? 'Off' : 'On'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Planning() {
  const [date, setDate] = useState(() => addDays(dhakaToday(), 1));
  const { data, error } = useData<Plan>(`/meals/planning/${date}`);

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Kitchen</span>
        <h1>How many to cook</h1>
      </header>
      <div className="filters">
        <label>
          Day
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
      </div>
      {!data ? (
        <Loading error={error} />
      ) : (
        <div className="grid">
          {MEALS.map((m) => (
            <article key={m} className="card tile">
              <span className="kicker">{m}</span>
              <p className="stat">{data[m].activeMeals}</p>
              <p className="muted tile-note">
                {data[m].cancelled} switched off of {data[m].totalStudents} residents
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
