export type ExpertiseType = {
  group: string;
  options: string[];
};

export const EXPERTISE_CATEGORIES: ExpertiseType[] = [
  {
    group: "Tech",
    options: [
      "Web Development",
      "Mobile Development",
      "UI/UX Design",
      "Data Science",
      "AI & Machine Learning",
      "DevOps",
    ],
  },
  {
    group: "Certifications",
    options: ["ISO", "ISPO", "Halal"],
  },
  {
    group: "Sports",
    options: [
      "Football",
      "Volleyball",
      "Badminton",
      "Marathon",
      "Train Running",
    ],
  },
];
