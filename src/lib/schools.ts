export interface School {
  id: string;
  name: string;
  logo: string;
  location: string;
}

export const HOME_LOCATION = "Hill of Three Oaks, Carleton College";

export function findSchool(schools: School[], opponent: string): School | undefined {
  return schools.find((s) => s.name.toLowerCase() === opponent.toLowerCase());
}
