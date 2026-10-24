'use client';

import { useState } from 'react';
import { Loading } from '@/components/Loading';
import { api } from '@/lib/client-api';
import { humanize } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useData } from '@/lib/use-data';

type Occupant = { id: string; name: string; universityId: string; bedNumber: number };
type Room = {
  id: string;
  roomNumber: string;
  floor: number;
  wing: string | null;
  roomType: string;
  capacity: number;
  status: string;
  occupants: Occupant[];
  vacantBeds: number[];
};

const FLOORS = Array.from({ length: 12 }, (_, i) => i + 5); // bedrooms are on floors 5 to 16

export default function RoomsPage() {
  const { user } = useSession();
  const [floor, setFloor] = useState(5);
  const isTutor = user?.role === 'HOUSE_TUTOR';
  // A tutor's floor comes from the API, not from what the page asks for
  const floorRooms = useData<{ rooms: Room[] }>(user ? (isTutor ? '/rooms/my-floor' : `/rooms/floor/${floor}`) : null);
  const vacantRooms = useData<{ rooms: Room[] }>(user ? '/rooms/vacant' : null);
  const rooms = floorRooms.data?.rooms;
  const vacant = vacantRooms.data?.rooms;
  const { error, reload } = floorRooms;
  const reloadVacant = vacantRooms.reload;
  const [message, setMessage] = useState('');
  if (!user) return null;

  const refresh = () => {
    reload();
    reloadVacant();
  };
  const act = async (fn: () => Promise<unknown>, done: string) => {
    setMessage('');
    try {
      await fn();
      setMessage(done);
      refresh();
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const beds = rooms?.reduce((n, r) => n + r.capacity, 0) ?? 0;
  const taken = rooms?.reduce((n, r) => n + r.occupants.length, 0) ?? 0;

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Rooms</span>
        <h1>{isTutor ? `Floor ${user.assignedFloor}` : 'Floor plan'}</h1>
        {rooms && (
          <p className="muted">
            {taken} of {beds} beds taken · {beds - taken} free
          </p>
        )}
      </header>

      {!isTutor && (
        <div className="segmented floor-picker" role="radiogroup" aria-label="Floor">
          {FLOORS.map((f) => (
            <button key={f} type="button" role="radio" aria-checked={floor === f} onClick={() => setFloor(f)}>
              {f}
            </button>
          ))}
        </div>
      )}

      {message && (
        <p className="callout small" role="status">
          {message}
        </p>
      )}

      {!rooms ? (
        <Loading error={error} />
      ) : rooms.length === 0 ? (
        <p className="muted">No rooms on this floor.</p>
      ) : (
        <div className="rooms">
          {rooms.map((room) => (
            <article key={room.id} className="room card">
              <header>
                <h3>{room.roomNumber}</h3>
                <span className="muted small">
                  {humanize(room.roomType)}
                  {room.wing && ` · wing ${room.wing}`}
                </span>
              </header>
              <ul className="beds">
                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((bed) => {
                  const who = room.occupants.find((o) => o.bedNumber === bed);
                  return (
                    <li key={bed} className={who ? 'bed taken' : 'bed'}>
                      <span className="bed-no">Bed {bed}</span>
                      {who ? (
                        <>
                          <span className="bed-who">
                            {who.name}
                            <small>{who.universityId}</small>
                          </span>
                          <BedMenu
                            occupant={who}
                            room={room}
                            vacant={vacant ?? []}
                            onMove={(targetRoomId, targetBedNumber) =>
                              act(
                                () =>
                                  api(`/rooms/${room.id}/transfer`, {
                                    method: 'POST',
                                    json: { userId: who.id, targetRoomId, targetBedNumber },
                                  }),
                                `${who.name} moved.`,
                              )
                            }
                            onRemove={() => {
                              if (confirm(`Remove ${who.name} from room ${room.roomNumber}? Her bed becomes free.`))
                                void act(() => api(`/rooms/${room.id}/unassign/${who.id}`, { method: 'DELETE' }), `${who.name} removed from the room.`);
                            }}
                          />
                        </>
                      ) : isTutor ? (
                        <span className="muted small">Free</span>
                      ) : (
                        <AssignBed
                          onAssign={(universityId) =>
                            act(async () => {
                              const student = await api<{ id: string; role: string; name: string }>(`/users/university/${universityId}`);
                              if (student.role !== 'STUDENT') throw new Error('Only residents can be given a bed.');
                              await api(`/rooms/${room.id}/assign`, { method: 'POST', json: { userId: student.id, bedNumber: bed } });
                            }, `Bed ${bed} in ${room.roomNumber} assigned.`)
                          }
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function AssignBed({ onAssign }: { onAssign: (universityId: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" className="link-button small" onClick={() => setOpen(true)}>
        Free · assign
      </button>
    );
  return (
    <form
      className="row bed-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await onAssign(String(new FormData(e.currentTarget).get('universityId')));
        setOpen(false);
      }}
    >
      <label className="sr-only" htmlFor="assign-id">
        Resident&apos;s university ID
      </label>
      <input id="assign-id" name="universityId" required inputMode="numeric" pattern="\d{10}" maxLength={10} placeholder="University ID" autoFocus />
      <button type="submit" className="btn btn-small">
        Assign
      </button>
    </form>
  );
}

function BedMenu({
  occupant,
  room,
  vacant,
  onMove,
  onRemove,
}: {
  occupant: Occupant;
  room: Room;
  vacant: Room[];
  onMove: (roomId: string, bed: number) => void;
  onRemove: () => void;
}) {
  return (
    <details className="bed-menu">
      <summary aria-label={`Actions for ${occupant.name}`}>⋯</summary>
      <div className="bed-menu-body">
        <label className="small">
          Move to
          <select
            defaultValue=""
            onChange={(e) => {
              const [roomId, bed] = e.target.value.split(':');
              if (roomId) onMove(roomId, Number(bed));
            }}
          >
            <option value="">Choose a free bed</option>
            {vacant
              .filter((r) => r.id !== room.id)
              .flatMap((r) =>
                r.vacantBeds.map((b) => (
                  <option key={`${r.id}:${b}`} value={`${r.id}:${b}`}>
                    {r.roomNumber}, bed {b}
                  </option>
                )),
              )}
          </select>
        </label>
        <button type="button" className="btn btn-quiet btn-small" onClick={onRemove}>
          Remove from room
        </button>
      </div>
    </details>
  );
}
