// Sample data + helpers for Workload Prioritizer

// Subjects with cute pastel colors
const SUBJECTS = [
  { id: 'aws',   name: 'AWS Cloud',     short: 'AWS', color: '#a78bfa' }, // soft purple
  { id: 'os',    name: 'Operating Sys', short: 'OS',  color: '#86efac' }, // mint green
  { id: 'algo',  name: 'Algorithms',    short: 'ALG', color: '#fbbf24' }, // soft yellow
  { id: 'hack',  name: 'Hackathon',     short: 'HCK', color: '#fb7185' }, // soft pink
  { id: 'db',    name: 'Database',      short: 'DB',  color: '#c4b5fd' }, // light lavender
  { id: 'web',   name: 'Web Dev',       short: 'WEB', color: '#67e8f9' }, // cyan
  { id: 'math',  name: 'Calculus',      short: 'MTH', color: '#fdba74' }, // peach
];

// Difficulty multiplier: 1=easy ..5=hard. Maps to base hours.
function estimateHours({ difficulty, importance, comfortable }) {
  // base from difficulty
  let h = 1 + (difficulty - 1) * 0.9; // d=1 → 1h, d=5 → 4.6h
  // importance bumps (slightly)
  h += (importance - 3) * 0.4;
  // not comfortable → +30%
  if (!comfortable) h *= 1.3;
  return Math.max(1, Math.round(h * 2) / 2); // round to 0.5h, min 1
}

// Distribute total hours across N days as evenly as possible (in 0.5h chunks)
function splitHours(total, days) {
  if (days <= 0) return [];
  const slices = Math.round(total * 2); // half-hour units
  const base = Math.floor(slices / days);
  const rem = slices - base * days;
  const out = Array(days).fill(base / 2);
  for (let i = 0; i < rem; i++) out[i] += 0.5;
  return out;
}

// Determine across how many days a task should be split
function daysToSplit(hours) {
  if (hours <= 2) return 1;
  if (hours <= 4) return 2;
  if (hours <= 6) return 3;
  if (hours <= 9) return 4;
  return 5;
}

