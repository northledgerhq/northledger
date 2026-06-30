export function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value.length > 0 ? value : undefined;
}

export function dateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
