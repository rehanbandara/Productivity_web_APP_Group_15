
export const ACCENTS = {
    blue: {
        name: "blue",
        primary: "#188fa7",
        primaryHover: "#157e93",
        onPrimary: "#ffffff",
        borderAccent: "#188fa7",
    },
    purple: {
        name: "purple",
        primary: "#8b5cf6",
        primaryHover: "#7c3aed",
        onPrimary: "#ffffff",
        borderAccent: "#8b5cf6",
    },
};

export const BASE_MODES = {

    light: {
        name: "light",
        colors: {
            appBg: "#f6f7fb",
            surface1: "#ffffff",
            surface2: "#ffffff",
            surface3: "#eef2f7",

            textPrimary: "#111827",
            textSecondary: "rgba(17,24,39,0.70)",

            borderDefault: "rgba(17,24,39,0.12)",
            divider: "rgba(17,24,39,0.10)",

            danger: "#d91e36",
            warning: "#f59e0b",
            success: "#16a34a",
            info: "#188fa7",

            label: {
                green: "#16a34a",
                red: "#d91e36",
                blue: "#188fa7",
                yellow: "#f59e0b",
            },
        },
    },
};

export const DEFAULT_PREFERENCES = {
    mode: "light",
    accent: "blue",
    fontScale: 1.0,
    radiusScale: 1.0,
};

export function resolveMode(mode, systemPrefersDark) {
    if (mode === "system") return systemPrefersDark ? "dark" : "light";
    return mode === "dark" ? "dark" : "light";
}

export function getAccentByName(name) {
    return ACCENTS[name] || ACCENTS[DEFAULT_PREFERENCES.accent];
}

export function getBaseByMode(mode) {
    return BASE_MODES[mode] || BASE_MODES.dark;
}

export function buildTokens({ effectiveMode, accentName, fontScale, radiusScale }) {
    const base = getBaseByMode(effectiveMode);
    const accent = getAccentByName(accentName);

    const radius = {
        sm: Math.round(8 * radiusScale),
        md: Math.round(14 * radiusScale),
        lg: Math.round(18 * radiusScale),
        pill: 999,
    };

    const typography = {
        fontFamily: [
            "Inter",
            "system-ui",
            "-apple-system",
            "Segoe UI",
            "Roboto",
            "Arial",
        ].join(","),
        weight: { regular: 600, strong: 800, heavy: 900 },
        fontScale,
    };

    return {
        name: `${effectiveMode}-${accent.name}`,
        mode: effectiveMode,
        accent: accent.name,
        colors: {
            ...base.colors,
            primaryBtnBg: accent.primary,
            primaryBtnHoverBg: accent.primaryHover,
            primaryBtnText: accent.onPrimary,
            borderAccent: accent.borderAccent,
        },
        radius,
        typography,
    };
}

export const THEMES = {
    darkNeon: { name: "darkNeon" },
    light: { name: "light" },
};