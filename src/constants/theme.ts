export const lightColors = {
  background: "#F4F9FE",
  surface: "#FFFFFF",
  ink: "#071F42",
  navy: "#062B5F",
  muted: "#607089",
  line: "#DCE8F5",
  blue: "#075ECF",
  teal: "#009FA6",
  green: "#13A66B",
  amber: "#D88408",
  danger: "#D82D26",
  dangerSoft: "#FFFAFA",
  successSoft: "#DCF8E8",
  blueSoft: "#EAF4FF",
  surfaceSoft: "#F1F5F9",
  field: "#FBFDFF",
  onPrimary: "#FFFFFF",
  warningLine: "#FFDCA1",
  purpleSoft: "#EFE7FF",
  purple: "#7C3AED",
  tealSoft: "#EFFCFF",
  tealLine: "#9FD6DC",
  successText: "#09643D",
  text: "#071F42",
  warning: "#D88408",
  warningSoft: "#FFF8E1"
};

export const darkColors = {
  ...lightColors,
  background: "#061221",
  surface: "#0F1F33",
  ink: "#F6FAFF",
  navy: "#D9EAFE",
  muted: "#AFC1D6",
  line: "#274059",
  blueSoft: "#123A62",
  dangerSoft: "#351616",
  successSoft: "#123525",
  surfaceSoft: "#172A42",
  field: "#102238",
  onPrimary: "#FFFFFF",
  warningLine: "#7A5420",
  purpleSoft: "#261D42",
  purple: "#B9A5FF",
  tealSoft: "#102F38",
  tealLine: "#255A64",
  successText: "#72E0A3",
  warningSoft: "#352A12",
  text: "#F6FAFF"
};

export const colors = { ...lightColors };
export const applyThemeMode = (mode: "light" | "dark") => Object.assign(colors, mode === "dark" ? darkColors : lightColors);

export const shadow = "0 14px 34px rgba(14, 65, 115, 0.12)";
