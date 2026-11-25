import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";

let backend, frontend, origin;

const requests = [];

const user = (name) => ({
  id: name === "Alice" ? 1 : 2,
  username: name,
  motto: "Hello",
  look: "",
  online: false,
  mail: `${name}@example.test`,
  balances: {},
  website_balance: { amount_minor: 0, currency: "EUR" },
  can_change_name: false,
  can_generate_logo: false,
  referral_code: null,
  referrals_needed: 1,
  two_factor_enabled: false,
  online_friends: [],
});

before(async () => {
  backend = createServer(async (req, res) => {
    requests.push({
      path: req.url,
      method: req.method,
      cookie: req.headers.cookie,
      host: req.headers.host,
      accept: req.headers.accept,
    });

    res.setHeader("content-type", "application/json");

    const name = req.headers.cookie?.match(/member=(Alice|Bob)/)?.[1];

    const restriction = req.headers.cookie?.match(
      /restriction=(account_banned|maintenance|two_factor_required)/,
    )?.[1];

    const viewer = name
      ? {
          ...user(name),
          ...(req.headers.cookie?.includes("avatar=1")
            ? {
                look: "hr-100-61.hd-180-1",
                online_friends: [
                  {
                    ...user("Bob"),
                    look: "hr-100-61.hd-180-1",
                    last_online: 1700000000,
                  },
                ],
              }
            : {}),
          requires_two_factor: !!restriction,
          can_generate_logo: req.headers.cookie?.includes("logo=1") || false,
          can_show_housekeeping_link:
            req.headers.cookie?.includes("housekeeping=1") || false,
          can_access_housekeeping: true,
        }
      : null;

    if (req.url === "/api/v1/bootstrap") {
      res.end(
        JSON.stringify({
          data: {
            hotel_name: "Theme Test",
            viewer,
            housekeeping_url: "/housekeeping",
            features: req.headers.cookie?.includes("emulator=ada")
              ? []
              : ["camera-photos", "rare-values"],
            online_count: 0,
            maintenance: restriction === "maintenance",
            locales: [{ locale: "en", name: "English" }],
            assets: {
              logo: "/assets/images/logo.png",
              avatar:
                "https://avatar.example.test/avatar?direction=4&head_direction=4&size=m&figure=",
              badge: "",
            },
            registration: {
              enabled: !req.headers.cookie?.includes("registration=closed"),
              requires_beta_code:
                !!req.headers.cookie?.includes("registration=beta"),
            },
            captcha: {},
            reactions: ["heart", "like", "wow"],
            latest_photos: [],
          },
        }),
      );
    } else if (req.url === "/api/v1/me") {
      res.statusCode = !viewer ? 401 : restriction ? 403 : 200;

      res.end(
        JSON.stringify(
          !viewer
            ? { code: "unauthenticated" }
            : restriction
              ? { error: { code: restriction, message: restriction } }
              : { data: viewer },
        ),
      );
    } else if (req.url.startsWith("/api/v1/status")) {
      res.end(
        JSON.stringify({
          data: {
            installed: true,
            mode: "headless",
            maintenance: restriction === "maintenance",
            maintenance_message: "<p>Scheduled hotel upgrade</p>",
            tasks: {
              items: [
                {
                  id: 1,
                  task: "Update the hotel",
                  completed: false,
                  user: null,
                },
              ],
              current_page: 1,
              has_more: false,
            },
          },
        }),
      );
    } else if (req.url === "/api/v1/ban") {
      res.end(
        JSON.stringify({
          data:
            restriction === "account_banned"
              ? {
                  type: "account",
                  ban_reason: "Restricted for this test",
                  ban_expire: null,
                }
              : null,
        }),
      );
    } else if (req.url === "/api/v1/staff" || req.url === "/api/v1/teams") {
      res.end(
        JSON.stringify({
          data: [
            {
              id: 1,
              name: "Community Hosts",
              description: "Here to help",
              color: "#327fa8",
              badge: null,
              background: null,
              users: [user("Alice")],
            },
          ],
        }),
      );
    } else if (req.url === "/api/v1/leaderboards") {
      res.end(
        JSON.stringify({
          data: { credits: [{ user: user("Alice"), value: 42 }] },
        }),
      );
    } else if (req.url.startsWith("/api/v1/photos")) {
      res.end(
        JSON.stringify({
          data: [
            {
              id: 1,
              url: "/assets/images/staff-bg.png",
              author: user("Alice"),
            },
          ],
          meta: { current_page: 1, last_page: 1 },
        }),
      );
    } else if (req.url === "/api/v1/homes/Alice") {
      res.end(
        JSON.stringify({
          data: {
            user: user("Alice"),
            active_background: null,
            items: [
              {
                id: 1,
                x: 30,
                y: 30,
                z: 1,
                placed: true,
                is_reversed: false,
                theme: "note",
                extra_data: "Welcome to my home",
                definition: {
                  id: 1,
                  type: "n",
                  name: "Welcome note",
                  image: null,
                },
              },
            ],
            member_since: "2026-01-01T00:00:00Z",
          },
        }),
      );
    } else if (req.url === "/api/v1/homes/Alice/shop") {
      res.end(JSON.stringify({ data: { categories: [], items: [] } }));
    } else if (req.url === "/api/v1/shop") {
      res.end(JSON.stringify({ data: { categories: [], packages: [] } }));
    } else if (req.url === "/api/v1/me/two-factor") {
      res.end(
        JSON.stringify({
          data: { enabled: false, qr_code: null, recovery_codes: [] },
        }),
      );
    } else if (req.url === "/api/v1/badges") {
      res.end(JSON.stringify({ data: { cost: 10, currency: "diamonds" } }));
    } else if (req.url === "/api/v1/articles/welcome") {
      res.end(
        JSON.stringify({
          data: {
            id: 1,
            slug: "welcome",
            title: "Welcome",
            full_story: "<p>Article body</p>",
            can_comment: true,
          },
          reactions: { heart: 2 },
          reaction_users: { heart: ["Alice", "Bob"] },
          my_reactions: name ? ["heart"] : [],
        }),
      );
    } else if (req.url.startsWith("/api/v1/articles/welcome/comments")) {
      res.end(JSON.stringify({ data: [] }));
    } else if (req.url.startsWith("/api/v1/articles")) {
      res.end(
        JSON.stringify({
          data: [
            {
              id: 1,
              slug: "welcome",
              title: "News rendered on the server",
              short_story: "Public article",
              full_story: "<p>Welcome</p>",
              image: null,
              created_at: null,
            },
          ],
          meta: { current_page: 1, last_page: 1 },
        }),
      );
    } else if (req.url.startsWith("/api/v1/applications")) {
      const position = {
        id: 1,
        kind: "team",
        name: "Events Team",
        description: "Host community events.",
        application_status:
          name === "Alice"
            ? req.headers.cookie?.match(
                /application=(pending|approved|rejected)/,
              )?.[1] || "pending"
            : null,
      };

      res.end(
        JSON.stringify({
          data: req.url === "/api/v1/applications/1" ? position : [position],
        }),
      );
    } else if (req.url.startsWith("/paypal/successful-transaction")) {
      res.statusCode = 302;

      res.setHeader("location", "/paypal/success?order=example");

      res.end();
    } else if (req.url === "/login" && req.method === "POST") {
      for await (const _ of req) {
        /* Drain request body before responding. */
      }

      res.setHeader("set-cookie", [
        "session=example; HttpOnly; Path=/; SameSite=Lax",
        "XSRF-TOKEN=example; Path=/; SameSite=Lax",
      ]);

      res.statusCode = 204;

      res.end();
    } else {
      res.end(JSON.stringify({ data: [] }));
    }
  }).listen(0, "127.0.0.1");

  await once(backend, "listening");

  const reservation = createServer().listen(0, "127.0.0.1");

  await once(reservation, "listening");

  const port = reservation.address().port;

  await new Promise((resolve) => reservation.close(resolve));

  origin = `http://127.0.0.1:${port}`;

  frontend = spawn(process.execPath, [".output/server/index.mjs"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      NUXT_BACKEND_URL: `http://127.0.0.1:${backend.address().port}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let logs = "";

  frontend.stdout.on("data", (data) => {
    logs += data;
  });

  frontend.stderr.on("data", (data) => {
    logs += data;
  });

  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`${origin}/assets/images/logo.png`);

      return;
    } catch {}

    if (frontend.exitCode !== null) break;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Nuxt failed to start: ${logs}`);
});

after(async () => {
  if (frontend && frontend.exitCode === null) {
    frontend.kill();

    await once(frontend, "exit");
  }

  if (backend) await new Promise((resolve) => backend.close(resolve));
});

test("public news renders in HTML and concurrent sessions remain isolated", async () => {
  const responses = await Promise.all(
    ["Alice", "Bob", null, "Alice", "Bob"].map(async (name) => {
      const response = await fetch(`${origin}/community/articles`, {
        headers: name ? { cookie: `member=${name}` } : {},
      });

      assert.equal(response.status, 200);

      assert.match(response.headers.get("cache-control"), /private.*no-store/);

      const html = await response.text();

      assert.match(html, /News rendered on the server/);

      if (name) {
        assert.ok(html.includes(name));

        assert.ok(
          !html.includes(
            name === "Alice" ? "Bob@example.test" : "Alice@example.test",
          ),
        );
      } else {
        assert.ok(
          !html.includes("Alice@example.test") &&
            !html.includes("Bob@example.test"),
        );
      }

      return html;
    }),
  );

  assert.equal(responses.length, 5);
});

test("guest account visits redirect to login while login GET stays a frontend page", async () => {
  const response = await fetch(`${origin}/user/me`, { redirect: "manual" });

  assert.equal(response.status, 302);

  assert.match(response.headers.get("location"), /^\/login\?next=/);

  const login = await fetch(`${origin}/login`);

  assert.equal(login.status, 200);

  assert.match(login.headers.get("content-type"), /text\/html/);

  assert.ok(
    !requests.some((req) => req.path === "/login" && req.method === "GET"),
  );
});

test("authentication proxy preserves method, cookies and backend Set-Cookie headers", async () => {
  const response = await fetch(`${origin}/login`, {
    method: "POST",
    headers: {
      cookie: "XSRF-TOKEN=example",
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ username: "Alice", password: "test-only" }),
  });

  assert.equal(response.status, 204);

  assert.equal(response.headers.getSetCookie().length, 2);

  assert.ok(
    requests.some(
      (req) => req.path === "/login" && req.accept === "application/json",
    ),
  );

  assert.ok(
    requests.some(
      (req) => req.path === "/login" && req.host === new URL(origin).host,
    ),
  );

  assert.ok(
    requests.some(
      (req) =>
        req.path === "/login" &&
        req.method === "POST" &&
        req.cookie === "XSRF-TOKEN=example",
    ),
  );
});

