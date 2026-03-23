import axios from 'axios';

export interface Province {
  id: string;
  name: string;
  type: number;
  typeText: string;
  slug: string;
}

let cachedProvinces: Province[] | null = null;

export const locationService = {
  getProvinces: async (): Promise<Province[]> => {
    if (cachedProvinces) return cachedProvinces;
    const res = await axios.get('https://open.oapi.vn/location/provinces?page=0&size=63');
    cachedProvinces = res.data.data ?? [];
    return cachedProvinces!;
  },
};
