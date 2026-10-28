interface CountryFlagProps {
  code: string;
  name?: string;
}

export default function CountryFlag({ code, name }: CountryFlagProps) {
  const lower = (code || '').toLowerCase();
  return (
    <span
      className={`fi fi-${lower}`}
      aria-label={`${name || code} flag`}
      title={`${name || code} flag`}
      style={{ width: 24, height: 18, borderRadius: 2, flexShrink: 0, display: 'inline-block' }}
    />
  );
}
