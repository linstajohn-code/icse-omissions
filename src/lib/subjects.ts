export interface SubjectMeta {
  slug: string;
  name: string;
  code: string;
  group: "I" | "II" | "III";
}

export const SUBJECTS: SubjectMeta[] = [
  { slug: "english",               name: "English",                code: "01",  group: "I"   },
  { slug: "second-languages",      name: "Second Languages",       code: "—",   group: "I"   },
  { slug: "history-and-civics",    name: "History & Civics",       code: "50",  group: "I"   },
  { slug: "geography",             name: "Geography",              code: "50",  group: "I"   },
  { slug: "mathematics",           name: "Mathematics",            code: "51",  group: "I"   },
  { slug: "physics",               name: "Physics",                code: "52",  group: "I"   },
  { slug: "chemistry",             name: "Chemistry",              code: "52",  group: "I"   },
  { slug: "biology",               name: "Biology",                code: "52",  group: "I"   },
  { slug: "economics",             name: "Economics",              code: "53",  group: "II"  },
  { slug: "commercial-studies",    name: "Commercial Studies",     code: "58",  group: "II"  },
  { slug: "environmental-science", name: "Environmental Science",  code: "82",  group: "II"  },
  { slug: "computer-applications", name: "Computer Applications",  code: "86",  group: "III" },
  { slug: "economic-applications", name: "Economic Applications",  code: "87",  group: "III" },
  { slug: "commercial-applications", name: "Commercial Applications", code: "88", group: "III" },
  { slug: "performing-arts",       name: "Performing Arts",        code: "91",  group: "III" },
  { slug: "physical-education",    name: "Physical Education",     code: "72",  group: "III" },
  { slug: "yoga",                  name: "Yoga",                   code: "84",  group: "III" },
];

export const SUBJECT_BY_SLUG = new Map(SUBJECTS.map((s) => [s.slug, s]));

export function getSubjectMeta(slug: string): SubjectMeta | undefined {
  return SUBJECT_BY_SLUG.get(slug);
}
