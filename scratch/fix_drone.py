import re

with open('src/utils/audio.ts', 'r', encoding='utf-8') as f:
    text = f.read()

old_drone = r"""      // Low rumble
      this\.droneOsc1 = this\.ctx\.createOscillator\(\);
      this\.droneOsc1\.type = 'sine';
      this\.droneOsc1\.frequency\.setValueAtTime\(55, now\); // Low A

      // Slight detune for phasing
      this\.droneOsc2 = this\.ctx\.createOscillator\(\);
      this\.droneOsc2\.type = 'triangle';
      this\.droneOsc2\.frequency\.setValueAtTime\(55\.5, now\);

      // Filter for muffled sci-fi engine sound
      const filter = this\.ctx\.createBiquadFilter\(\);
      filter\.type = 'lowpass';
      filter\.frequency\.setValueAtTime\(120, now\);

      this\.droneGain = this\.ctx\.createGain\(\);
      this\.droneGain\.gain\.setValueAtTime\(0, now\);
      this\.droneGain\.gain\.linearRampToValueAtTime\(0\.3, now \+ 3\); // fade in over 3 seconds"""

new_drone = """      // Soft Ambient Pad (A2 + E3 Perfect Fifth)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(110, now); // A2

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine'; // Removed triangle (too buzzy)
      this.droneOsc2.frequency.setValueAtTime(164.81, now); // E3 (Perfect fifth, no vibrating detune)

      // Very soft lowpass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, now);
      // Drastically reduced volume (from 0.3 to 0.02) to make it a subtle, soothing background atmosphere
      this.droneGain.gain.linearRampToValueAtTime(0.02, now + 3);"""

text = re.sub(old_drone, new_drone, text)

with open('src/utils/audio.ts', 'w', encoding='utf-8') as f:
    f.write(text)
