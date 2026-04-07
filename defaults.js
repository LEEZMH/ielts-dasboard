function pad(num) {
  return String(num).padStart(2, "0");
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function addDays(iso, amount) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function createDefaultOnboarding(planMode = "system") {
  return {
    planMode: planMode === "manual" ? "manual" : "system",
    targetScores: {
      overall: "7.5",
      listening: "7.5",
      speaking: "7.0",
      reading: "7.5",
      writing: "6.5",
    },
    currentLevels: {
      listening: "6.0",
      speaking: "5.5",
      reading: "6.0",
      writing: "5.5",
    },
    examDate: addDays(todayISO(), 90),
    materials: [],
    studyDuration: "3",
    dailyStudyHours: "3",
    availability: {
      weekday: [2, 3, 11, 12],
      weekend: [3, 4, 5, 10, 11, 12],
    },
    modules: ["listening", "speaking", "reading", "writing", "vocabulary", "grammar"],
    preferences: {
      mood: "formal",
      welcomeTone: "auto",
      homeSections: ["overview", "modules", "tasks", "records"],
    },
    privacy: {
      allowRequests: true,
      manualApproval: true,
      defaultPrivate: true,
    },
  };
}

function normalizeArray(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function normalizeObject(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function normalizeOnboarding(raw = {}) {
  const defaults = createDefaultOnboarding(raw.planMode);
  const availability = normalizeObject(raw.availability, {});
  return {
    planMode: raw.planMode === "manual" ? "manual" : "system",
    targetScores: {
      ...defaults.targetScores,
      ...normalizeObject(raw.targetScores, {}),
    },
    currentLevels: {
      ...defaults.currentLevels,
      ...normalizeObject(raw.currentLevels, {}),
    },
    examDate: String(raw.examDate || defaults.examDate),
    materials: normalizeArray(raw.materials, defaults.materials),
    studyDuration: String(raw.studyDuration || defaults.studyDuration),
    dailyStudyHours: String(raw.dailyStudyHours || defaults.dailyStudyHours),
    availability: {
      weekday: normalizeArray(availability.weekday, defaults.availability.weekday),
      weekend: normalizeArray(availability.weekend, defaults.availability.weekend),
    },
    modules: normalizeArray(raw.modules, defaults.modules),
    preferences: {
      ...defaults.preferences,
      ...normalizeObject(raw.preferences, {}),
      homeSections: normalizeArray(raw.preferences?.homeSections, defaults.preferences.homeSections),
    },
    privacy: {
      ...defaults.privacy,
      ...normalizeObject(raw.privacy, {}),
    },
  };
}

function createDefaultStateRecord(planMode = "system") {
  return {
    onboarding: createDefaultOnboarding(planMode),
    onboardingCompleted: false,
    showGeneratedPage: false,
    tasks: [],
    records: [],
    checkins: [],
    calendarEvents: [],
    mockSessions: {},
  };
}

function normalizeStateRecord(raw = {}, planMode = "system") {
  const defaults = createDefaultStateRecord(planMode);
  return {
    onboarding: normalizeOnboarding(raw.onboarding || defaults.onboarding),
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    showGeneratedPage: Boolean(raw.showGeneratedPage),
    tasks: normalizeArray(raw.tasks, defaults.tasks),
    records: normalizeArray(raw.records, defaults.records),
    checkins: normalizeArray(raw.checkins, defaults.checkins),
    calendarEvents: normalizeArray(raw.calendarEvents, defaults.calendarEvents),
    mockSessions: normalizeObject(raw.mockSessions, defaults.mockSessions),
  };
}

module.exports = {
  createDefaultOnboarding,
  createDefaultStateRecord,
  normalizeOnboarding,
  normalizeStateRecord,
};