test("payment callbacks reach Laravel and preserve its redirect", async () => {
  const response = await fetch(
    `${origin}/paypal/successful-transaction?token=example`,
    { redirect: "manual" },
  );

  assert.equal(response.status, 302);

  assert.equal(
    response.headers.get("location"),
    "/paypal/success?order=example",
  );

  assert.ok(
    requests.some(
      (req) => req.path === "/paypal/successful-transaction?token=example",
    ),
  );
});

test("staff enrollment never loops against ban or maintenance restrictions", async () => {
  for (const [restriction, destination] of [
    ["account_banned", "/banned"],
    ["maintenance", "/maintenance"],
    ["two_factor_required", "/user/settings/two-factor"],
  ]) {
    const headers = { cookie: `member=Alice; restriction=${restriction}` };

    const response = await fetch(`${origin}/user/me`, {
      headers,
      redirect: "manual",
    });

    assert.equal(response.status, 302);

    assert.equal(response.headers.get("location"), destination);

    const final = await fetch(`${origin}${destination}`, {
      headers,
      redirect: "manual",
    });

    assert.equal(final.status, 200);

    if (restriction === "account_banned") {
      const support = await fetch(`${origin}/help-center`, {
        headers,
        redirect: "manual",
      });

      assert.equal(support.status, 200);
    }
  }
});

