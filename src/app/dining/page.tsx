import { KeyValues } from '@/components/KeyValues';
import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { SampleBadge } from '@/components/SampleBadge';
import { formatTaka } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { DiningInfo } from '@/lib/types';

export const metadata = { title: 'Dining' };

export default async function DiningPage() {
  const dining = await getPublic<DiningInfo>('dining');
  return (
    <>
      <PageHeader kicker="Campus" title="Dining" lead="Three meals a day, cooked in the hall. Residents switch a meal off a day ahead from their dashboard." />
      <section className="section">
        <div className="container">
          {!dining ? (
            <Empty title="Dining details are on their way">The hall office will add meal times and the menu here.</Empty>
          ) : (
            <div className="stack" style={{ gap: '2.5rem' }}>
              <SampleBadge show={dining.isSample} />
              <div className="grid">
                {dining.mealPlan.map((m) => (
                  <article key={m.meal} className="card tile">
                    <span className="kicker">{m.meal}</span>
                    <p className="stat">{formatTaka(m.price)}</p>
                    <p className="muted tile-note">{m.time}</p>
                  </article>
                ))}
              </div>

              {dining.weeklyMenu && (
                <div>
                  <h2>This week&apos;s menu</h2>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Lunch</th>
                          <th>Dinner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dining.weeklyMenu.map((d) => (
                          <tr key={d.day}>
                            <th scope="row">{d.day}</th>
                            <td>{d.lunch}</td>
                            <td>{d.dinner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <KeyValues
                items={[
                  ['Where', dining.location],
                  ['Seats', dining.capacity],
                  ['Special diets', dining.specialDiets.join(' · ')],
                ]}
              />
              {dining.notice && <p className="callout">{dining.notice}</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
