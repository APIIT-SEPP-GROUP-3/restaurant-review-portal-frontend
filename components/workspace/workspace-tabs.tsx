export function WorkspaceTabs<T extends string>({ label, options, value, onChange, disabled = false }: {
  label: string; options: readonly { value: T; label: string }[]; value: T;
  onChange: (value: T) => void; disabled?: boolean;
}) {
  return <div className="workspace-tabs" role="group" aria-label={label}>
    {options.map(option => <button key={option.value} type="button" disabled={disabled} aria-pressed={value === option.value} onClick={() => onChange(option.value)} className="workspace-tab disabled:opacity-50">{option.label}</button>)}
  </div>;
}
