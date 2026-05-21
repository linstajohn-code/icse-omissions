# Ingest Report

> This file is the canonical record of every issue encountered during PDF inspection and ingestion. It is append-only — issues are never deleted, only resolved with a dated note.

---

## CRITICAL — Wrong source document (unresolved, human review required)

**Date detected:** 2026-05-21  
**PDF inspected:** `https://cisce.org/wp-content/uploads/2026/01/1.-Regulations.pdf`  
**SHA256:** (see Supabase Storage after upload)  
**Status:** ❌ BLOCKED — cannot proceed with ingest

### What the document actually is

The PDF at the provided URL is titled:

> **ICSE YEAR 2028 REGULATIONS FOR EXAMINATION — Indian Certificate of Secondary Education**

Developed by: Research, Development and Curriculum Division (RDCD), CISCE. Published January 2026.

This is the **administrative regulations document** covering:
- General exam rules (attendance, disqualification, withdrawal)
- Subject groupings and selection rules (Part I/II, Group I/II/III)
- Assessment percentages (80% external + 20% internal)
- Fee structures, appeals, results, certificates

It contains **no omission data, no syllabus content, and no chapter/topic listings for any subject.** It is 24 pages / ~70,700 characters of administrative text.

The document itself states (Section H, p.4):

> "The Scope of Selected Syllabuses of the Indian Certificate of Secondary Education Examination (ICSE) is included in the document **'Regulations and Syllabuses'**."

### What we actually need

CISCE omissions data typically appears in **one or both** of:

1. **The full "Regulations and Syllabuses" document** — a separate, much longer PDF (~300–600 pages) that contains the syllabus for every subject with explicitly struck-through or bracketed omitted portions, or a dedicated "Omissions" annex.

2. **A standalone "Reduced Syllabus" or "Omissions" circular** — issued each academic year listing which portions are not to be assessed, e.g. "ICSE 2026-27 Reduced Syllabus.pdf". These are typically posted to `https://cisce.org/publications.aspx` or linked from the exam timetable page.

### What this means for the build

We **cannot** proceed with Phase 1 until we have a PDF that actually contains the omission listings. Building a parser against the wrong document would produce zero output at best, and incorrect data at worst — which is worse than no data for a product real students will use before exams.

### Resolution needed from the user

Please provide one of:
- (a) A direct URL to the CISCE "Regulations and Syllabuses" PDF (often a second numbered document, e.g. `2.-Regulations-and-Syllabuses.pdf`).
- (b) A URL to a CISCE "Reduced Syllabus" or "Omissions" circular for the current academic session (2025-26 or 2026-27).
- (c) A locally saved copy of the relevant PDF.

---

## Subject list in the regulations document (informational, resolved)

The subject groupings extracted from the Regulations PDF (Section A, Chapter II) are:

**Part I — Compulsory (internal only, not in ICSE written exam):**
English (GROUP I), A Second Language, History Civics and Geography (GROUP I)

**GROUP II (any two/three):**
Mathematics, Science (Physics, Chemistry, Biology), Economics, Commercial Studies, A Modern Foreign Language, A Classical Language, Environmental Science

**GROUP III (any two):**
Computer Applications, Economic Applications, Commercial Applications, Environmental Applications, Home Science, Fashion Designing, Physical Education, Yoga, Art, Performing Arts, Cookery, Technical Drawing Applications, A Modern Indian Language

> NOTE: "Science" is listed as a single subject (Physics + Chemistry + Biology combined), not three separate subjects in the regulations table. The split into PHY/CHE/BIO in our `subjects.json` seed list is correct for the syllabus document — this will be reconciled when we have that document.

---

## Findings log (chronological)

| Date | Finding | Status |
|------|---------|--------|
| 2026-05-21 | CISCE PDF is the regulations document only; contains zero omission data | ❌ Unresolved — awaiting correct document from user |
| 2026-05-21 | Subject groupings in regulations partially match our `subjects.json` seed | ✅ Minor reconciliation needed when real syllabus document is available |

## ⚠️ ISSUES — cisce28-9.-Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/cisce28-9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSE INDIAN CERTIFICATE OF SECONDARY EDUCATION EXAMINATION YEAR 2028 MATHEMATICS (51)

January 202 6 ____________________________________________________________________________________________ © Copyright, Council for the Indian School Certificate Examinations All rights reserved. The copyright to
```

---

## ⚠️ ISSUES — cisce28-9.-Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/cisce28-9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSE INDIAN CERTIFICATE OF SECONDARY EDUCATION EXAMINATION YEAR 2028 MATHEMATICS (51)

January 202 6 ____________________________________________________________________________________________ © Copyright, Council for the Indian School Certificate Examinations All rights reserved. The copyright to
```

