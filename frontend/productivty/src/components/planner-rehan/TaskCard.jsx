import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";

import dayjs from "dayjs";
import { getTaskAnalysis } from "./utils/priorityUtils";


const UI = {
  layout: {
    radius: 2,
    padding: 1.5,
    accentBarWidth: 5,
    chipsGap: 0.75,
    rowGap: 0.75,
    contentPadLeft: 0.5,
    buttonRadius: 2,
  },
  typography: {
    titleWeight: 900,
    metaWeight: 800,
    bodySize: 13,
    captionSize: 12,
  },
  notes: { maxChars: 110 },

  colors: {
    useThemeColors: true,

    // fallback colors when theme label colors are not available (or useThemeColors=false)
    matrix: {
      Q1: { bg: "#d91e36", fg: "#ffffff" }, // Do now
      Q2: { bg: "#16a34a", fg: "#08100a" }, // Schedule
      Q3: { bg: "#f59e0a", fg: "#111827" }, // Not important + Urgent
      Q4: { bg: "#FFFFFF", fg: "#FFFFFF" }, // Not important + Not urgent
    },

    statusAccent: {
      todo: "#188fa7",
      "in-progress": "#188fa7",
      done: "#16a34a",
    },

    badge: {
      dueToday: { bg: "#f59e0b", fg: "#111827" },
      overdue: { bg: "#d91e36", fg: "#ffffff" },
      scheduled: { bg: "#188fa7", fg: "#ffffff" },
    },
  },
};

function getStatusAction(status) {
  switch (status) {
    case "todo":
      return { label: "Start", nextStatus: "in-progress" };
    case "in-progress":
      return { label: "Mark done", nextStatus: "done" };
    case "done":
      return { label: "Move back", nextStatus: "todo" };
    default:
      return null;
  }
}

function getStatusChip(status) {
  switch (status) {
    case "todo":
      return { label: "To do" };
    case "in-progress":
      return { label: "In progress" };
    case "done":
      return { label: "Done" };
    default:
      return { label: "Unknown" };
  }
}

function getPriorityMeta(priority) {
  switch (priority) {
    case "high":
      return { label: "High", key: "red" };
    case "medium":
      return { label: "Medium", key: "yellow" };
    case "low":
      return { label: "Low", key: "green" };
    case "normal":
      return { label: "Normal", key: "blue" };
    default:
      return { label: "Normal", key: "blue" };
  }
}

function labelForQuadrant(q) {
  switch (q) {
    case "Q1":
      return { label: "Do now", q: "Q1" };
    case "Q2":
      return { label: "Schedule", q: "Q2" };
    case "Q3":
      return { label: "Not important + Urgent", q: "Q3" };
    case "Q4":
      return { label: "Not important + Not urgent", q: "Q4" };
    default:
      return null;
  }
}