// Build week dates starting Monday
function weekDates(weekOffset = 0) {
  const today = new Date(2026, 3, 27); // Monday Apr 27 2026 — fixed for prototype
  const dow = today.getDay(); // 0..6, 1 = Mon
  const monday = new Date(today);
  const diff = (dow === 0 ? -6 : 1 - dow);
  monday.setDate(today.getDate() + diff + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_LABELS_TH = ['จ.','อ.','พ.','พฤ.','ศ.','ส.','อา.'];

// Sample initial tasks — mapped to current week (offset 0)
function makeInitialTasks() {
  return [
    {
      id: 't1', title: 'AWS Lambda assignment', subjectId: 'aws',
      deadline: 4, // day index (Friday)
      difficulty: 4, importance: 5, comfortable: false,
      hours: 4,
      slots: [
        { day: 1, hours: 2 },
        { day: 3, hours: 2 },
      ],
    },
    {
      id: 't2', title: 'OS scheduler project', subjectId: 'os',
      deadline: 5,
      difficulty: 5, importance: 4, comfortable: false,
      hours: 5,
      slots: [
        { day: 0, hours: 2 },
        { day: 2, hours: 1.5 },
        { day: 4, hours: 1.5 },
      ],
    },
    {
      id: 't3', title: 'Algorithms — DP problems', subjectId: 'algo',
      deadline: 3,
      difficulty: 3, importance: 4, comfortable: true,
      hours: 3,
      slots: [
        { day: 1, hours: 1.5 },
        { day: 2, hours: 1.5 },
      ],
    },
    {
      id: 't4', title: 'Hackathon prep', subjectId: 'hack',
      deadline: 6,
      difficulty: 3, importance: 5, comfortable: true,
      hours: 4,
      slots: [
        { day: 5, hours: 2 },
        { day: 6, hours: 2 },
      ],
    },
    {
      id: 't5', title: 'Calculus exercises', subjectId: 'math',
      deadline: 4,
      difficulty: 2, importance: 3, comfortable: true,
      hours: 2,
      slots: [
        { day: 3, hours: 2 },
      ],
    },
  ];
}

const STRINGS = {
  en: {
    appName: 'Workload Prioritizer',
    tagline: 'See your week before it sees you.',
    week: 'Week',
    today: 'Today',
    addTask: 'Add task',
    addNewTask: 'Add a new task',
    title: 'Title',
    subject: 'Subject',
    addSubject: 'Add Subject',
    subjectName: 'Subject name',
    orCustomDate: 'Or select a custom date',
    deadline: 'Deadline',
    difficulty: 'Difficulty',
    importance: 'Importance',
    comfortable: 'Comfortable with this?',
    yes: 'Yes',
    no: 'No',
    estimated: 'Estimated time',
    autoCalc: 'auto',
    save: 'Add to week',
    cancel: 'Cancel',
    hours: 'h',
    hoursFull: 'hours',
    dayLabels: DAY_LABELS_EN,
    capacity: 'Capacity',
    perDay: '/day',
    overload: 'Over capacity',
    overloadHint: 'Move a task to another day to bring this under your limit.',
    totalThisWeek: 'Total this week',
    tasksThisWeek: 'Tasks this week',
    overdays: 'Days over limit',
    yourTasks: 'Your tasks',
    empty: 'No tasks yet — add one to start visualizing your week.',
    dueIn: 'due',
    deleteTask: 'Delete',
    splitAcross: 'split across',
    days: 'days',
    chartType: 'Chart',
    stacked: 'Stacked',
    bar: 'Bar',
    heatmap: 'Heatmap',
    settings: 'Settings',
    onboardingTitle: 'Welcome',
    onboardingDesc: 'Tell us how much you can take on each day. We\'ll warn you when a week gets scary.',
    capacityQ: 'How many hours per day can you handle?',
    start: 'Start planning',
    legend: 'Subjects',
    weekHigh: 'Heaviest day',
    none: '—',
  },
  th: {
    appName: 'Workload Prioritizer',
    tagline: 'เห็นสัปดาห์ก่อนที่มันจะถล่มคุณ',
    week: 'สัปดาห์',
    today: 'วันนี้',
    addTask: 'เพิ่มงาน',
    addNewTask: 'เพิ่มงานใหม่',
    title: 'ชื่องาน',
    subject: 'วิชา',
    addSubject: 'เพิ่มวิชา',
    subjectName: 'ชื่อวิชา',
    orCustomDate: 'หรือเลือกวันที่กำหนดเอง',
    deadline: 'เดดไลน์',
    difficulty: 'ความยาก',
    importance: 'ความสำคัญ',
    comfortable: 'ถนัดเรื่องนี้ไหม?',
    yes: 'ถนัด',
    no: 'ไม่ถนัด',
    estimated: 'เวลาประมาณ',
    autoCalc: 'อัตโนมัติ',
    save: 'เพิ่มเข้าสัปดาห์',
    cancel: 'ยกเลิก',
    hours: 'ชม.',
    hoursFull: 'ชั่วโมง',
    dayLabels: DAY_LABELS_TH,
    capacity: 'รับไหว',
    perDay: '/วัน',
    overload: 'เกินที่รับไหว',
    overloadHint: 'ลองย้ายงานไปวันอื่นเพื่อให้อยู่ในขีดจำกัด',
    totalThisWeek: 'รวมสัปดาห์นี้',
    tasksThisWeek: 'งานสัปดาห์นี้',
    overdays: 'วันที่เกินลิมิต',
    yourTasks: 'รายการงาน',
    empty: 'ยังไม่มีงาน — เพิ่มงานเพื่อเริ่มดูภาพสัปดาห์',
    dueIn: 'ส่ง',
    deleteTask: 'ลบ',
    splitAcross: 'แบ่งเป็น',
    days: 'วัน',
    chartType: 'แผนภูมิ',
    stacked: 'ซ้อนสี',
    bar: 'แท่ง',
    heatmap: 'ฮีตแมป',
    settings: 'ตั้งค่า',
    onboardingTitle: 'ยินดีต้อนรับ',
    onboardingDesc: 'บอกเราว่ารับงานได้กี่ชั่วโมงต่อวัน เราจะเตือนเมื่อสัปดาห์เริ่มน่ากลัว',
    capacityQ: 'รับงานได้กี่ชั่วโมง/วัน?',
    start: 'เริ่มวางแผน',
    legend: 'วิชา',
    weekHigh: 'วันที่หนักสุด',
    none: '—',
  },
};

Object.assign(window, {
  SUBJECTS, estimateHours, splitHours, daysToSplit,
  weekDates, makeInitialTasks, STRINGS,
});
