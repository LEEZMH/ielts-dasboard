const { createDefaultStateRecord, normalizeStateRecord } = require("./defaults");
const { query, withTransaction } = require("./db");
const { hashPassword, normalizeEmail, normalizePassword, verifyPassword } = require("./auth");

function toIso(value) {
  if (!value) {
    return new Date().toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizePermissions(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    checkin: Boolean(raw.checkin),
    records: Boolean(raw.records),
    allModules: Boolean(raw.allModules),
    modules: Array.isArray(raw.modules) ? raw.modules : [],
  };
}

function mapUserRow(row) {
  const normalizedState = normalizeStateRecord(
    {
      onboarding: row.onboarding,
      onboardingCompleted: row.onboarding_completed,
      showGeneratedPage: row.show_generated_page,
      tasks: row.tasks,
      records: row.records,
      checkins: row.checkins,
      calendarEvents: row.calendar_events,
      mockSessions: row.mock_sessions,
    },
    row.onboarding?.planMode
  );

  return {
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: toIso(row.created_at),
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboarding: normalizedState.onboarding,
    tasks: normalizedState.tasks,
    records: normalizedState.records,
    checkins: normalizedState.checkins,
    calendarEvents: normalizedState.calendarEvents,
    mockSessions: normalizedState.mockSessions,
    showGeneratedPage: Boolean(row.show_generated_page),
  };
}

function privateUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function publicUser(user) {
  return {
    id: user.id,
    nickname: user.nickname,
    email: user.email,
    createdAt: user.createdAt,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    showGeneratedPage: Boolean(user.showGeneratedPage),
    onboarding: {
      privacy: user.onboarding?.privacy || createDefaultStateRecord().onboarding.privacy,
    },
  };
}

function mapSharingRequestRow(row) {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toEmail: row.to_email,
    status: row.status,
    permissions: normalizePermissions(row.permissions),
    createdAt: toIso(row.created_at),
    acceptedAt: row.accepted_at ? toIso(row.accepted_at) : null,
  };
}

async function listUsers(client = null) {
  const runner = client || { query };
  const result = await runner.query(`
    SELECT
      u.id,
      u.nickname,
      u.email,
      u.password_hash,
      u.created_at,
      COALESCE(s.onboarding_completed, false) AS onboarding_completed,
      COALESCE(s.show_generated_page, false) AS show_generated_page,
      COALESCE(s.onboarding, '{}'::jsonb) AS onboarding,
      COALESCE(s.tasks, '[]'::jsonb) AS tasks,
      COALESCE(s.records, '[]'::jsonb) AS records,
      COALESCE(s.checkins, '[]'::jsonb) AS checkins,
      COALESCE(s.calendar_events, '[]'::jsonb) AS calendar_events,
      COALESCE(s.mock_sessions, '{}'::jsonb) AS mock_sessions
    FROM public.users u
    LEFT JOIN public.user_states s ON s.user_id = u.id
    ORDER BY u.created_at ASC
  `);
  return result.rows.map(mapUserRow);
}

async function listSharingRequests(client = null) {
  const runner = client || { query };
  const result = await runner.query(`
    SELECT
      id,
      from_user_id,
      to_email,
      status,
      permissions,
      created_at,
      accepted_at
    FROM public.sharing_requests
    ORDER BY created_at DESC
  `);
  return result.rows.map(mapSharingRequestRow);
}

