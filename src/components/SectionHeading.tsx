type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

const SectionHeading = ({ eyebrow, title, description, align = 'left' }: Props) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    <div className={`eyebrow mb-5 flex items-center gap-3.5 ${align === 'center' ? 'justify-center' : ''}`}>
      <span className="h-px w-11 bg-primary" />
      {eyebrow}
    </div>
    <h2 className="font-sans text-[clamp(1.75rem,3.6vw,2.75rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground">
      {title}
    </h2>
    {description && <p className="mt-5 text-[0.9rem] leading-relaxed text-muted-foreground">{description}</p>}
  </div>
);

export default SectionHeading;
