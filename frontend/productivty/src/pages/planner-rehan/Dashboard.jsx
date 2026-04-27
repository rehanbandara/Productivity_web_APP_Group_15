import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";

import AddTaskModal from "../../components/planner-rehan/AddTaskModal";
import ContextPanel from "../../components/planner-rehan/ContextPanel";
import TaskBoard from "../../components/planner-rehan/TaskBoard";
import Main_NavBar from "../../components/common/Main_NavBar";

import useTaskStore from "../../store/taskStore";

const UI = {
  layout: {
    pageMinHeight: "100vh",
    pagePx: { xs: 2, md: 3 },
    pagePy: { xs: 2, md: 3 },
    containerMaxWidth: 1200,

    gap: 2,

    rightPanelWidth: 360,
    rightPanelHeight: "calc(100vh - 140px)",
  },
};

function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const clearError = useTaskStore((s) => s.clearError);

  useEffect(() => {
    loadTasks();

  }, []);

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: UI.layout.pageMinHeight,
        bgcolor: theme.custom?.colors?.appBg || "background.default",
        px: UI.layout.pagePx,
        py: UI.layout.pagePy,
        color: theme.custom?.colors?.textPrimary || "text.primary",
      })}
    >
      <Box sx={{ maxWidth: UI.layout.containerMaxWidth, mx: "auto" }}>
        <Main_NavBar brand="Productivity" />

        {/* Click to dismiss error */}
        {error ? (
          <Box
            role="alert"
            onClick={clearError}
            sx={(theme) => ({
              mt: 2,
              mb: 1,
              p: 1.25,
              borderRadius: 2,
              border: "1px solid",
              borderColor: theme.custom?.colors?.danger || "error.main",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(217,30,54,0.10)"
                  : "rgba(217,30,54,0.08)",
              cursor: "pointer",
            })}
            title="Click to dismiss"
          >
            {error}
          </Box>
        ) : null}

        <Box
          sx={{
            display: "flex",
            gap: UI.layout.gap,
            alignItems: "flex-start",
            flexWrap: { xs: "wrap", md: "nowrap" },
            opacity: loading ? 0.85 : 1,
          }}
        >
          <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
            <TaskBoard onEdit={handleEditTask} selectedDate={selectedDate} />
          </Box>

          <Box
            sx={{
              width: UI.layout.rightPanelWidth,
              height: UI.layout.rightPanelHeight,
              flex: `0 0 ${UI.layout.rightPanelWidth}px`,
              overflow: "auto",
            }}
          >
            <ContextPanel
              onOpenModal={handleOpenAddModal}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Box>
        </Box>

        <AddTaskModal
          open={openModal}
          onClose={handleCloseModal}
          task={selectedTask}
          selectedDate={selectedDate}
        />
      </Box>
    </Box>
  );
}

export default Dashboard;