test("maintenance sends guests to the notice while keeping staff login reachable", async () => {
  const headers = { cookie: "restriction=maintenance" };

  const response = await fetch(`${origin}/`, { headers, redirect: "manual" });

  assert.equal(response.status, 302);

  assert.equal(response.headers.get("location"), "/maintenance");

  const notice = await fetch(`${origin}/maintenance`, { headers });

  assert.equal(notice.status, 200);

  const html = await notice.text();

  assert.match(html, /Scheduled hotel upgrade/);

  assert.match(html, /Update the hotel/);

  assert.match(html, /Staff login/);

  const login = await fetch(`${origin}/login`, { headers, redirect: "manual" });

  assert.equal(login.status, 200);
});

test("navigation follows authentication, emulator support and individual permission grants", async () => {
  const atom = process.env.ATOM_THEME === "atom";

  for (const cookie of [
    "",
    "member=Alice",
    "member=Alice; emulator=ada",
    "member=Alice; logo=1",
    "member=Alice; housekeeping=1",
    "member=Alice; logo=1; restriction=two_factor_required",
  ]) {
    const response = await fetch(`${origin}/community/articles`, {
      headers: { cookie },
    });

    assert.equal(response.status, 200);

    const html = await response.text();

    const header = html.slice(0, html.indexOf("<main"));

    const member = cookie.includes("member=");

    for (const path of [
      "/community/staff",
      "/community/teams",
      "/community/team-applications",
      "/community/staff-applications",
      "/help-center",
      "/leaderboard",
      "/shop",
      "/draw-badge",
      "/user/settings/account",
    ]) {
      assert.equal(
        header.includes(`href="${path}"`),
        path === "/draw-badge" || path === "/user/settings/account" || atom
          ? member
          : true,
        `${cookie}: ${path}`,
      );
    }

    for (const path of ["/community/photos", "/values"]) {
      assert.equal(
        header.includes(`href="${path}"`),
        (!atom || member) && !cookie.includes("emulator=ada"),
        `${cookie}: ${path}`,
      );
    }

    if (!atom) assert.equal(header.includes('href="/login"'), !member);

    assert.equal(header.includes('href="/register"'), !member);

    assert.equal(
      header.includes('href="/logo-generator"'),
      cookie.includes("logo=1"),
    );

    assert.equal(
      header.includes(`href="${origin}/housekeeping"`),
      cookie.includes("housekeeping=1"),
    );

    assert.equal(
      header.includes('href="/community/articles"'),
      !atom || member,
    );

    assert.equal(
      header.includes('href="/help-center/rules"'),
      !atom || !member,
    );
  }
});

