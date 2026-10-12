import { useState } from 'react';
import { Bookmark, Check, EyeOff, Plus, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo, LogoLockup } from '@/components/Logo';
import { MediaCard } from '@/components/MediaCard';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Art, type ArtName, Poster, RatingScale, SectionHeader, Slate, SprocketRule, Stat } from '@/components/reel';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Segmented } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tag } from '@/components/ui/badge';
import type { TMDBMovie } from '@/types/tmdb';

/** Development-only style guide. Not shipped: see the route in App.tsx. */

const swatches: { name: string; cls: string; note: string }[] = [
  { name: 'background', cls: 'bg-background', note: 'canvas' },
  { name: 'card', cls: 'bg-card', note: 'surface 1' },
  { name: 'surface-2', cls: 'bg-surface-2', note: 'hover / fill' },
  { name: 'surface-3', cls: 'bg-surface-3', note: 'pressed / track' },
  { name: 'border', cls: 'bg-border', note: 'hairline' },
  { name: 'border-strong', cls: 'bg-border-strong', note: 'controls' },
  { name: 'primary', cls: 'bg-primary', note: 'signal: primary action' },
  { name: 'primary-subtle', cls: 'bg-primary-subtle', note: 'selected tint' },
  { name: 'rating', cls: 'bg-rating', note: 'ratings only' },
  { name: 'success', cls: 'bg-success', note: 'watched' },
  { name: 'warning', cls: 'bg-warning', note: 'caution' },
  { name: 'destructive', cls: 'bg-destructive', note: 'irreversible' },
];

const sampleMovie = (over: Partial<TMDBMovie>): TMDBMovie =>
  ({ id: 1, title: 'The Matrix', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', release_date: '1999-03-30', vote_average: 8.2, adult: false, ...over }) as TMDBMovie;

const arts: ArtName[] = ['list', 'search', 'upcoming', 'hidden', 'stats', 'error', 'offline', 'generic'];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <SectionHeader title={title} />
      {children}
    </section>
  );
}

