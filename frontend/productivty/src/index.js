import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeController } from "./theme/ThemeController";

/**
 * React Query basics:
 * - QueryClient stores the cache for fetched server data (tasks)
 * - QueryClientProvider makes it available to your whole app
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeController>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ThemeController>
        </QueryClientProvider>
    </React.StrictMode>
);
