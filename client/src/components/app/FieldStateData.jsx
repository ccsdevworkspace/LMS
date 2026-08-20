export const InputStateConfig = {
  success: {
    container:
      "border-2 border-success bg-success/10 shadow-[0_1_6px_2px_rgba(35,163,109,0.4)]",
    message: "text-success",
  },
  error: {
    container:
      "border-2 border-danger bg-danger/10 shadow-[0_1_6px_2px_rgba(226,87,87,0.4)]",
    message: "text-danger",
  },
  disabled: {
    container: "border-border bg-muted text-fg-disabled cursor-not-allowed",
  },
  default: {
    container: "border-input-border bg-input",
  },
}