function formatDelta(target, now = dayjs()) {
  if (!target || !target.isValid()) return "";

  const diffMs = target.diff(now);
  const absMs = Math.abs(diffMs);

  const totalMinutes = Math.floor(absMs / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const mins = totalMinutes - days * 60 * 24 - hours * 60;

  const parts = [];
  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (!days && !hours) parts.push(`${mins} min${mins === 1 ? "" : "s"}`);
  else if (mins) parts.push(`${mins} min${mins === 1 ? "" : "s"}`);

  if (diffMs >= 0) return `in ${parts.join(" ")}`;
  return `passed (${parts.join(" ")} ago)`;
}

function notesSnippet(notes) {
  const s = (notes || "").trim();
  if (!s) return "";
  if (s.length <= UI.notes.maxChars) return s;
  return `${s.slice(0, UI.notes.maxChars - 1)}…`;
}

/**
 * Decide chip colors from UI block (optionally using theme)
 */
function getMatrixChipColors(theme, quadrant) {
  if (!quadrant) return null;

  if (UI.colors.useThemeColors) {
    const label = theme.custom?.colors?.label || {};
    const map = {
      Q1: { bg: label.red || UI.colors.matrix.Q1.bg, fg: UI.colors.matrix.Q1.fg },
      Q2: { bg: label.green || UI.colors.matrix.Q2.bg, fg: UI.colors.matrix.Q2.fg },
      Q3: { bg: label.yellow || UI.colors.matrix.Q3.bg, fg: UI.colors.matrix.Q3.fg },
      Q4: { bg: label.blue || UI.colors.matrix.Q4.bg, fg: UI.colors.matrix.Q4.fg },
    };
    return map[quadrant] || null;
  }

  return UI.colors.matrix[quadrant] || null;
}

function TaskCard({
  task,
  id,
  title,
  priority,
  category,
  status,

  plannedDate,
  startTime,
  endTime,
  deadlineDate,
  deadlineTime,

  // legacy fallback
  deadline,

  onDelete = () => {},
  onStatusChange = () => {},
  onEdit = () => {},
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  // update countdown text every minute
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const todayLocal = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const effectiveDeadlineDate = deadlineDate || deadline || "";
  const isScheduledTask = Boolean(plannedDate && startTime && endTime);

  const plannedStartDateTime = useMemo(() => {
    if (!plannedDate || !startTime) return null;
    const dt = dayjs(`${plannedDate}T${startTime}`);
    return dt.isValid() ? dt : null;
  }, [plannedDate, startTime]);

  const deadlineDateTime = useMemo(() => {
    if (!effectiveDeadlineDate) return null;
    const time = deadlineTime || "23:59";
    const dt = dayjs(`${effectiveDeadlineDate}T${time}`);
    return dt.isValid() ? dt : null;
  }, [effectiveDeadlineDate, deadlineTime]);

  const isOverdue =
    Boolean(effectiveDeadlineDate) && effectiveDeadlineDate < todayLocal && status !== "done";
  const isDueToday =
    Boolean(effectiveDeadlineDate) && effectiveDeadlineDate === todayLocal && status !== "done";

  const statusAction = getStatusAction(status);
  const statusChip = getStatusChip(status);

  // Classic priority fallback
  const classicPriorityMeta = getPriorityMeta(priority);

  // Compute matrix on the fly (works even if backend doesn’t persist matrix fields)
  const computedAnalysis = useMemo(() => {
    const importance = task?.importance ?? "";
    const effortHours = task?.effort ?? "";
    const dl = task?.deadlineDate || task?.deadline || "";

    return getTaskAnalysis({
      importance,
      effortHours,
      deadline: dl,
      workloadHours: 0,
      today: todayLocal,
      dailyCapacityHours: 5,
    });
  }, [task, todayLocal]);

  const matrixMeta = useMemo(() => {
    if (!computedAnalysis?.isCalculated) return null;
    return labelForQuadrant(computedAnalysis.matrixQuadrant);
  }, [computedAnalysis]);

  const notesText = notesSnippet(task?.notes);

  const timeUntilStartText = useMemo(() => {
    if (!isScheduledTask || !plannedStartDateTime) return "";
    return formatDelta(plannedStartDateTime, dayjs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScheduledTask, plannedStartDateTime, tick]);

  const timeUntilDeadlineText = useMemo(() => {
    if (!deadlineDateTime) return "";
    return formatDelta(deadlineDateTime, dayjs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineDateTime, tick]);

  const openMenu = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = (e) => {
    e?.stopPropagation?.();
    setMenuAnchor(null);
  };

  return (
    <Paper
      elevation={0}
      onClick={() => onEdit(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEdit(task);
      }}
      sx={(theme) => {
        const statusAccentTheme =
          status === "done"
            ? theme.custom.colors.success
            : status === "in-progress"
            ? theme.custom.colors.info
            : theme.custom.colors.borderAccent;

        const statusAccent =
          UI.colors.useThemeColors ? statusAccentTheme : (UI.colors.statusAccent[status] || "#188fa7");

        const borderColor = isOverdue
          ? theme.custom.colors.danger
          : isDueToday
          ? theme.custom.colors.warning
          : theme.custom.colors.borderDefault;

        const chipBg =
          theme.palette.mode === "dark" ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.03)";

        return {
          position: "relative",
          overflow: "hidden",
          p: UI.layout.padding,
          borderRadius: UI.layout.radius,
          cursor: "pointer",
          border: "1px solid",
          borderColor,
          bgcolor: theme.custom.colors.surface1,
          color: theme.custom.colors.textPrimary,
          transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: 2,
            borderColor: theme.custom.colors.borderAccent,
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: theme.custom.colors.borderAccent,
            outlineOffset: 2,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: UI.layout.accentBarWidth,
            bgcolor: statusAccent,
          },

          "--taskcard-chip-bg": chipBg,
        };
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: UI.typography.titleWeight,
            lineHeight: 1.2,
            wordBreak: "break-word",
            pr: 1,
            pl: UI.layout.contentPadLeft,
          }}
        >
          {title}
        </Typography>

        <IconButton
          aria-label="task menu"
          size="small"
          onClick={openMenu}
          sx={(theme) => ({
            color: theme.custom.colors.textSecondary,
            mt: -0.25,
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            },
          })}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: (theme) => ({
              borderRadius: 2,
              border: "1px solid",
              borderColor: theme.custom.colors.borderDefault,
              bgcolor: theme.custom.colors.surface1,
              color: theme.custom.colors.textPrimary,
              minWidth: 160,
            }),
          }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu(e);
              onEdit(task);
            }}
          >
            <EditOutlinedIcon fontSize="small" style={{ marginRight: 10 }} />
            Edit
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              closeMenu(e);
              onDelete(id);
            }}
            sx={(theme) => ({ color: theme.custom.colors.danger })}
          >
            <DeleteOutlineIcon fontSize="small" style={{ marginRight: 10 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      {/* Chips row */}
      <Stack
        direction="row"
        spacing={UI.layout.chipsGap}
        sx={{
          mt: 1,
          flexWrap: "wrap",
          rowGap: UI.layout.rowGap,
          pl: UI.layout.contentPadLeft,
        }}
      >
        <Chip
          size="small"
          label={statusChip.label}
          variant="outlined"
          sx={(theme) => ({
            fontWeight: UI.typography.metaWeight,
            borderColor:
              status === "done"
                ? theme.custom.colors.success
                : status === "in-progress"
                ? theme.custom.colors.info
                : theme.custom.colors.borderDefault,
            bgcolor: "var(--taskcard-chip-bg)",
          })}
        />

        {matrixMeta ? (
          <Chip
            size="small"
            label={matrixMeta.label}
            sx={(theme) => {
              const c = getMatrixChipColors(theme, matrixMeta.q);
              if (!c) return {};
              return { fontWeight: 900, bgcolor: c.bg, color: c.fg };
            }}
          />
        ) : (
          <Chip
            size="small"
            label={`Priority: ${classicPriorityMeta.label}`}
            variant="outlined"
            sx={(theme) => ({
              fontWeight: UI.typography.metaWeight,
              borderColor: theme.custom.colors.borderDefault,
              bgcolor: "var(--taskcard-chip-bg)",
            })}
          />
        )}

        {computedAnalysis?.isCalculated ? (
          <Chip
            size="small"
            label={`Score: ${computedAnalysis.priorityScore}/100`}
            variant="outlined"
            sx={(theme) => ({
              fontWeight: UI.typography.metaWeight,
              borderColor: theme.custom.colors.borderDefault,
              bgcolor: "var(--taskcard-chip-bg)",
            })}
          />
        ) : null}

        {category ? (
          <Chip
            size="small"
            label={category}
            variant="outlined"
            sx={(theme) => ({
              fontWeight: UI.typography.metaWeight,
              borderColor: theme.custom.colors.borderDefault,
              bgcolor: "var(--taskcard-chip-bg)",
            })}
          />
        ) : null}

        {isScheduledTask ? (
          <Chip
            size="small"
            label="Scheduled"
            sx={(theme) => ({
              fontWeight: 900,
              bgcolor: UI.colors.useThemeColors ? theme.custom.colors.info : UI.colors.badge.scheduled.bg,
              color: UI.colors.useThemeColors ? "#fff" : UI.colors.badge.scheduled.fg,
            })}
          />
        ) : null}

        {isOverdue ? (
          <Chip
            size="small"
            label="Overdue"
            sx={(theme) => ({
              fontWeight: 900,
              bgcolor: UI.colors.useThemeColors ? theme.custom.colors.danger : UI.colors.badge.overdue.bg,
              color: UI.colors.useThemeColors ? "#fff" : UI.colors.badge.overdue.fg,
            })}
          />
        ) : isDueToday ? (
          <Chip
            size="small"
            label="Due today"
            sx={(theme) => ({
              fontWeight: 900,
              bgcolor: UI.colors.useThemeColors ? theme.custom.colors.warning : UI.colors.badge.dueToday.bg,
              color: UI.colors.useThemeColors ? (theme.palette.mode === "dark" ? "#080705" : "#111827") : UI.colors.badge.dueToday.fg,
            })}
          />
        ) : null}
      </Stack>

      {/* Planned schedule line */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.15, pl: UI.layout.contentPadLeft }}>
        <EventAvailableOutlinedIcon fontSize="small" />
        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, fontSize: UI.typography.bodySize })}>
          Planned: <strong>{plannedDate || "—"}</strong>
          {startTime && endTime ? (
            <>
              {" "}
              · <strong>{startTime}</strong> - <strong>{endTime}</strong>
            </>
          ) : null}
        </Typography>
      </Stack>

      {/* Countdown to start */}
      {isScheduledTask && timeUntilStartText ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.65, pl: UI.layout.contentPadLeft }}>
          <AccessTimeOutlinedIcon fontSize="small" />
          <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, fontSize: UI.typography.bodySize })}>
            Starts {timeUntilStartText}
          </Typography>
        </Stack>
      ) : null}

      {/* Deadline line */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.8, pl: UI.layout.contentPadLeft }}>
        <CalendarMonthOutlinedIcon fontSize="small" />
        <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, fontSize: UI.typography.bodySize })}>
          Deadline: <strong>{effectiveDeadlineDate || "—"}</strong>
          {deadlineTime ? (
            <>
              {" "}
              · <strong>{deadlineTime}</strong>
            </>
          ) : null}
        </Typography>
      </Stack>

      {/* Countdown to deadline */}
      {deadlineDateTime && timeUntilDeadlineText ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.65, pl: UI.layout.contentPadLeft }}>
          <EventBusyOutlinedIcon fontSize="small" />
          <Typography sx={(theme) => ({ color: theme.custom.colors.textSecondary, fontSize: UI.typography.bodySize })}>
            Deadline {timeUntilDeadlineText}
          </Typography>
        </Stack>
      ) : null}

      {/* Notes preview */}
      {notesText ? (
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 0.9, pl: UI.layout.contentPadLeft }}>
          <NotesOutlinedIcon fontSize="small" />
          <Typography
            sx={(theme) => ({
              color: theme.custom.colors.textSecondary,
              fontSize: UI.typography.captionSize,
              lineHeight: 1.35,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            })}
          >
            {notesText}
          </Typography>
        </Stack>
      ) : null}

      {/* Primary action */}
      {statusAction ? (
        <Box sx={{ mt: 1.25, pl: UI.layout.contentPadLeft }}>
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(id, statusAction.nextStatus);
            }}
            sx={(theme) => ({
              borderRadius: UI.layout.buttonRadius,
              fontWeight: 900,
              bgcolor: theme.custom.colors.primaryBtnBg,
              color: theme.custom.colors.primaryBtnText,
              "&:hover": { bgcolor: theme.custom.colors.primaryBtnHoverBg },
              textTransform: "none",
            })}
          >
            {statusAction.label}
          </Button>
        </Box>
      ) : null}
    </Paper>
  );
}

export default TaskCard;