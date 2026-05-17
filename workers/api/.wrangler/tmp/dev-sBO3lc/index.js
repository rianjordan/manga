var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var MANGADEX_API = "https://api.mangadex.org";
var USER_AGENT = "Reader's Haven/1.0 (contact@readershaven.com)";
var rateLimiters = /* @__PURE__ */ new Map();
function checkRateLimit(ip, maxTokens, windowMs) {
  const now = Date.now();
  let limiter = rateLimiters.get(ip);
  if (!limiter) {
    limiter = { tokens: maxTokens, lastRefill: now, maxTokens, windowMs };
    rateLimiters.set(ip, limiter);
  }
  const elapsed = now - limiter.lastRefill;
  const tokensToAdd = Math.floor(elapsed / limiter.windowMs) * limiter.maxTokens;
  if (tokensToAdd > 0) {
    limiter.tokens = Math.min(limiter.maxTokens, limiter.tokens + tokensToAdd);
    limiter.lastRefill = now;
  }
  if (limiter.tokens <= 0) return false;
  limiter.tokens--;
  return true;
}
__name(checkRateLimit, "checkRateLimit");
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
function getUserId(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  return token || null;
}
__name(getUserId, "getUserId");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const clientIp = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const apiBase = env.MANGADEX_API_BASE ?? MANGADEX_API;
    const maxTokens = parseInt(env.RATE_LIMIT ?? "4", 10);
    const windowMs = parseInt(env.RATE_LIMIT_WINDOW ?? "1000", 10);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }
    let path = url.pathname;
    if (path.startsWith("/api")) {
      path = path.slice(4);
    }
    if (path === "/users" && request.method === "POST") {
      try {
        const { id, username, avatarUrl } = await request.json();
        if (!id || !username) {
          return new Response(JSON.stringify({ error: "Missing user ID or username" }), { status: 400, headers: CORS_HEADERS });
        }
        await env.DB.prepare(
          `INSERT INTO users (id, username, avatar_url) VALUES (?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET username = excluded.username, avatar_url = excluded.avatar_url`
        ).bind(id, username, avatarUrl ?? null).run();
        return new Response(JSON.stringify({ success: true, user: { id, username, avatarUrl } }), { status: 200, headers: CORS_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
      }
    }
    if (path === "/history") {
      const userId = getUserId(request);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
      }
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare(
            `SELECT id, manga_id as mangaId, manga_title as mangaTitle, cover_file as coverFile,
                    chapter_id as chapterId, chapter_num as chapterNumber, page, read_at as readAt
             FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 50`
          ).bind(userId).all();
          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (request.method === "POST") {
        try {
          const { mangaId, mangaTitle, coverFile, chapterId, chapterNumber, page } = await request.json();
          if (!mangaId || !chapterId) {
            return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: CORS_HEADERS });
          }
          await env.DB.prepare(
            `INSERT INTO reading_history (user_id, manga_id, manga_title, cover_file, chapter_id, chapter_num, page)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, chapter_id) DO UPDATE SET page = excluded.page, read_at = datetime('now')`
          ).bind(userId, mangaId, mangaTitle, coverFile ?? "", chapterId, chapterNumber ?? null, page ?? 1).run();
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
    }
    if (path === "/follows") {
      const userId = getUserId(request);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
      }
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare(
            `SELECT manga_id as mangaId, status, added_at as addedAt FROM follows WHERE user_id = ?`
          ).bind(userId).all();
          const followsMap = {};
          results.forEach((item) => {
            followsMap[item.mangaId] = item;
          });
          return new Response(JSON.stringify({ data: followsMap }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (request.method === "POST") {
        try {
          const { mangaId, status } = await request.json();
          if (!mangaId || !status) {
            return new Response(JSON.stringify({ error: "Missing mangaId or status" }), { status: 400, headers: CORS_HEADERS });
          }
          await env.DB.prepare(
            `INSERT INTO follows (user_id, manga_id, status) VALUES (?, ?, ?)
             ON CONFLICT(user_id, manga_id) DO UPDATE SET status = excluded.status, added_at = datetime('now')`
          ).bind(userId, mangaId, status).run();
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
    }
    if (path.startsWith("/follows/") && request.method === "DELETE") {
      const userId = getUserId(request);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
      }
      try {
        const mangaId = path.split("/")[2];
        if (!mangaId) {
          return new Response(JSON.stringify({ error: "Missing manga ID" }), { status: 400, headers: CORS_HEADERS });
        }
        await env.DB.prepare(
          `DELETE FROM follows WHERE user_id = ? AND manga_id = ?`
        ).bind(userId, mangaId).run();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
      }
    }
    if (path === "/collections") {
      const userId = getUserId(request);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
      }
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare(
            `SELECT c.id, c.name, c.description, c.is_public as isPublic, c.created_at as createdAt,
                    COUNT(ci.manga_id) as itemsCount
             FROM collections c
             LEFT JOIN collection_items ci ON c.id = ci.collection_id
             WHERE c.user_id = ?
             GROUP BY c.id
             ORDER BY c.created_at DESC`
          ).bind(userId).all();
          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (request.method === "POST") {
        try {
          const { name, description, isPublic } = await request.json();
          if (!name) {
            return new Response(JSON.stringify({ error: "Missing list name" }), { status: 400, headers: CORS_HEADERS });
          }
          const result = await env.DB.prepare(
            `INSERT INTO collections (user_id, name, description, is_public) VALUES (?, ?, ?, ?)`
          ).bind(userId, name, description ?? "", isPublic ? 1 : 0).run();
          return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
    }
    if (path.startsWith("/collections/")) {
      const userId = getUserId(request);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
      }
      const parts = path.split("/");
      const collectionId = parseInt(parts[2], 10);
      if (isNaN(collectionId)) {
        return new Response(JSON.stringify({ error: "Invalid Collection ID" }), { status: 400, headers: CORS_HEADERS });
      }
      const collectionCheck = await env.DB.prepare(
        `SELECT id FROM collections WHERE id = ? AND user_id = ?`
      ).bind(collectionId, userId).first();
      if (!collectionCheck) {
        return new Response(JSON.stringify({ error: "Collection not found or unauthorized" }), { status: 404, headers: CORS_HEADERS });
      }
      if (parts.length === 3 && request.method === "GET") {
        try {
          const collection = await env.DB.prepare(
            `SELECT id, name, description, is_public as isPublic, created_at as createdAt FROM collections WHERE id = ?`
          ).bind(collectionId).first();
          const { results: items } = await env.DB.prepare(
            `SELECT manga_id as mangaId, position, added_at as addedAt FROM collection_items WHERE collection_id = ? ORDER BY position ASC`
          ).bind(collectionId).all();
          return new Response(JSON.stringify({ data: { ...collection, items } }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (parts[3] === "items" && request.method === "POST") {
        try {
          const { mangaId, position } = await request.json();
          if (!mangaId) {
            return new Response(JSON.stringify({ error: "Missing mangaId" }), { status: 400, headers: CORS_HEADERS });
          }
          await env.DB.prepare(
            `INSERT INTO collection_items (collection_id, manga_id, position) VALUES (?, ?, ?)
             ON CONFLICT(collection_id, manga_id) DO NOTHING`
          ).bind(collectionId, mangaId, position ?? 0).run();
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (parts[3] === "items" && parts[4] && request.method === "DELETE") {
        try {
          const mangaId = parts[4];
          await env.DB.prepare(
            `DELETE FROM collection_items WHERE collection_id = ? AND manga_id = ?`
          ).bind(collectionId, mangaId).run();
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
      if (parts.length === 3 && request.method === "DELETE") {
        try {
          await env.DB.prepare(
            `DELETE FROM collections WHERE id = ?`
          ).bind(collectionId).run();
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
        }
      }
    }
    if (!checkRateLimit(clientIp, maxTokens, windowMs)) {
      return new Response(
        JSON.stringify({
          errors: [{ detail: "Rate limit exceeded. Please slow down your requests." }]
        }),
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            "Retry-After": "1",
            "X-RateLimit-Limit": String(maxTokens)
          }
        }
      );
    }
    const upstreamUrl = `${apiBase}${path}${url.search}`;
    const fetchHeaders = new Headers();
    fetchHeaders.set("User-Agent", USER_AGENT);
    const allowedHeaders = ["accept", "accept-language", "content-type"];
    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        fetchHeaders.set(key, value);
      }
    }
    const fetchOptions = {
      method: request.method,
      headers: fetchHeaders,
      redirect: "follow"
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      const bodyBuffer = await request.arrayBuffer();
      if (bodyBuffer.byteLength > 0) {
        fetchOptions.body = bodyBuffer;
      }
    }
    let cacheTtl = 0;
    if (path.startsWith("/cover") || path.startsWith("/manga") && !request.method?.toLowerCase().includes("post")) {
      cacheTtl = 300;
    }
    if (path.startsWith("/chapter") && !path.includes("/feed") && !path.includes("/server")) {
      cacheTtl = 300;
    }
    if (path.startsWith("/manga") && path.includes("/feed")) {
      cacheTtl = 30;
    }
    if (cacheTtl > 0 && request.method === "GET") {
      const cache = caches.default;
      const cacheKey = new Request(upstreamUrl, {
        method: "GET",
        headers: fetchHeaders
      });
      const cached = await cache.match(cacheKey);
      if (cached) {
        const response = new Response(cached.body, cached);
        Object.entries(CORS_HEADERS).forEach(([key, val]) => response.headers.set(key, val));
        response.headers.set("X-Cache", "HIT");
        return response;
      }
    }
    try {
      const response = await fetch(upstreamUrl, fetchOptions);
      const requestId = response.headers.get("X-Request-ID");
      if (!response.ok && requestId) {
        console.error(`MangaDex error: ${response.status} for ${path}, Request-ID: ${requestId}`);
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") ?? "2";
        return new Response(
          JSON.stringify({
            errors: [{ detail: "MangaDex API rate limit reached. Please retry later." }]
          }),
          {
            status: 429,
            headers: {
              ...CORS_HEADERS,
              "Retry-After": retryAfter
            }
          }
        );
      }
      const responseBody = await response.arrayBuffer();
      const newResponse = new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...CORS_HEADERS,
          "X-Proxy": "readers-haven"
        }
      });
      if (cacheTtl > 0 && response.ok && request.method === "GET") {
        const cache = caches.default;
        const cacheKey = new Request(upstreamUrl, {
          method: "GET",
          headers: fetchHeaders
        });
        const cachedResponse = new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(newResponse.headers.entries()),
            "Cache-Control": `public, max-age=${cacheTtl}`
          }
        });
        await cache.put(cacheKey, cachedResponse);
      }
      return newResponse;
    } catch (err) {
      console.error(`Upstream proxy request failed for ${path}:`, err);
      return new Response(
        JSON.stringify({
          errors: [{ detail: "Failed to connect to MangaDex API." }]
        }),
        {
          status: 502,
          headers: CORS_HEADERS
        }
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-90tu29/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-90tu29/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
