import dayjs from "dayjs";



const IMPORTANT_MAX = 4; 
const DEFAULT_DAILY_CAPACITY_HOURS = 5; 

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
    return to.diff(from, "day"); 
};

const scoreClamp01 = (x) => Math.max(0, Math.min(1, x));


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
            reason: "",
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


    const plannedLoad = clampNumber(workloadHours, { min: 0, max: 200 }) ?? 0;
    const capacity = clampNumber(dailyCapacityHours, { min: 1, max: 16 }) ?? DEFAULT_DAILY_CAPACITY_HOURS;
    const totalLoad = plannedLoad + E;
    const isFeasibleToday = totalLoad <= capacity;


    const effectiveDays = Math.max(dLeft, 0);
    const dueSoon = effectiveDays <= 1; 
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


    let matrixQuadrant = "Q4";
    let matrixLabel = "Not important + Not urgent";
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
        matrixLabel = "";
        matrixSortRank = 3;
    } else {
        matrixQuadrant = "Q4";
        matrixLabel = "";
        matrixSortRank = 4;
    }


    const importance01 = scoreClamp01((10 - I) / 9);


    const urgency01 =
        dLeft <= 0 ? 1 : scoreClamp01(1 - Math.min(dLeft, 14) / 14); 


    const effort01 = scoreClamp01(Math.min(E, 8) / 8); 

    const overload01 = scoreClamp01((totalLoad - capacity) / capacity);

    const rawScore01 =
        0.45 * importance01 +
        0.30 * urgency01 +
        0.15 * effort01 +
        0.10 * overload01;

    const priorityScore = Math.round(rawScore01 * 100);

    let recommendedAction = matrixLabel;


    const reasonParts = [];

    if (plannedLoad > 0) reasonParts.push(`${plannedLoad}h already planned`);


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