test("article reactions show existing counts and reserve unused reactions for the member modal", async () => {
  for (const member of [false, true]) {
    const response = await fetch(`${origin}/community/article/welcome`, {
      headers: member ? { cookie: "member=Alice" } : {},
    });

    assert.equal(response.status, 200);

    const html = await response.text();

    const strip = html.match(
      /<div[^>]*aria-label="Reactions"[\s\S]*?<\/div>/,
    )[0];

    assert.match(strip, /alt="heart"/);

    assert.doesNotMatch(strip, /alt="like"|alt="wow"/);

    assert.equal(/<button[^>]*>\s*Add\s*<\/button>/.test(strip), member);

    const modal = html.match(
      /<dialog[^>]*aria-labelledby="reaction-dialog-title"[\s\S]*?<\/dialog>/,
    )?.[0];

    assert.equal(!!modal, member);

    if (modal) {
      assert.match(modal, /Insert Reaction/);

      assert.match(modal, /alt="like"/);

      assert.match(modal, /alt="wow"/);

      assert.doesNotMatch(modal, /alt="heart"/);

      assert.doesNotMatch(modal, /<dialog[^>]*\bopen(?:\s|=|>)/);
    }
  }
});

test("footer renders the original credits in a closed dialog for guests", async () => {
  const response = await fetch(`${origin}/community/articles`);

  const html = await response.text();

  assert.match(html, /<footer[^>]*class="[^"]*site-footer/);

  const credits = html.match(
    /<dialog[^>]*class="[^"]*credits-dialog[^"]*"[\s\S]*?<\/dialog>/,
  )[0];

  assert.match(credits, /Kasja/);

  assert.match(credits, /Translations/);

  assert.match(credits, /Object/);

  assert.doesNotMatch(credits, /<dialog[^>]*\bopen(?:\s|=|>)/);
});

