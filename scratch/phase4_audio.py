import re

with open('src/utils/audio.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Add the Drone class variables and methods
injection = """
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public playFocusDrone() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      this.stopFocusDrone(); // clear existing

      const now = this.ctx.currentTime;
      
      // Low rumble
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, now); // Low A

      // Slight detune for phasing
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(55.5, now);

      // Filter for muffled sci-fi engine sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, now);
      this.droneGain.gain.linearRampToValueAtTime(0.3, now + 3); // fade in over 3 seconds

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {}
  }

  public stopFocusDrone() {
    if (!this.droneGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0, now + 2); // fade out over 2 seconds
      setTimeout(() => {
        if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); this.droneOsc1 = null; }
        if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); this.droneOsc2 = null; }
        if (this.droneGain) { this.droneGain.disconnect(); this.droneGain = null; }
      }, 2100);
    } catch {}
  }
}"""

text = text.replace("}\n\nexport const sounds", injection + "\n\nexport const sounds")

with open('src/utils/audio.ts', 'w', encoding='utf-8') as f:
    f.write(text)