export default function Design() {
  const [rating, setRating] = useState<number | null>(7);
  const [seg, setSeg] = useState<'movie' | 'tv'>('movie');
  const [status, setStatus] = useState<'watchlist' | 'watched'>('watchlist');

  return (
    <Layout>
      <PageHeader eyebrow="Design system" title="Projection Room" description="Every token and component, in the active theme. Development only." actions={<ThemeSwitcher />} />
      <PageContainer>
        <Block title="Brand">
          <div className="flex flex-wrap items-center gap-8">
            <Logo className="h-16 w-16" />
            <LogoLockup />
            <p className="max-w-sm text-muted-foreground">Track what you watch. Never miss what's next.</p>
          </div>
        </Block>

        <SprocketRule />

        <Block title="Colour">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {swatches.map(s => (
              <div key={s.name} className="overflow-hidden rounded-lg border border-border">
                <div className={`h-16 ${s.cls}`} />
                <div className="bg-card p-2.5">
                  <p className="font-mono text-xs font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Type">
          <div className="space-y-4">
            <p className="text-display-lg font-semibold tracking-tight font-display">Marquee</p>
            <h1 className="text-display">Page title in the display serif</h1>
            <h2 className="text-2xl">Section heading</h2>
            <h3 className="text-base">Item title in Instrument Sans</h3>
            <p className="max-w-prose">Body copy in Instrument Sans, set at fifteen pixels with generous leading, for synopses and descriptions that people actually read through to the end.</p>
            <p className="text-sm text-muted-foreground">Secondary text, 14px muted.</p>
            <p className="label-mono">Label · Runtime · 2H 25M</p>
            <p className="numeral font-mono text-sm">S01E04 · 2026-10-12 · 8.3</p>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Add to list</Button>
            <Button variant="secondary">Mark watched</Button>
            <Button variant="outline">Filter</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete account</Button>
            <Button variant="link">Forgot password?</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm"><Plus /> Small</Button>
            <Button size="lg"><Check /> Large</Button>
            <Button size="icon" variant="outline" aria-label="Share"><Share2 /></Button>
            <span className="rounded-md bg-gradient-to-br from-stone-600 to-stone-900 p-3"><Button variant="overlay" size="icon-sm" aria-label="Bookmark"><Bookmark /></Button></span>
          </div>
        </Block>

        <Block title="Form">
          <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
            <FormField id="d-email" label="Email" hint="We only use it to sign you in.">
              {p => <Input type="email" placeholder="you@example.com" {...p} />}
            </FormField>
            <FormField id="d-pass" label="Password" error="Use at least 6 characters.">
              {p => <Input type="password" defaultValue="abc" {...p} />}
            </FormField>
            <FormField id="d-sel" label="Genre">
              {p => (
                <Select defaultValue="all">
                  <SelectTrigger id={p.id}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genres</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
                    <SelectItem value="scifi">Science Fiction</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <div className="space-y-1.5">
              <p className="text-[0.8125rem] font-semibold">Segmented</p>
              <div className="flex flex-wrap gap-3">
                <Segmented value={seg} onValueChange={setSeg} aria-label="Media type" options={[{ value: 'movie', label: 'Movies' }, { value: 'tv', label: 'TV Shows' }]} />
                <Segmented value={status} onValueChange={setStatus} aria-label="Status" size="sm" options={[{ value: 'watchlist', label: 'To watch' }, { value: 'watched', label: 'Watched' }]} />
              </div>
            </div>
          </div>
        </Block>

        <Block title="Rating">
          <div className="max-w-md space-y-6">
            <RatingScale value={rating} onChange={setRating} />
            <RatingScale value={rating} onChange={setRating} size="sm" />
          </div>
        </Block>

        <Block title="Tags">
          <div className="flex flex-wrap gap-2">
            <Tag>Movie</Tag><Tag variant="outline">PG-13</Tag><Tag variant="signal">In your list</Tag><Tag variant="gold">Upcoming</Tag>
            <Tag variant="success"><Check /> Watched</Tag><Tag variant="destructive">Removed</Tag>
            <span className="rounded bg-stone-800 p-2"><Tag variant="overlay">Overlay</Tag></span>
          </div>
        </Block>

        <Block title="Posters and cards">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            <MediaCard media={sampleMovie({})} mediaType="movie" eager />
            <MediaCard media={sampleMovie({ id: 2, title: 'A Very Long Title That Needs Two Lines To Fit', vote_average: 6.4 })} mediaType="movie" />
            <MediaCard media={sampleMovie({ id: 3, title: 'No Poster Available', poster_path: null, release_date: '2026-01-01' })} mediaType="movie" />
            <div className="space-y-2.5"><Poster path={null} title="Loading…" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
          </div>
        </Block>

        <Block title="Details grid and stats">
          <div className="grid gap-6 lg:grid-cols-2">
            <Slate rows={[{ label: 'Director', value: 'Lana Wachowski' }, { label: 'Runtime', value: '2h 16m' }, { label: 'Language', value: 'English' }, { label: 'Status', value: 'Released' }, { label: 'Production', value: 'Warner Bros. · Village Roadshow Pictures · Silver Pictures', wide: true }]} />
            <div className="grid grid-cols-2 gap-3"><Stat label="Watched" value="128" /><Stat label="Hours" value="312" unit="hrs" /><Stat label="Average" value="7.8" unit="/ 10" /><Stat label="Top decade" value="2010s" hint="42 titles" /></div>
          </div>
        </Block>

        <Block title="Menus, dialogs, popovers, tabs">
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Title</DropdownMenuLabel>
                <DropdownMenuItem><Bookmark /> Add to list</DropdownMenuItem>
                <DropdownMenuItem><EyeOff /> Not interested</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive><Trash2 /> Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline">Rate…</Button></PopoverTrigger>
              <PopoverContent><RatingScale value={rating} onChange={setRating} /></PopoverContent>
            </Popover>
            <Dialog>
              <DialogTrigger asChild><Button variant="secondary">Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Remove from your list?</DialogTitle><DialogDescription>You can add it back at any time.</DialogDescription></DialogHeader>
                <DialogFooter><Button variant="ghost">Cancel</Button><Button variant="destructive">Remove</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => toast.success('Added to your list', { action: { label: 'Undo', onClick: () => undefined } })}>Success toast</Button>
            <Button variant="outline" onClick={() => toast.error("Couldn't save", { description: 'Check your connection and try again.' })}>Error toast</Button>
          </div>
          <Tabs defaultValue="a" className="mt-6 max-w-lg">
            <TabsList><TabsTrigger value="a">Overview</TabsTrigger><TabsTrigger value="b">Episodes</TabsTrigger><TabsTrigger value="c">Details</TabsTrigger></TabsList>
            <TabsContent value="a" className="text-muted-foreground">Tabs are underlined with the signal colour.</TabsContent>
            <TabsContent value="b">Episodes content</TabsContent>
            <TabsContent value="c">Details content</TabsContent>
          </Tabs>
        </Block>

        <Block title="Callouts and loading">
          <div className="grid max-w-3xl gap-3">
            <Callout title="Your list lives on this device">Sign in to sync it across devices.</Callout>
            <Callout tone="success" title="Password updated" />
            <Callout tone="warning" title="Email not verified">Check your inbox for the link.</Callout>
            <Callout tone="destructive" title="Couldn't sign in">Wrong email or password.</Callout>
            <div className="flex items-center gap-6 pt-2"><LoadingSpinner size="sm" /><LoadingSpinner /><LoadingSpinner size="lg" /></div>
          </div>
        </Block>

        <Block title="Empty and error states">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {arts.map(a => (
              <div key={a} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5">
                <Art name={a} /><span className="label-mono">{a}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-border bg-card">
            <EmptyState art="list" title="Your list is empty" description="Add movies and shows as you find them. They'll be here, in order.">
              <Button>Browse movies</Button><Button variant="ghost">Search</Button>
            </EmptyState>
          </div>
        </Block>
      </PageContainer>
    </Layout>
  );
}
