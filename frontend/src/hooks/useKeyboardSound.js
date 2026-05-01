const keyStrokeSounds = [
  new Audio("/sound/keystroke1.mp3"),
  new Audio("/sound/keystroke2.mp3"),
  new Audio("/sound/keystroke3.mp3"),
  new Audio("/sound/keystroke4.mp3"),
];

function useKeyboardSound() { 
    const PlayRandomKeystrokeSound = () => {
      const randomSound =
        keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
      randomSound.currentTime = 0; // Reset to start for quick successive plays ,To avoid second sound plays while first is still playing
      randomSound.play().catch((error) => console.log("Error playing sound:", error));
    }
    return { PlayRandomKeystrokeSound }
}
export default useKeyboardSound;