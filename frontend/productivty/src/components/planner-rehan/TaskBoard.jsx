import React, { useMemo } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

import TaskCard from "./TaskCard";
import useTaskStore from "../../store/taskStore";

const UI = {
  layout: {
    
    boardPadding: { xs: 2, md: 2.5 },

    columnWidth: 260,
    columnRadius: 1,
    columnPadding: 1,

    gap: 2,
    wrap: "wrap",
  },

  typography: {
    boardTitleWeight: 900,
    columnTitleWeight: 900,
    columnCountWeight: 800,
  },
};


const PRIORITY_ORDER = { high: 3, medium: 2, low: 1, normal: 0 };

function KanbanColumn({
  title,
  subtitle,
  tasks,
  emptyTitle,
  emptyHint,
  onDelete,
  onStatusChange,
  onEdit,
  headerKey, 
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: UI.layout.columnWidth,
        p: UI.layout.columnPadding,
        
        display: "flex",
        flexDirection: "column",
    
        bgcolor: theme.custom.colors.surface2,
        color: theme.custom.colors.textPrimary,
      })}
    >
      {/* Column header */}
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between">
          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontWeight: UI.typography.columnTitleWeight,
              color: theme.custom.colors.label?.[headerKey] || theme.custom.colors.textPrimary,
              letterSpacing: 0.2,
            })}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            sx={(theme) => ({
              fontWeight: UI.typography.columnCountWeight,
              color: theme.custom.colors.textSecondary,
            })}
          >
            {tasks.length}
          </Typography>
        </Stack>

        {subtitle ? (
          <Typography variant="caption" sx={(theme) => ({ color: theme.custom.colors.textSecondary })}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      

      {/* Column body */}
      <Box sx={{ flexGrow: 1 }}>
        {tasks.length === 0 ? (
          <Box
            sx={(theme) => ({
              mt: 0.5,
              p: 1.5,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: theme.custom.colors.borderDefault,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
            })}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {emptyTitle}
            </Typography>
            <Typography sx={(theme) => ({ mt: 0.5, color: theme.custom.colors.textSecondary })}>
              {emptyHint}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                id={task.id}
                title={task.title}
                priority={task.priority}
                category={task.category}
                status={task.status}
                plannedDate={task.plannedDate}
                startTime={task.startTime}
                endTime={task.endTime}
                deadlineDate={task.deadlineDate}
                deadlineTime={task.deadlineTime}
                deadline={task.deadline} 
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

function TaskBoard({ onEdit, selectedDate }) {
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const loading = useTaskStore((s) => s.loading);


  const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";

 
  const filteredTasks = useMemo(() => {
    if (!formattedDate) return [];
    return (tasks || []).filter((task) => task.plannedDate === formattedDate);
  }, [tasks, formattedDate]);

  const handleStatusChange = async (id, newStatus) => {
    if (loading) return; // prevent double submits
    const task = (tasks || []).find((t) => t.id === id);
    if (!task) return;

    try {
      await updateTask({ ...task, status: newStatus });
    } catch (e) {
      console.error(e);

    }
  };

  const handleDelete = async (id) => {
    if (loading) return;
    try {
      await deleteTask(id);
    } catch (e) {
      console.error(e);
    }
  };

  const todoTasks = useMemo(() => {
    const list = filteredTasks.filter((t) => t.status === "todo");
    return [...list].sort(
      (a, b) => (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)
    );
  }, [filteredTasks]);

  const inProgressTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === "in-progress"),
    [filteredTasks]
  );

  const doneTasks = useMemo(() => filteredTasks.filter((t) => t.status === "done"), [filteredTasks]);

  const isDayEmpty = filteredTasks.length === 0;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        height: "100%",

        borderRadius: UI.layout.boardRadius,
    
        borderColor: theme.custom.colors.borderAccent,
        bgcolor: theme.custom.colors.appBg,
        color: theme.custom.colors.textPrimary,
      })}
    >
      {/* Header */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: UI.typography.boardTitleWeight }}>
          Task Board
        </Typography>
        <Typography sx={(theme) => ({ mt: 0.25, color: theme.custom.colors.textSecondary })}>
          Date: <strong>{formattedDate || "—"}</strong>
        </Typography>
      </Box>

      {isDayEmpty ? (
        <Box
          sx={(theme) => ({

          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            No tasks planned for this date.
          </Typography>
          <Typography sx={(theme) => ({ mt: 0.5, color: theme.custom.colors.textSecondary })}>
            
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 0.5,
            display: "flex",
            gap: UI.layout.gap,
            alignItems: "flex-start",
            flexWrap: UI.layout.wrap,
          }}
        >
          <KanbanColumn
            title="To do"
            subtitle=""
            tasks={todoTasks}
            emptyTitle=""
            emptyHint=""
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEdit={onEdit}
            headerKey="yellow"
          />

          <KanbanColumn
            title="In progress"
            subtitle=""
            tasks={inProgressTasks}
            emptyTitle=""
            emptyHint=""
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEdit={onEdit}
            headerKey="blue"
          />

          <KanbanColumn
            title="Done"
            subtitle=""
            tasks={doneTasks}
            emptyTitle=""
            emptyHint=""
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onEdit={onEdit}
            headerKey="green"
          />
        </Box>
      )}
    </Paper>
  );
}

export default TaskBoard;