---

## ✅ OK — cisce28-9.-Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/cisce28-9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 26

---

## ✅ OK — cisce28-9.-Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/cisce28-9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 7
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 7
- **Topics found:** 26

---

## ✅ OK — History and Civics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 16

---

## ✅ OK — History and Civics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 16

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 9
- **Topics found:** 23

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      21,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 9
- **Topics found:** 23

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      21,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 6
- **Topics found:** 20

---

## ✅ OK — History and Civics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 16

---

## ✅ OK — History and Civics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 16

---

## ✅ OK — Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 7
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 7
- **Topics found:** 26

---

## ✅ OK — History and Civics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 16

---

## ✅ OK — History and Civics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 16

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 6
- **Topics found:** 20

---

## ✅ OK — Commercial Studies (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/14.-Commercial-Studies.pdf`
- **Pages:** 9
- **Chapters found:** 7
- **Topics found:** 19

---

## ✅ OK — Commercial Studies (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/14.-Commercial-Studies.pdf`
- **Pages:** 9
- **Chapters found:** 7
- **Topics found:** 19

---

## ✅ OK — Commercial Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/20.-Commercial-Applications.pdf`
- **Pages:** 11
- **Chapters found:** 4
- **Topics found:** 13

---

## ✅ OK — Commercial Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/20.-Commercial-Applications.pdf`
- **Pages:** 11
- **Chapters found:** 4
- **Topics found:** 16

---

## ✅ OK — Yoga (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 44
- **Topics found:** 60

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      35,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      36,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      37,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      38,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      40,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      41,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      42,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      43,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      44,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      45,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      46,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      47,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      48,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      49,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      50,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      51,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      53,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      54,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      55,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Yoga (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 36
- **Topics found:** 47

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      26,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      27,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      28,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      29,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      30,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      31,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      32,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      33,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      34,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      35,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      36,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      37,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      38,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      40,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      41,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      42,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      43,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      45,
      "source_excerpt"
    ]
  }
]

---

## ⚠️ ISSUES — English (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ⚠️ ISSUES — English (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ✅ OK — Biology (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/12.-Biology.pdf`
- **Pages:** 13
- **Chapters found:** 7
- **Topics found:** 18

---

## ✅ OK — Biology (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/12.-Biology.pdf`
- **Pages:** 13
- **Chapters found:** 6
- **Topics found:** 25

---

## ✅ OK — Economic Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/19.-Economic-Applications.pdf`
- **Pages:** 10
- **Chapters found:** 5
- **Topics found:** 7

---

## ✅ OK — Economic Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/19.-Economic-Applications.pdf`
- **Pages:** 10
- **Chapters found:** 5
- **Topics found:** 5

---

## ✅ OK — Computer Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 11
- **Topics found:** 15

---

## ✅ OK — Computer Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 8
- **Topics found:** 14

---

## ✅ OK — Economics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/13.-Economics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 18

---

## ✅ OK — Economics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/13.-Economics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 18

---

## ✅ OK — Geography (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/6.-Geography.pdf`
- **Pages:** 12
- **Chapters found:** 7
- **Topics found:** 27

---

## ✅ OK — Geography (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/6.-Geography.pdf`
- **Pages:** 12
- **Chapters found:** 11
- **Topics found:** 33

---

## ✅ OK — Environmental Science (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/17.-Environmental-Science.pdf`
- **Pages:** 19
- **Chapters found:** 8
- **Topics found:** 22

---

## ✅ OK — Environmental Science (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/17.-Environmental-Science.pdf`
- **Pages:** 19
- **Chapters found:** 19
- **Topics found:** 37

---

## ⚠️ ISSUES — Second Languages (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
INDIAN LANGUAGES

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to t
```

---

## ⚠️ ISSUES — Second Languages (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
INDIAN LANGUAGES

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to t
```

---

## ✅ OK — Chemistry (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/11.-Chemistry.pdf`
- **Pages:** 18
- **Chapters found:** 8
- **Topics found:** 21

---

