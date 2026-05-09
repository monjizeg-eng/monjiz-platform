/** Demo cards when the local store has no freelancers yet (home + marketplace). */
export const PLACEHOLDER_FREELANCERS: Array<{
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  profile_image: string | null;
}> = [
  {
    id: "_demo-1",
    name: "Demo — Graphic Design",
    specialty: "Graphic Design",
    bio: "Placeholder card. Create a freelancer account locally to replace this with real directory data.",
    profile_image: null,
  },
  {
    id: "_demo-2",
    name: "Demo — Web Development",
    specialty: "Web Development",
    bio: "Placeholder card. Data is stored only in the visitor’s browser.",
    profile_image: null,
  },
  {
    id: "_demo-3",
    name: "Demo — Marketing",
    specialty: "Marketing",
    bio: "Placeholder card.",
    profile_image: null,
  },
];
