/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // La Contrainte — a workshop command desk. Near-black concrete, signal red,
        // electric chartreuse. Spare paper-white for the reflective logbook.
        void: {
          DEFAULT: "#0d0d0f",
          soft: "#16161a",
          line: "#26262c",
          mute: "#33333b",
        },
        bone: {
          DEFAULT: "#f4f1e8",
          dim: "#c9c5b8",
          faint: "#8a8779",
        },
        signal: "#ff3b1d", // command red
        ember: "#ff7a1a", // escalation orange
        volt: "#d8ff3e", // electric chartreuse — accountability / done
        ink: "#0d0d0f",
        // outcome accents
        done: "#d8ff3e",
        crack: "#9b7bff", // "ça m'a ouvert" — violet shock
        tried: "#3ec8ff",
        dodged: "#ff5b6e",
      },
      fontFamily: {
        display: ['"Anton"', "Impact", "sans-serif"],
        heavy: ['"Archivo Black"', "system-ui", "sans-serif"],
        body: ['"Archivo"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        hard: "6px 6px 0 0 #0d0d0f",
        "hard-sm": "3px 3px 0 0 #0d0d0f",
        "hard-volt": "6px 6px 0 0 #d8ff3e",
        "hard-signal": "6px 6px 0 0 #ff3b1d",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        stamp: {
          "0%": { opacity: "0", transform: "scale(1.18) rotate(-3deg)" },
          "60%": { opacity: "1", transform: "scale(0.97) rotate(-3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-3deg)" },
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
        stamp: "stamp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        pulseLine: "pulseLine 1.1s ease-in-out infinite",
        sweep: "sweep 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
