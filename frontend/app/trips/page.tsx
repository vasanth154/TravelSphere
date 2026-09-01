"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  UserPlus,
  Plane,
  BedDouble,
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  Wallet,
  Link as LinkIcon,
  Copy,
  Trash2,
  Receipt,
} from "lucide-react";
import { DEMO_TRIPS, Trip as DemoTrip } from "../../lib/demo-data";
import {
  getToken,
  getTrip,
  listTrips,
  createTrip,
  joinTrip,
  addTripItem,
  addTripExpense,
  getTripBudget,
  deleteTripItem,
  Trip as ApiTrip,
  TripDetail,
} from "../../lib/api";
import { SmartImage } from "../../components/SmartImage";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { formatDate, formatINR } from "../../lib/format";

export default function TripsPage() {
  const [demoTrips, setDemoTrips] = useState<DemoTrip[]>([]);
  const [liveTrips, setLiveTrips] = useState<ApiTrip[]>([]);
  const [authed, setAuthed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enableLive, setEnableLive] = useState(getToken() != null);

  useEffect(() => {
    setDemoTrips(DEMO_TRIPS);
    setAuthed(getToken() != null);
  }, []);

  const loadTrips = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await listTrips();
      setLiveTrips(res.trips);
    } catch {
      setLiveTrips([]);
    }
  }, []);

  useEffect(() => {
    if (enableLive && getToken()) void loadTrips();
  }, [enableLive, loadTrips]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!getToken()) {
      setError("Please log in first to create a trip.");
      return;
    }
    setBusy(true);
    setError(null);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    try {
      await createTrip({
        title: String(fd.get("title")),
        origin: String(fd.get("origin") || undefined),
        destination: String(fd.get("destination") || undefined),
        start_date: String(fd.get("start_date") || undefined),
        end_date: String(fd.get("end_date") || undefined),
        travelers: Number(fd.get("travelers") || 1),
        budget: fd.get("budget") ? Number(fd.get("budget")) : undefined,
      });
      setCreating(false);
      setMsg("Trip created!");
      await loadTrips();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!getToken()) {
      setError("Please log in first to join a trip.");
      return;
    }
    setBusy(true);
    setError(null);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    try {
      await joinTrip(String(fd.get("code")).toUpperCase().trim());
      setJoining(false);
      setMsg("Joined trip!");
      await loadTrips();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const upcoming = demoTrips.filter((t) => t.status === "upcoming");

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <span className="eyebrow">Your travel</span>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="h2">My trips</h1>
            <p className="lede">Everything you&apos;ve planned, in one calm view.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setCreating((v) => !v); setJoining(false); setMsg(null); setError(null); }}>
              <Plus className="h-4 w-4" /> Create trip
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setJoining((v) => !v); setCreating(false); setMsg(null); setError(null); }}>
              <UserPlus className="h-4 w-4" /> Join by code
            </Button>
          </div>
        </div>

        {(!authed || !enableLive) && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <Wallet className="h-5 w-5 text-brand-500" />
            <span className="flex-1">
              Log in to create trips, invite travel buddies by code, track group expenses and manage a shared budget.
            </span>
            <Link href="/login" className="btn-primary btn-sm">Log in</Link>
          </div>
        )}

        {/* Create / join forms */}
        {creating && (
          <form onSubmit={handleCreate} className="card mt-5 p-5">
            <h3 className="mb-3 font-bold text-slate-900">Create a trip</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Title" htmlFor="title"><input id="title" name="title" className="field" required placeholder="Goa beach escape" /></Field>
              <Field label="From" htmlFor="origin"><input id="origin" name="origin" className="field" placeholder="Chennai" /></Field>
              <Field label="To" htmlFor="destination"><input id="destination" name="destination" className="field" placeholder="Goa" /></Field>
              <Field label="Start" htmlFor="start_date"><input id="start_date" name="start_date" type="date" className="field" /></Field>
              <Field label="End" htmlFor="end_date"><input id="end_date" name="end_date" type="date" className="field" /></Field>
              <Field label="Travellers" htmlFor="travelers"><input id="travelers" name="travelers" type="number" min={1} className="field" defaultValue={1} /></Field>
              <Field label="Budget (₹)" htmlFor="budget"><input id="budget" name="budget" type="number" min={0} className="field" placeholder="Optional" /></Field>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="submit" loading={busy}>Create trip</Button>
              <Button type="button" variant="ghost" onClick={() => { setCreating(false); setError(null); }}>Cancel</Button>
            </div>
          </form>
        )}

        {joining && (
          <form onSubmit={handleJoin} className="card mt-5 flex flex-wrap items-end gap-3 p-5">
            <div className="flex-1 min-w-[200px]">
              <Field label="Trip code" htmlFor="code">
                <input id="code" name="code" className="field font-mono uppercase" placeholder="e.g. A1B2C3D4" maxLength={8} required />
              </Field>
            </div>
            <Button type="submit" loading={busy}>Join trip</Button>
          </form>
        )}

        {msg && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{msg}</div>}
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}

        {/* Live trips */}
        {liveTrips.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold text-slate-900">Your trips</h2>
            <div className="mt-4 space-y-4">
              {liveTrips.map((trip) => (
                <LiveTripCard
                  key={trip.id}
                  trip={trip}
                  expanded={expanded === trip.id}
                  onToggle={() => setExpanded((v) => (v === trip.id ? null : trip.id))}
                  onDeleted={loadTrips}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="mt-10 text-xl font-bold text-slate-900">Upcoming</h2>
        <div className="mt-4 space-y-4">
          {upcoming.map((t) => (
            <DemoTripCard key={t.id} trip={t} />
          ))}
          {upcoming.length === 0 && liveTrips.length === 0 && <Empty />}
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 p-8 text-center text-white shadow-pop">
          <h3 className="text-2xl font-extrabold">Start a new adventure</h3>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Plan transport and stays together for a smoother trip.
          </p>
          <Link href="/search" className="btn-accent btn-lg mt-5">
            Plan a Trip <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LiveTripCard({
  trip,
  expanded,
  onToggle,
  onDeleted,
}: {
  trip: ApiTrip;
  expanded: boolean;
  onToggle: () => void;
  onDeleted: () => void;
}) {
  const [detail, setDetail] = useState<TripDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [budget, setBudget] = useState<{ remaining: number | null; total: number; per_person: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addType, setAddType] = useState("activity");
  const [addPrice, setAddPrice] = useState(0);
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState(0);
  const [expCat, setExpCat] = useState("food");
  const [busy, setBusy] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    try {
      const [d, b] = await Promise.all([getTrip(trip.id), getTripBudget(trip.id)]);
      setDetail(d);
      setBudget({ remaining: b.remaining, total: b.total, per_person: b.per_person });
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [trip.id]);

  useEffect(() => {
    if (expanded) void loadDetail();
  }, [expanded, loadDetail]);

  const copyCode = () => {
    navigator.clipboard?.writeText(trip.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addTripItem(trip.id, { item_type: addType, title: addTitle, price: addPrice });
      setAddTitle("");
      setAddPrice(0);
      await loadDetail();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addTripExpense(trip.id, { title: expTitle, category: expCat, amount: expAmount });
      setExpTitle("");
      setExpAmount(0);
      await loadDetail();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteTripItem(trip.id, itemId);
      await loadDetail();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const items = detail?.items ?? [];
  const expenses = detail?.expenses ?? [];

  return (
    <article className="card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-5 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          {trip.destination ? <Plane className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900">{trip.title}</h3>
            <Badge tone="brand">{trip.status}</Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
            {trip.destination && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.destination}</span>}
            {trip.start_date && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(trip.start_date)}</span>}
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {trip.travelers}</span>
          </p>
        </div>
        {budget && (
          <div className="text-right text-sm">
            <div className="font-bold text-slate-900">{formatINR(budget.total)}</div>
            <div className={budget.remaining != null && budget.remaining < 0 ? "text-rose-600" : "text-emerald-600"}>
              {budget.remaining != null ? `${budget.remaining < 0 ? "" : ""}${formatINR(budget.remaining)} left` : ""}
            </div>
          </div>
        )}
        <span className="text-slate-400">{expanded ? "–" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              Share code
              <button onClick={copyCode} className="btn-secondary btn-sm">
                <LinkIcon className="h-3.5 w-3.5" /> <span className="font-mono">{trip.code}</span>
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copied && <span className="text-xs font-semibold text-emerald-600">Copied!</span>}
            </div>
            {trip.owner_id && (
              <Button size="sm" variant="ghost" onClick={() => { void onDeleted(); }}>Refresh</Button>
            )}
          </div>

          {loadingDetail && <div className="p-6 text-center text-sm text-slate-400">Loading…</div>}

          {!loadingDetail && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Items */}
              <div>
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Booked & saved items</h4>
                <div className="space-y-2">
                  {items.length === 0 && <p className="text-sm text-slate-400">No items yet. Add transport, hotels or activities.</p>}
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {item.item_type === "hotel" ? <BedDouble className="h-4 w-4" /> : item.item_type === "transport" ? <Plane className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-500 capitalize">{item.item_type} · {formatINR(item.price)}</div>
                      </div>
                      {item.status === "booked" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Booked</span>
                      ) : (
                        <Badge tone="slate">{item.status}</Badge>
                      )}
                      <button className="text-slate-300 hover:text-rose-500" onClick={() => void handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddItem} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
                  <input className="field" placeholder="Item name" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} required />
                  <select className="field" value={addType} onChange={(e) => setAddType(e.target.value)}>
                    <option value="activity">Activity</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="hotel">Hotel</option>
                    <option value="place">Place</option>
                  </select>
                  <input className="field" type="number" min={0} placeholder="₹" value={addPrice} onChange={(e) => setAddPrice(Number(e.target.value))} />
                  <Button type="submit" size="sm" loading={busy}>Add</Button>
                </form>
              </div>

              {/* Expenses */}
              <div>
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-400">Group expenses</h4>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">Total</div>
                    <div className="font-bold text-slate-900">{budget ? formatINR(budget.total) : "–"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">Remaining</div>
                    <div className="font-bold text-slate-900">{budget && budget.remaining != null ? formatINR(budget.remaining) : "–"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-400">Per person</div>
                    <div className="font-bold text-slate-900">{budget ? formatINR(budget.per_person) : "–"}</div>
                  </div>
                </div>
                <div className="mb-3 space-y-2">
                  {expenses.length === 0 && <p className="text-sm text-slate-400">No expenses recorded yet.</p>}
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Receipt className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{exp.title}</div>
                        <div className="text-xs capitalize text-slate-500">{exp.category}</div>
                      </div>
                      <div className="font-bold text-slate-900">{formatINR(exp.amount)}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <input className="field sm:col-span-2" placeholder="What was it?" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} required />
                  <select className="field" value={expCat} onChange={(e) => setExpCat(e.target.value)}>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="hotel">Hotel</option>
                    <option value="local">Local</option>
                    <option value="activities">Activities</option>
                    <option value="other">Other</option>
                  </select>
                  <input className="field" type="number" min={0} placeholder="₹" value={expAmount} onChange={(e) => setExpAmount(Number(e.target.value))} required />
                  <Button type="submit" size="sm" className="col-span-full sm:col-auto" loading={busy}>Add expense</Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DemoTripCard({ trip }: { trip: DemoTrip }) {
  return (
    <article className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <SmartImage
          src={trip.image}
          alt={trip.destination}
          gradient="from-brand-500 to-cyan-500"
          className="h-40 w-full object-cover sm:h-auto sm:w-56"
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{trip.title}</h3>
                <Badge tone="brand">Upcoming</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {trip.destination}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-brand-500" /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-500" /> {trip.travelers} travellers</span>
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {trip.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  {item.kind === "transport" ? <Plane className="h-4 w-4" /> : <BedDouble className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.detail}</div>
                </div>
                {item.status === "confirmed" ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Confirmed</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="h-4 w-4" /> Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function Empty() {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center text-slate-500">
      <Plane className="h-8 w-8 text-slate-300" />
      <p>No upcoming trips yet.</p>
      <Link href="/search" className="btn-primary btn-sm">Plan a Trip</Link>
    </div>
  );
}