test("the selected theme renders on the server and color preferences stay request-scoped", async () => {
  const theme = process.env.ATOM_THEME || "dusk";

  for (const [preference, expectedDark] of [
    ["", theme === "dusk"],
    ["dark", true],
    ["light", theme === "dusk"],
    ["invalid", theme === "dusk"],
  ]) {
    const [response, other] = await Promise.all([
      fetch(`${origin}/community/articles`, {
        headers: { cookie: `atom-color-mode=${preference}` },
      }),
      fetch(`${origin}/community/articles`),
    ]);

    const html = await response.text();

    const documentTag = html.match(/<html[^>]*>/)[0];

    assert.match(documentTag, new RegExp(`data-theme="${theme}"`));

    assert.equal(/class="dark"/.test(documentTag), expectedDark);

    const otherDocument = (await other.text()).match(/<html[^>]*>/)[0];

    assert.equal(/class="dark"/.test(otherDocument), theme === "dusk");
  }
});

test("both theme presentations retain the shared authentication form modes", async () => {
  for (const [path, fields] of [
    ["/login", ["username", "password"]],
    ["/register", ["username", "mail", "password", "password_confirmation"]],
    ["/forgot-password", ["mail"]],
    ["/reset-password/test-token", ["password", "password_confirmation"]],
    ["/two-factor-challenge", ["code", "recovery_code"]],
  ]) {
    const response = await fetch(`${origin}${path}`);

    assert.equal(response.status, 200);

    const html = await response.text();

    for (const field of fields) {
      assert.match(
        html,
        new RegExp(`<input[^>]*name="${field}"`),
        `${path}: ${field}`,
      );
    }

    if (path === "/register") {
      assert.match(html, /I accept the .* terms &amp; rules/);

      if (process.env.ATOM_THEME === "atom") {
        assert.match(html, /Your username is what you will have to use/);

        assert.match(html, /Your password must contain atleast 8 characters/);

        assert.match(html, /Create account/);
      } else {
        assert.match(html, /Enter your e-mail/);

        assert.match(html, /Back to login/);
      }
    }

    if (path === "/two-factor-challenge")
      assert.match(
        html,
        /Enter one of your recovery codes if you cannot access your authenticator app/,
      );
  }

  const beta = await fetch(`${origin}/register`, {
    headers: { cookie: "registration=beta" },
  });

  assert.match(await beta.text(), /<input[^>]*name="beta_code"[^>]*required/);

  const closed = await fetch(`${origin}/register`, {
    headers: { cookie: "registration=closed" },
  });

  const html = await closed.text();

  assert.match(html, /Registration is currently closed/);

  assert.match(
    html,
    /<button[^>]*disabled[^>]*>\s*(?:Register|Create account)\s*<\/button>/,
  );
});

test("team application pages show the current applicant status without offering another submission", async () => {
  for (const [status, label] of [
    ["pending", "Your application is pending"],
    ["approved", "You have been approved"],
    ["rejected", "Your application was rejected"],
  ]) {
    for (const path of [
      "/community/team-applications",
      "/community/team-applications/1",
    ]) {
      const response = await fetch(`${origin}${path}`, {
        headers: { cookie: `member=Alice; application=${status}` },
      });

      assert.equal(response.status, 200);

      const html = await response.text();

      assert.ok(html.includes(label));

      assert.ok(!html.includes("Apply for Events Team"));

      assert.ok(!html.includes("<textarea"));
    }
  }

  const fresh = await fetch(`${origin}/community/team-applications`, {
    headers: { cookie: "member=Bob" },
  });

  const html = await fresh.text();

  assert.ok(html.includes("Apply for Events Team"));

  assert.ok(!html.includes("Your application is pending"));
});

