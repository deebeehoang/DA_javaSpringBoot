import axios from 'axios';

export interface Province {
  id: string;
  name: string;
}

let cachedProvinces: Province[] | null = null;

export const locationService = {
  getProvinces: async (): Promise<Province[]> => {
    if (cachedProvinces) return cachedProvinces;
    try {
      const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
      cachedProvinces = (res.data ?? []).map((p: any) => ({
        id: String(p.code),
        name: p.name,
      }));
    } catch {
      cachedProvinces = [];
    }
    return cachedProvinces!;
  },
};
