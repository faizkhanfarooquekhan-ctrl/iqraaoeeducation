export async function celebrate() {
  const confetti = (await import("canvas-confetti")).default;
  const end = Date.now() + 2400;
  const colors = ["#c4b5fd", "#f472b6", "#34d399", "#fde68a", "#67e8f9"];
  const burst = () => {
    confetti({
      particleCount: 36,
      spread: 75,
      startVelocity: 32,
      colors,
      origin: { x: 0.15 + Math.random() * 0.2, y: 0.65 },
      zIndex: 80,
    });
    confetti({
      particleCount: 36,
      spread: 75,
      startVelocity: 32,
      colors,
      origin: { x: 0.7 + Math.random() * 0.15, y: 0.65 },
      zIndex: 80,
    });
    if (Date.now() < end) window.setTimeout(burst, 220);
  };
  burst();
}