## ✅ OK — Performing Arts (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 14
- **Topics found:** 16

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      0,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      2,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      3,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      7,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      9,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      11,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Performing Arts (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 16
- **Topics found:** 22

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      0,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      1,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      6,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      7,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      8,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Chemistry (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/11.-Chemistry.pdf`
- **Pages:** 18
- **Chapters found:** 9
- **Topics found:** 38

---

## ✅ OK — Physical Education (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 42
- **Topics found:** 97

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      15,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      28,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      50,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      66,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      83,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Physical Education (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 47
- **Topics found:** 114

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      19,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      31,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      46,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      57,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      76,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      93,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Computer Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 11
- **Topics found:** 15

---

## ✅ OK — Computer Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 8
- **Topics found:** 14

---

## ⚠️ ISSUES — English (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ⚠️ ISSUES — English (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ✅ OK — Performing Arts (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 14
- **Topics found:** 16

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      0,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      2,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      3,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      7,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      9,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      11,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Performing Arts (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 16
- **Topics found:** 22

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      0,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      1,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      6,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      7,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      8,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Physical Education (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 42
- **Topics found:** 97

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      15,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      28,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      50,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      66,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      83,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Physical Education (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 47
- **Topics found:** 114

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      19,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      31,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      46,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      57,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      76,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      93,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Yoga (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 44
- **Topics found:** 60

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      35,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      36,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      37,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      38,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      40,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      41,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      42,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      43,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      44,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      45,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      46,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      47,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      48,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      49,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      50,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      51,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      53,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      54,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      55,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Yoga (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 36
- **Topics found:** 47

### Warnings
- Validation error: [
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      26,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      27,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      28,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      29,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      30,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      31,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      32,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      33,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      34,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      35,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      36,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      37,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      38,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      39,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      40,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      41,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      42,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      43,
      "source_excerpt"
    ]
  },
  {
    "code": "too_small",
    "minimum": 1,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "String must contain at least 1 character(s)",
    "path": [
      "entries",
      45,
      "source_excerpt"
    ]
  }
]

---

## ✅ OK — Performing Arts (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 14
- **Topics found:** 16

---

## ✅ OK — Performing Arts (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 16
- **Topics found:** 22

---

## ✅ OK — Physical Education (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 42
- **Topics found:** 97

---

## ✅ OK — Physical Education (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 47
- **Topics found:** 114

---

## ✅ OK — Yoga (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 44
- **Topics found:** 60

---

## ✅ OK — Yoga (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 36
- **Topics found:** 47

---

## ⚠️ ISSUES — Second Languages (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
INDIAN LANGUAGES

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to t
```

---

## ⚠️ ISSUES — Second Languages (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
INDIAN LANGUAGES

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to t
```

---

## ⚠️ ISSUES — English (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS IX section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS IX section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ⚠️ ISSUES — English (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 0
- **Topics found:** 0

### Warnings
- CLASS X section not found in document

### Unparsed sections (require human review)

**Page 1** — CLASS X section not found
```

ICSEINDIAN CERTIFICATE OF
SECONDARY EDUCATION
EXAMINATION
YEAR 2028
ENGLISH
(01)

January 2026
____________________________________________________________________________________________
© Copyright, Council for the Indian School Certificate Examinations
All rights reserved. The copyright to this 
```

---

## ✅ OK — English (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 11

---

## ✅ OK — English (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 11

---

## ✅ OK — Second Languages (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 4
- **Topics found:** 4

---

## ⚠️ ISSUES — Second Languages (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Unparsed sections (require human review)

**Page 5** — No chapters found in section — check heading format
```
Class X: Two or three assignments of reasonable length/duration of which two should be written assignments – one from the language and one from the literature component of the syllabus. SUGGESTED ASSIGNMENTS Language: Class IX: Creative Writing: Students are to write short compositions (approximatel
```

---

## ✅ OK — History and Civics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 16

---

## ✅ OK — History and Civics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/5.-History-Civics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 16

---

## ✅ OK — Biology (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/12.-Biology.pdf`
- **Pages:** 13
- **Chapters found:** 7
- **Topics found:** 18

---

## ✅ OK — Biology (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/12.-Biology.pdf`
- **Pages:** 13
- **Chapters found:** 6
- **Topics found:** 25

---

## ✅ OK — Economics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/13.-Economics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 18

---

## ✅ OK — Economics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/13.-Economics.pdf`
- **Pages:** 11
- **Chapters found:** 6
- **Topics found:** 18

---

## ✅ OK — Commercial Studies (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/14.-Commercial-Studies.pdf`
- **Pages:** 9
- **Chapters found:** 7
- **Topics found:** 19

---

## ✅ OK — Commercial Studies (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/14.-Commercial-Studies.pdf`
- **Pages:** 9
- **Chapters found:** 7
- **Topics found:** 19

---

## ✅ OK — English (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 11

---

## ✅ OK — English (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/2.-English.pdf`
- **Pages:** 11
- **Chapters found:** 11
- **Topics found:** 11

---

## ✅ OK — Commercial Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/20.-Commercial-Applications.pdf`
- **Pages:** 11
- **Chapters found:** 4
- **Topics found:** 13

---

## ✅ OK — Commercial Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/20.-Commercial-Applications.pdf`
- **Pages:** 11
- **Chapters found:** 4
- **Topics found:** 16

---

## ✅ OK — Second Languages (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 4
- **Topics found:** 4

---

## ⚠️ ISSUES — Second Languages (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Unparsed sections (require human review)

**Page 5** — No chapters found in section — check heading format
```
Class X: Two or three assignments of reasonable length/duration of which two should be written assignments – one from the language and one from the literature component of the syllabus. SUGGESTED ASSIGNMENTS Language: Class IX: Creative Writing: Students are to write short compositions (approximatel
```

---

## ✅ OK — Computer Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 11
- **Topics found:** 15

---

## ✅ OK — Computer Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/18.-Computer-Applications.pdf`
- **Pages:** 14
- **Chapters found:** 8
- **Topics found:** 14

---

## ✅ OK — Economic Applications (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/19.-Economic-Applications.pdf`
- **Pages:** 10
- **Chapters found:** 5
- **Topics found:** 7

---

## ✅ OK — Economic Applications (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/19.-Economic-Applications.pdf`
- **Pages:** 10
- **Chapters found:** 5
- **Topics found:** 5

---

## ✅ OK — Geography (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/6.-Geography.pdf`
- **Pages:** 12
- **Chapters found:** 7
- **Topics found:** 27

---

## ✅ OK — Geography (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/6.-Geography.pdf`
- **Pages:** 12
- **Chapters found:** 11
- **Topics found:** 33

---

## ✅ OK — Physical Education (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 42
- **Topics found:** 97

---

## ✅ OK — Physical Education (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/26.-Physical-Education.pdf`
- **Pages:** 35
- **Chapters found:** 47
- **Topics found:** 114

---

## ✅ OK — Mathematics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 26

---

## ✅ OK — Mathematics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/9.-Mathematics.pdf`
- **Pages:** 16
- **Chapters found:** 7
- **Topics found:** 26

---

## ✅ OK — Environmental Science (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/17.-Environmental-Science.pdf`
- **Pages:** 19
- **Chapters found:** 8
- **Topics found:** 22

---

## ✅ OK — Environmental Science (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/17.-Environmental-Science.pdf`
- **Pages:** 19
- **Chapters found:** 19
- **Topics found:** 37

---

## ✅ OK — Performing Arts (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 14
- **Topics found:** 16

---

## ✅ OK — Performing Arts (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/22.-Performing-Arts.pdf`
- **Pages:** 27
- **Chapters found:** 16
- **Topics found:** 22

---

## ✅ OK — Chemistry (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/11.-Chemistry.pdf`
- **Pages:** 18
- **Chapters found:** 8
- **Topics found:** 21

---

## ✅ OK — Chemistry (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/11.-Chemistry.pdf`
- **Pages:** 18
- **Chapters found:** 9
- **Topics found:** 38

---

## ✅ OK — Yoga (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 44
- **Topics found:** 60

---

## ✅ OK — Yoga (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/27.-Yoga.pdf`
- **Pages:** 17
- **Chapters found:** 36
- **Topics found:** 47

---

## ✅ OK — Physics (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 8
- **Topics found:** 18

---

## ✅ OK — Physics (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/10.-Physics.pdf`
- **Pages:** 16
- **Chapters found:** 6
- **Topics found:** 20

---

## ✅ OK — Second Languages (Class 9) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 4
- **Topics found:** 4

---

## ⚠️ ISSUES — Second Languages (Class 10) (2026-05-21)

- **PDF:** `/tmp/cisce-pdfs/3.-Second-Languages.pdf`
- **Pages:** 16
- **Chapters found:** 0
- **Topics found:** 0

### Unparsed sections (require human review)

**Page 5** — No chapters found in section — check heading format
```
Class X: Two or three assignments of reasonable length/duration of which two should be written assignments – one from the language and one from the literature component of the syllabus. SUGGESTED ASSIGNMENTS Language: Class IX: Creative Writing: Students are to write short compositions (approximatel
```

---
