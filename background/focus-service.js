import { t as translate } from '../core/i18n.js';
import * as storage from '../core/storage.js';
import { runTimer } from '../core/timer-engine.js';
import { snapshot, applySnapshot, sceneById } from '../core/scenes.js';
import { rulesFor, blockerOrigins, blockedHost } from '../core/blocker-logic.js';
import { getAll } from '../core/db.js';
import { dayKey } from '../core/utils.js';
import { notify } from '../core/system-notifications.js';
import { record as recordNotice } from '../core/notifications.js';
/** Reconcile rules against both the saved deadline and a browser-session lease. */
export async function syncBlocker() {
  const d = storage.get(),
    lease = await storage.sessionGet("flowLease");
  const rules = lease === d.flow.startedAt ? rulesFor(d, chrome.runtime.getURL('blocked/index.html')) : [];
  const old = await chrome.declarativeNetRequest.getSessionRules();
  if (JSON.stringify(old) !== JSON.stringify(rules)) await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: old.map(x => x.id),
    addRules: rules
  });
  const until = d.blocker.overrides.filter(x => x.until > Date.now()).map(x => x.until);
  if (until.length) await chrome.alarms.create('oneflow-override', {
    when: Math.min(...until)
  });else await chrome.alarms.clear('oneflow-override');
}
/** Release orphaned Flow state after crash/restart without reinstalling stale rules. */
export async function recoverFlow() {
  const d = storage.get();
  if (d.flow.active && (await storage.sessionGet("flowLease")) !== d.flow.startedAt) {
    await runTimer('pause');
    await storage.update(next => {
      if (next.flow.snapshot) applySnapshot(next, next.flow.snapshot);
      next.flow = {
        active: false,
        block: false,
        startedAt: 0,
        snapshot: null
      };
      next.blocker.overrides = [];
      next.audio.playing = false;
    });
  }
  await syncBlocker();
}
export async function startFlow(sceneId, block, preserveScene = false) {
  if (storage.get().flow.active) return;
  const value = preserveScene ? null : await sceneById(sceneId),
    d = storage.get();
  if (block) {
    const origins = blockerOrigins(d.blocker);
    if (!d.blocker.enabled || !origins.length || !(await chrome.permissions.contains({
      origins
    }))) throw new Error(translate('m0597'));
  }
  const before = preserveScene ? null : snapshot(d),
    startedAt = Date.now();
  const continuing = Boolean(d.timer.sessionId) || d.timer.status !== 'idle' || d.timer.phase !== 'focus';
  await storage.update(next => {
    const timer = structuredClone(next.timer);
    if (value) applySnapshot(next, value);
    if (continuing) next.timer = timer;
    next.sceneId = sceneId;
    next.flow = {
      active: true,
      block: Boolean(block),
      startedAt,
      snapshot: before
    };
    next.blocker.overrides = [];
  });
  await storage.sessionSet("flowLease", startedAt);
  try {
    if (!continuing) await runTimer('start', {
      taskId: d.timer.taskId,
      taskTitle: d.timer.taskTitle || d.focus.text || translate('m0181')
    });
    await syncBlocker();
  } catch (error) {
    await stopFlow();
    throw error;
  }
}
export async function stopFlow() {
  const before = storage.get();
  if (!before.flow.active) return {
    minutes: 0,
    sessions: 0
  };
  // Clear rules before any slower history write so leaving Flow always releases browsing.
  await storage.sessionSet("flowLease", null);
  await syncBlocker();
  await storage.update(d => {
    const timer = structuredClone(d.timer);
    if (d.flow.snapshot) applySnapshot(d, d.flow.snapshot);
    d.timer = timer;
    d.flow = {
      active: false,
      block: false,
      startedAt: 0,
      snapshot: null
    };
    d.blocker.overrides = [];
  });
  const rows = (await getAll('sessions')).filter(s => s.start >= before.flow.startedAt);
  return {
    minutes: Math.round(rows.reduce((sum, s) => sum + s.duration, 0) / 60000),
    sessions: rows.length
  };
}
/** Interstitial messages log only hostnames; paths and queries never enter history. */
export async function blockedRequest(url, override = false) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(translate('m0598'));
  const host = parsed.hostname,
    d = storage.get();
  if (!blockedHost(d, host)) {
    await syncBlocker();
    return {
      allowed: true
    };
  }
  await storage.update(next => {
    if (override) {
      next.blocker.overrides = next.blocker.overrides.filter(x => x.host !== host && x.until > Date.now());
      next.blocker.overrides.push({
        host,
        until: Date.now() + 300000
      });
    } else {
      next.blocker.log.unshift({
        id: crypto.randomUUID(),
        host,
        at: Date.now()
      });
      next.blocker.log = next.blocker.log.slice(0, 200);
    }
  });
  await syncBlocker();
  return {
    allowed: override
  };
}
/** Schedule local ritual and backup reminders without a remote scheduler. */
export async function scheduleReminders() {
  const d = storage.get();
  for (const [kind, time] of Object.entries(d.ritualReminders)) {
    const name = `oneflow-ritual-${kind}`;
    if (!time) {
      await chrome.alarms.clear(name);
      continue;
    }
    const date = new Date(),
      [hour, minute] = time.split(':').map(Number);
    date.setHours(hour, minute, 0, 0);
    if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
    if (d.ritualSnoozes[kind] > Date.now()) date.setTime(d.ritualSnoozes[kind]);
    const old = await chrome.alarms.get(name);
    if (!old || Math.abs(old.scheduledTime - date.getTime()) > 1000) await chrome.alarms.create(name, {
      when: date.getTime()
    });
  }
  if (d.backup.reminderDays) {
    let base = Math.max(d.backup.lastExport, d.backup.lastReminder);
    if (!base) {
      base = Date.now();
      await storage.update(next => {
        next.backup.lastReminder = base;
      });
    }
    const due = base + d.backup.reminderDays * 86400000,
      old = await chrome.alarms.get('oneflow-backup-reminder');
    if (!old || due > Date.now() && Math.abs(old.scheduledTime - due) > 1000) await chrome.alarms.create('oneflow-backup-reminder', {
      when: Math.max(Date.now() + 60000, due)
    });
  } else await chrome.alarms.clear('oneflow-backup-reminder');
}
export async function notifyReminder(name) {
  return navigator.locks.request('oneflow-backup', async () => {
  const d = storage.get();
  let title, message;
  if (name.startsWith('oneflow-ritual-')) {
    const kind = name.slice('oneflow-ritual-'.length);
    if (!d.ritualReminders[kind] || d.rituals.some(r => r.kind === kind && r.date === dayKey())) return;
    title = translate('m0675');
    message = {
      morning: translate('m0599'),
      midday: translate('m0600'),
      evening: translate('m0601')
    }[kind];
  } else if (name === 'oneflow-backup-reminder' && d.backup.reminderDays) {
    title = translate('m0602');
    message = translate('m0603');
    await storage.update(next => {
      next.backup.lastReminder = Date.now();
    });
  }
  if (message) await recordNotice(`${title}: ${message}`, 'info', `${name}-${dayKey()}`);
  if (message) await notify(name, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
    title,
    message
  });
  });
}
