import { useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import type { GameLogEntry } from '@/lib/gameApi';

const kindIcon: Record<string, string> = {
  move: 'Footprints',
  храм: 'Landmark',
  логово: 'Mountain',
  рынок: 'ArrowLeftRight',
  весы: 'Scale',
  пустыня: 'Wind',
  dragon: 'Flame',
  alliance: 'Handshake',
  betrayal: 'HeartCrack',
  ability: 'Sparkles',
  card: 'Layers',
  victory: 'Trophy',
  system: 'Info',
};

const GameLog = ({ entries }: { entries: GameLogEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div ref={ref} className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
      {entries.length === 0 && (
        <p className="text-[0.82rem] text-muted-foreground">Пока ничего не произошло.</p>
      )}
      {entries.map((e) => (
        <div key={e.id} className="flex gap-3">
          <Icon
            name={kindIcon[e.kind] ?? 'Dot'}
            size={14}
            className={`mt-0.5 shrink-0 ${e.kind === 'victory' ? 'text-primary' : 'text-muted-foreground'}`}
          />
          <p
            className={`text-[0.82rem] leading-relaxed ${
              e.kind === 'victory' ? 'font-semibold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {e.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default GameLog;