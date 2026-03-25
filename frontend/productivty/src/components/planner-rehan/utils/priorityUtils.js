import dayjs from "dayjs";

/**
 * Intelligent Eisenhower + Feasibility + Score (student-focused)
 * -------------------------------------------------------------
 * Calculates ONLY when user provides:
 * - importance (1–10) where 1 is MOST important, 10 is LEAST important
 * - effortHours (hours)
 * - deadline ("YYYY-MM-DD")
 *
 * Adds real-world outputs:
 * - isFeasibleToday: based on today's workload and daily capacity
 * - priorityScore: 0..100 (for comparing tasks)
 * - recommendedAction + reason: explanation for the user
 */

const IMPORTANT_MAX = 4; // 1..4 important, 5..10 not important (practical cutoff)
const DEFAULT_DAILY_CAPACITY_HOURS = 5; // matches your scenario

const clampNumber = (value, { min, max } = {}) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
};

const toYmd = (d) => dayjs(d).format("YYYY-MM-DD");

const daysUntil = (deadlineYmd, fromYmd) => {
    const from = dayjs(fromYmd).startOf("day");
    const to = dayjs(deadlineYmd).startOf("day");
    if (!to.isValid()) return null;
    return to.diff(from, "day"); // negative => overdue
};

const scoreClamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * getTaskAnalysis
 * ---------------
 * workloadHours: hours already planned on the SAME plannedDate (other tasks, not done)
 * dailyCapacityHours: user capacity (default 5)
 */
