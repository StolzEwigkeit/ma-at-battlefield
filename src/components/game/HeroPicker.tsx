import Icon from '@/components/ui/icon';
import { classes, gods } from '@/data/maat';
import { PAWNS } from '@/components/game/GameBoard';

const CLASS_TINT: Record<string, string> = {
  priest: 'from-[#1f6f78] to-[#0d2f33]',
  warrior: 'from-[#8a2a1f] to-[#3a0f0a]',
  vizier: 'from-[#22427a] to-[#0c1a33]',
  scribe: 'from-[#2f6b3a] to-[#0f2914]',
};

type Props = {
  god: string;
  cls: string;
  onGod: (id: string) => void;
  onCls: (id: string) => void;
};

const Frame = ({
  selected,
  onClick,
  children,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    aria-label={label}
    className={`group relative block w-full text-left transition-transform duration-200 hover:-translate-y-1.5 ${
      selected ? '-translate-y-1.5' : ''
    }`}
  >
    <div
      className={`relative aspect-[5/7] rounded-[10px] p-[3px] shadow-lg ${
        selected ? 'shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
      style={{
        background: selected
          ? 'linear-gradient(150deg,#f2d492 0%,#c9962f 22%,#8a5c17 48%,#e8c878 70%,#a8741f 100%)'
          : 'linear-gradient(150deg,#c9b27a 0%,#8a6a2f 45%,#b8975a 100%)',
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[7px] bg-[#1b1409]">{children}</div>
      {selected && (
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#f2d492] bg-primary text-primary-foreground shadow">
          <Icon name="Check" size={14} />
        </span>
      )}
    </div>
  </button>
);

const Ribbon = ({ title, sub }: { title: string; sub: string }) => (
  <div className="rounded-[4px] border border-[#e8c878]/60 bg-gradient-to-b from-[#f5e6c0] to-[#d9bf87] px-2 py-1.5 text-center shadow">
    <div className="truncate font-sans text-[0.8rem] font-extrabold uppercase text-[#4a2f0c]">{title}</div>
    <div className="truncate text-[0.56rem] uppercase tracking-[0.14em] text-[#8a6a2f]">{sub}</div>
  </div>
);

const HeroPicker = ({ god, cls, onGod, onCls }: Props) => {
  const currentCls = classes.find((c) => c.id === cls);
  const currentGod = gods.find((g) => g.id === god);

  return (
    <div className="space-y-8">
      <div>
        <div className="label-mono mb-3">Ваш жрец — фишка на поле</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {classes.map((c) => (
            <Frame key={c.id} selected={cls === c.id} onClick={() => onCls(c.id)} label={c.name}>
              <div className={`absolute inset-0 bg-gradient-to-b ${CLASS_TINT[c.id] ?? 'from-[#5a3d17] to-[#1b1409]'}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(242,212,146,0.35),transparent_60%)]" />
              <div className="absolute inset-[5px] rounded-[5px] border border-[#e8c878]/45" />
              <img
                src={PAWNS[c.id] ?? PAWNS.priest}
                alt=""
                className="absolute left-1/2 top-[7%] h-[66%] w-auto -translate-x-1/2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-2 bottom-2">
                <Ribbon title={c.name} sub={c.role} />
              </div>
            </Frame>
          ))}
        </div>
        {currentCls && (
          <div className="mt-4 grid gap-3 rounded-sm border border-border bg-card p-4 text-[0.8rem] leading-relaxed sm:grid-cols-2">
            <p className="text-card-foreground">
              <span className="label-mono mr-2 text-primary">Сила</span>
              {currentCls.strength}
            </p>
            <p className="text-muted-foreground">
              <span className="label-mono mr-2 text-destructive">Слабость</span>
              {currentCls.weakness}
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="label-mono mb-3">Ваш покровитель</div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {gods.map((g) => (
            <Frame key={g.id} selected={god === g.id} onClick={() => onGod(g.id)} label={g.name}>
              <img
                src={g.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
              <div className="absolute inset-[5px] rounded-[5px] border border-[#e8c878]/45" />
              <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#e8c878] bg-gradient-to-b from-[#2a6fa8] to-[#123e63] text-[0.8rem] text-white shadow">
                {g.glyph}
              </span>
              <div className="absolute inset-x-1.5 bottom-1.5">
                <Ribbon title={g.name} sub={g.epithet} />
              </div>
            </Frame>
          ))}
        </div>
        {currentGod && (
          <div className="mt-4 grid gap-3 rounded-sm border border-border bg-card p-4 text-[0.8rem] leading-relaxed sm:grid-cols-2">
            <p className="text-card-foreground">
              <span className="label-mono mr-2 text-primary">Дар</span>
              {currentGod.bonus}
            </p>
            <p className="text-muted-foreground">
              <span className="label-mono mr-2 text-destructive">Цена</span>
              {currentGod.penalty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroPicker;