async function getUserByEmail(email, client = null) {
  const runner = client || { query };
  const result = await runner.query(
    `
      SELECT
        u.id,
        u.nickname,
        u.email,
        u.password_hash,
        u.created_at,
        COALESCE(s.onboarding_completed, false) AS onboarding_completed,
        COALESCE(s.show_generated_page, false) AS show_generated_page,
        COALESCE(s.onboarding, '{}'::jsonb) AS onboarding,
        COALESCE(s.tasks, '[]'::jsonb) AS tasks,
        COALESCE(s.records, '[]'::jsonb) AS records,
        COALESCE(s.checkins, '[]'::jsonb) AS checkins,
        COALESCE(s.calendar_events, '[]'::jsonb) AS calendar_events,
        COALESCE(s.mock_sessions, '{}'::jsonb) AS mock_sessions
      FROM public.users u
      LEFT JOIN public.user_states s ON s.user_id = u.id
      WHERE lower(u.email) = lower($1)
      LIMIT 1
    `,
    [normalizeEmail(email)]
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

async function getUserById(userId, client = null) {
  const runner = client || { query };
  const result = await runner.query(
    `
      SELECT
        u.id,
        u.nickname,
        u.email,
        u.password_hash,
        u.created_at,
        COALESCE(s.onboarding_completed, false) AS onboarding_completed,
        COALESCE(s.show_generated_page, false) AS show_generated_page,
        COALESCE(s.onboarding, '{}'::jsonb) AS onboarding,
        COALESCE(s.tasks, '[]'::jsonb) AS tasks,
        COALESCE(s.records, '[]'::jsonb) AS records,
        COALESCE(s.checkins, '[]'::jsonb) AS checkins,
        COALESCE(s.calendar_events, '[]'::jsonb) AS calendar_events,
        COALESCE(s.mock_sessions, '{}'::jsonb) AS mock_sessions
      FROM public.users u
      LEFT JOIN public.user_states s ON s.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

async function buildSnapshot(currentUserId) {
  if (!currentUserId) {
    return {
      currentUserId: null,
      users: [],
      sharingRequests: [],
    };
  }

  const [users, sharingRequests] = await Promise.all([listUsers(), listSharingRequests()]);
  return {
    currentUserId,
    users: users.map((user) => (user.id === currentUserId ? privateUser(user) : publicUser(user))),
    sharingRequests,
  };
}

async function registerUser({ nickname, email, password, planMode }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedNickname = String(nickname || "").trim();
  const passwordHash = await hashPassword(password);
  const initialState = createDefaultStateRecord(planMode);

  return withTransaction(async (client) => {
    const existing = await client.query(
      "SELECT id FROM public.users WHERE lower(email) = lower($1) LIMIT 1",
      [normalizedEmail]
    );
    if (existing.rows[0]) {
      const error = new Error("Email already exists.");
      error.code = "email_exists";
      throw error;
    }

    const insertedUser = await client.query(
      `
        INSERT INTO public.users (nickname, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [normalizedNickname, normalizedEmail, passwordHash]
    );

    const userId = insertedUser.rows[0].id;
    await client.query(
      `
        INSERT INTO public.user_states (
          user_id,
          onboarding,
          onboarding_completed,
          show_generated_page,
          tasks,
          records,
          checkins,
          calendar_events,
          mock_sessions
        )
        VALUES ($1, $2::jsonb, false, false, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb)
      `,
      [userId, JSON.stringify(initialState.onboarding)]
    );

    return userId;
  });
}

async function authenticateUser({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

async function syncSharingRequests(client, currentUserId, currentEmail, submittedRequests) {
  if (!Array.isArray(submittedRequests)) {
    return;
  }

  const normalizedCurrentEmail = normalizeEmail(currentEmail);
  const relevantRequests = submittedRequests.filter((request) => {
    if (!request || typeof request !== "object") {
      return false;
    }
    return (
      String(request.fromUserId || "") === String(currentUserId) ||
      normalizeEmail(request.toEmail) === normalizedCurrentEmail
    );
  });

  for (const request of relevantRequests) {
    const id = String(request.id || "").trim();
    if (!id) {
      continue;
    }

    const status = ["pending", "accepted", "revoked"].includes(request.status)
      ? request.status
      : "pending";
    const permissions = normalizePermissions(request.permissions);
    const toEmail = normalizeEmail(request.toEmail);
    const createdAt = toIso(request.createdAt);
    const acceptedAt = request.acceptedAt ? toIso(request.acceptedAt) : null;

    if (String(request.fromUserId || "") === String(currentUserId)) {
      await client.query(
        `
          INSERT INTO public.sharing_requests (
            id,
            from_user_id,
            to_email,
            status,
            permissions,
            created_at,
            accepted_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, now())
          ON CONFLICT (id) DO UPDATE
          SET
            to_email = EXCLUDED.to_email,
            status = EXCLUDED.status,
            permissions = EXCLUDED.permissions,
            accepted_at = EXCLUDED.accepted_at,
            updated_at = now()
        `,
        [id, currentUserId, toEmail, status, JSON.stringify(permissions), createdAt, acceptedAt]
      );
      continue;
    }

    await client.query(
      `
        UPDATE public.sharing_requests
        SET
          status = $2,
          permissions = $3::jsonb,
          accepted_at = $4,
          updated_at = now()
        WHERE id = $1 AND lower(to_email) = lower($5)
      `,
      [id, status, JSON.stringify(permissions), acceptedAt, normalizedCurrentEmail]
    );
  }
}

async function saveUserState(currentUserId, incomingUser, submittedSharingRequests) {
  return withTransaction(async (client) => {
    const existingUser = await getUserById(currentUserId, client);
    if (!existingUser) {
      const error = new Error("User not found.");
      error.code = "user_not_found";
      throw error;
    }

    const nextNickname = String(incomingUser.nickname || existingUser.nickname || "").trim();
    const nextEmail = normalizeEmail(incomingUser.email || existingUser.email);
    const nextPassword = normalizePassword(incomingUser.password);

    const duplicate = await client.query(
      `
        SELECT id
        FROM public.users
        WHERE lower(email) = lower($1) AND id <> $2
        LIMIT 1
      `,
      [nextEmail, currentUserId]
    );
    if (duplicate.rows[0]) {
      const error = new Error("Email already exists.");
      error.code = "email_exists";
      throw error;
    }

    let passwordHash = existingUser.passwordHash;
    if (nextPassword) {
      passwordHash = await hashPassword(nextPassword);
    }

    const normalizedState = normalizeStateRecord(
      {
        onboarding: incomingUser.onboarding || existingUser.onboarding,
        onboardingCompleted:
          typeof incomingUser.onboardingCompleted === "boolean"
            ? incomingUser.onboardingCompleted
            : existingUser.onboardingCompleted,
        showGeneratedPage:
          typeof incomingUser.showGeneratedPage === "boolean"
            ? incomingUser.showGeneratedPage
            : existingUser.showGeneratedPage,
        tasks: incomingUser.tasks || existingUser.tasks,
        records: incomingUser.records || existingUser.records,
        checkins: incomingUser.checkins || existingUser.checkins,
        calendarEvents: incomingUser.calendarEvents || existingUser.calendarEvents,
        mockSessions: incomingUser.mockSessions || existingUser.mockSessions,
      },
      incomingUser.onboarding?.planMode || existingUser.onboarding?.planMode
    );

    await client.query(
      `
        UPDATE public.users
        SET
          nickname = $2,
          email = $3,
          password_hash = $4
        WHERE id = $1
      `,
      [currentUserId, nextNickname, nextEmail, passwordHash]
    );

    await client.query(
      `
        INSERT INTO public.user_states (
          user_id,
          onboarding,
          onboarding_completed,
          show_generated_page,
          tasks,
          records,
          checkins,
          calendar_events,
          mock_sessions,
          updated_at
        )
        VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb, now())
        ON CONFLICT (user_id) DO UPDATE
        SET
          onboarding = EXCLUDED.onboarding,
          onboarding_completed = EXCLUDED.onboarding_completed,
          show_generated_page = EXCLUDED.show_generated_page,
          tasks = EXCLUDED.tasks,
          records = EXCLUDED.records,
          checkins = EXCLUDED.checkins,
          calendar_events = EXCLUDED.calendar_events,
          mock_sessions = EXCLUDED.mock_sessions,
          updated_at = now()
      `,
      [
        currentUserId,
        JSON.stringify(normalizedState.onboarding),
        normalizedState.onboardingCompleted,
        normalizedState.showGeneratedPage,
        JSON.stringify(normalizedState.tasks),
        JSON.stringify(normalizedState.records),
        JSON.stringify(normalizedState.checkins),
        JSON.stringify(normalizedState.calendarEvents),
        JSON.stringify(normalizedState.mockSessions),
      ]
    );

    if (normalizeEmail(existingUser.email) !== nextEmail) {
      await client.query(
        `
          UPDATE public.sharing_requests
          SET
            to_email = $1,
            updated_at = now()
          WHERE lower(to_email) = lower($2)
        `,
        [nextEmail, existingUser.email]
      );
    }

    await syncSharingRequests(client, currentUserId, nextEmail, submittedSharingRequests);
  });
}

module.exports = {
  authenticateUser,
  buildSnapshot,
  getUserByEmail,
  registerUser,
  saveUserState,
};