test("extracted community and home components preserve their server-rendered content", async () => {
  for (const [path, expected] of [
    ["/community/staff", "Community Hosts"],
    ["/community/teams", "Here to help"],
    ["/leaderboard", "42"],
    ["/community/photos", "Photo by Alice"],
    ["/home/Alice", "Welcome to my home"],
  ]) {
    const response = await fetch(`${origin}${path}`, {
      headers: { cookie: "member=Alice" },
    });

    assert.equal(response.status, 200, path);

    assert.ok(
      (await response.text()).includes(expected),
      `${path}: ${expected}`,
    );
  }
});

test("production CSS includes responsive utilities from the theme layers", async () => {
  const html = await (await fetch(`${origin}/login`)).text();

  const stylesheets = [
    ...html.matchAll(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g),
  ].map((match) => match[1]);

  assert.ok(stylesheets.length, "the rendered page links its compiled CSS");

  const styles = (
    await Promise.all(
      stylesheets.map(async (path) =>
        (await fetch(new URL(path, origin))).text(),
      ),
    )
  ).join("\n");

  assert.ok(
    styles.includes(".lg\\:hidden"),
    "desktop navigation visibility utilities are compiled from the theme",
  );

  assert.ok(
    styles.includes(
      process.env.ATOM_THEME === "atom"
        ? ".md\\:flex-row"
        : ".md\\:grid-cols-2",
    ),
    "responsive theme layout utilities are compiled",
  );
});

test("avatar poses override configured defaults without duplicate query parameters", async () => {
  const html = await (
    await fetch(`${origin}/user/me`, {
      headers: { cookie: "member=Alice; avatar=1" },
    })
  ).text();

  const avatars = [
    ...html.matchAll(/https:\/\/avatar\.example\.test\/avatar[^"'<>\\\s)]+/g),
  ].map(([value]) => new URL(value.replaceAll("&amp;", "&")));

  assert.ok(avatars.length);

  for (const avatar of avatars) {
    for (const key of ["direction", "head_direction", "size"]) {
      assert.equal(
        avatar.searchParams.getAll(key).length,
        1,
        `${key}: ${avatar}`,
      );
    }
  }

  assert.ok(
    avatars.some(
      (url) =>
        url.searchParams.get("size") === "s" &&
        url.searchParams.get("headonly") === "1",
    ),
  );

  assert.ok(
    avatars.some(
      (url) =>
        url.searchParams.get("size") === "l" &&
        url.searchParams.get("action") === "wav",
    ),
  );

  if (process.env.ATOM_THEME === "atom") {
    assert.ok(
      avatars.some(
        (url) =>
          url.searchParams.get("headonly") === "1" &&
          url.searchParams.get("head_direction") === "2",
      ),
    );
  }
});

test("the web app manifest names the hotel and the service worker is served", async () => {
  const response = await fetch(`${origin}/manifest.webmanifest`);

  assert.equal(response.status, 200);

  assert.match(
    response.headers.get("content-type"),
    /^application\/manifest\+json/,
  );

  const manifest = await response.json();

  assert.equal(manifest.name, "Theme Test");

  assert.equal(manifest.start_url, "/game/nitro");

  assert.equal(manifest.scope, "/");

  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));

  for (const icon of manifest.icons) {
    assert.equal((await fetch(`${origin}${icon.src}`)).status, 200);
  }

  const worker = await fetch(`${origin}/sw.js`);

  assert.equal(worker.status, 200);

  assert.match(worker.headers.get("content-type"), /javascript/);

  assert.equal((await fetch(`${origin}/offline.html`)).status, 200);
});