export const getTaskAnalysis = ({
    importance,
    effortHours,
    deadline,
    workloadHours = 0,
    dailyCapacityHours = DEFAULT_DAILY_CAPACITY_HOURS,
    today = toYmd(dayjs()),
} = {}) => {
    const I = clampNumber(importance, { min: 1, max: 10 });
    const E = clampNumber(effortHours, { min: 0.25, max: 24 });
    const deadlineYmd = deadline ? String(deadline) : "";

    // Incomplete data => not calculated, but still usable
    if (!I || !E || !deadlineYmd) {
        return {
            isCalculated: false,
            isImportant: null,
            isUrgent: null,
            isFeasibleToday: null,
            matrixQuadrant: null,
            matrixLabel: "Not calculated",
            matrixSortRank: 999,
            priorityScore: null,
            recommendedAction: "Add importance, effort, and deadline to calculate.",
            reason: "Missing one or more fields: importance, effort, deadline.",
            meta: null,
        };
    }

    const dLeft = daysUntil(deadlineYmd, today);
    if (dLeft == null) {
        return {
            isCalculated: false,
            isImportant: null,
            isUrgent: null,
            isFeasibleToday: null,
            matrixQuadrant: null,
            matrixLabel: "Not calculated",
            matrixSortRank: 999,
            priorityScore: null,
            recommendedAction: "Fix the deadline date to calculate.",
            reason: "Deadline date is invalid.",
            meta: null,
        };
    }

    const isImportant = I <= IMPORTANT_MAX;

    // Workload + feasibility (matches your scenario)
    const plannedLoad = clampNumber(workloadHours, { min: 0, max: 200 }) ?? 0;
    const capacity = clampNumber(dailyCapacityHours, { min: 1, max: 16 }) ?? DEFAULT_DAILY_CAPACITY_HOURS;
    const totalLoad = plannedLoad + E;
    const isFeasibleToday = totalLoad <= capacity;

    /**
     * Urgency (derived from deadline + effort + overload risk)
     * Practical rules:
     * - overdue / due today / due tomorrow => urgent
     * - heavy task and due soon => urgent
     * - overloaded day and deadline is close => urgent
     */
    const effectiveDays = Math.max(dLeft, 0);
    const dueSoon = effectiveDays <= 1; // today/tomorrow
    const dueThisWeek = effectiveDays <= 3;
    const heavyTask = E >= 4;
    const hugeTask = E >= 8;
    const overloaded = totalLoad > capacity;

    const isUrgent =
        dLeft <= 0 ||
        dueSoon ||
        (heavyTask && dueThisWeek) ||
        (hugeTask && effectiveDays <= 5) ||
        (overloaded && effectiveDays <= 2);

    // Eisenhower quadrant
    let matrixQuadrant = "Q4";
    let matrixLabel = "Eliminate";
    let matrixSortRank = 4;

    if (isImportant && isUrgent) {
        matrixQuadrant = "Q1";
        matrixLabel = "Do now";
        matrixSortRank = 1;
    } else if (isImportant && !isUrgent) {
        matrixQuadrant = "Q2";
        matrixLabel = "Schedule";
        matrixSortRank = 2;
    } else if (!isImportant && isUrgent) {
        matrixQuadrant = "Q3";
        matrixLabel = "Delegate";
        matrixSortRank = 3;
    } else {
        matrixQuadrant = "Q4";
        matrixLabel = "Eliminate";
        matrixSortRank = 4;
    }

    /**
     * priorityScore (0..100)
     * ----------------------
     * We want a stable number that:
     * - prioritizes importance first (your requirement)
     * - then urgency (deadline proximity)
     * - then feasibility pressure (overload pushes score up because it needs action)
     *
     * Importance component:
     * - importance 1 => 1.0
     * - importance 10 => 0.0
     */
    const importance01 = scoreClamp01((10 - I) / 9);

    /**
     * Deadline urgency component:
     * - due today/tomorrow => near 1
     * - due far away => approaches 0
     */
    const urgency01 =
        dLeft <= 0 ? 1 : scoreClamp01(1 - Math.min(dLeft, 14) / 14); // 0..14 days scale

    /**
     * Effort pressure:
     * - big tasks should not be ignored, but don't dominate
     */
    const effort01 = scoreClamp01(Math.min(E, 8) / 8); // cap at 8h

    /**
     * Overload pressure:
     * - if day is overloaded, score increases to force decision (split/move)
     */
    const overload01 = scoreClamp01((totalLoad - capacity) / capacity);

    // Weighted score (importance first)
    const rawScore01 =
        0.45 * importance01 +
        0.30 * urgency01 +
        0.15 * effort01 +
        0.10 * overload01;

    const priorityScore = Math.round(rawScore01 * 100);

    // Recommended action (real-world guidance)
    let recommendedAction = matrixLabel;

    if (matrixQuadrant === "Q1") {
        if (!isFeasibleToday || hugeTask) {
            recommendedAction = "Split and start now";
        } else {
            recommendedAction = "Start now";
        }
    } else if (matrixQuadrant === "Q2") {
        if (!isFeasibleToday || heavyTask) {
            recommendedAction = "Schedule and split into sessions";
        } else {
            recommendedAction = "Schedule a time block";
        }
    } else if (matrixQuadrant === "Q3") {
        recommendedAction = "Reduce scope or ask for help";
    } else if (matrixQuadrant === "Q4") {
        recommendedAction = "Avoid or postpone";
    }

    // Human explanation for UI
    const reasonParts = [];
    reasonParts.push(`Due in ${dLeft} day(s)`);
    reasonParts.push(`${E}h effort`);
    if (plannedLoad > 0) reasonParts.push(`${plannedLoad}h already planned`);
    if (!isFeasibleToday) reasonParts.push(`Total ${totalLoad}h > ${capacity}h capacity`);

    return {
        isCalculated: true,
        isImportant,
        isUrgent,
        isFeasibleToday,
        matrixQuadrant,
        matrixLabel,
        matrixSortRank,
        priorityScore,
        recommendedAction,
        reason: reasonParts.join(" • "),
        meta: {
            importance: I,
            effortHours: E,
            daysLeft: dLeft,
            workloadHours: plannedLoad,
            dailyCapacityHours: capacity,
            totalLoadHours: totalLoad,
        },
    };
};

/**
 * Sorting helper for "compare with other tasks"
 * ---------------------------------------------
 * Sort by:
 * 1) matrixSortRank (Q1 -> Q4)
 * 2) priorityScore desc
 * 3) earliest deadline
 */
export const sortTasksIntelligently = (tasks, { today = toYmd(dayjs()) } = {}) => {
    const list = Array.isArray(tasks) ? tasks : [];

    return [...list].sort((a, b) => {
        const ra = Number.isFinite(a?.matrixSortRank) ? a.matrixSortRank : 999;
        const rb = Number.isFinite(b?.matrixSortRank) ? b.matrixSortRank : 999;
        if (ra !== rb) return ra - rb;

        const sa = Number.isFinite(a?.priorityScore) ? a.priorityScore : -1;
        const sb = Number.isFinite(b?.priorityScore) ? b.priorityScore : -1;
        if (sa !== sb) return sb - sa;

        const da = a?.deadline ? daysUntil(a.deadline, today) : 99999;
        const db = b?.deadline ? daysUntil(b.deadline, today) : 99999;
        return da - db;
    });
};