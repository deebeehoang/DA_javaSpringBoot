import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '@/services/axiosInstance';

interface Feature {
  id: string;
  place_name: string;
  center?: [number, number];
  context?: { id: string; text: string }[];
}

interface Props {
  value: string;
  onChange: (address: string, city?: string, coords?: { lng: number; lat: number }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function MapboxAddressInput({ value, onChange, placeholder = 'Nhập địa chỉ...', className, required }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Feature[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback((text: string) => {
    if (!text.trim()) { setSuggestions([]); return; }
    axiosInstance
      .get('/mapbox/geocode', { params: { q: text.trim() } })
      .then((res) => {
        setSuggestions(res.data.data ?? []);
        setOpen(true);
      })
      .catch(() => setSuggestions([]));
  }, []);

  const handleInput = (text: string) => {
    setQuery(text);
    onChange(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(text), 400);
  };

  const handleSelect = (feature: Feature) => {
    const address = feature.place_name;
    const cityCtx = feature.context?.find((c) => c.id.startsWith('place') || c.id.startsWith('region'));
    const coords = feature.center ? { lng: feature.center[0], lat: feature.center[1] } : undefined;
    setQuery(address);
    onChange(address, cityCtx?.text, coords);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((f) => (
            <li
              key={f.id}
              onClick={() => handleSelect(f)}
              className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
            >
              {f.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
