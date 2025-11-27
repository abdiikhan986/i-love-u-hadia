// Candle, mic, and cake logic

const flame = document.getElementById("flame");
const blowButton = document.getElementById("blowButton");
const micButton = document.getElementById("micButton");
const cutButton = document.getElementById("cutButton");
const cakeStatus = document.getElementById("cakeStatus");
const cakeSlices = document.getElementById("cakeSlices");
const cakeMessage = document.getElementById("cakeMessage");

let flameOut = false;
let micStream = null;
let audioContext = null;
let analyser = null;
let micActive = false;

function turnOffFlame() {
  if (!flameOut && flame) {
    flame.style.display = "none";
    flameOut = true;
    if (cakeStatus) {
      cakeStatus.textContent =
        "Candle is off! Now click “Cut the cake” to serve your slices, my Wifeyy. 🍰";
    }
    if (cutButton) {
      cutButton.disabled = false;
    }
  }
}

// Button blow
if (blowButton && flame) {
  blowButton.addEventListener("click", () => {
    turnOffFlame();
  });
}

// Mic blow (simple threshold-based)
if (micButton && flame) {
  micButton.addEventListener("click", async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (cakeStatus) {
        cakeStatus.textContent =
          "Your browser does not allow mic use. Just use the tap button to blow the candle, my love. 💜";
      }
      return;
    }

    if (micActive) {
      micActive = false;
      micButton.textContent = "Blow using your mic 🎙️";
      if (cakeStatus) {
        cakeStatus.textContent =
          "Mic stopped. You can tap the button to blow the candle anytime. 💫";
      }
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
      return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(micStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      micActive = true;
      micButton.textContent = "Stop mic blowing ❌";

      if (cakeStatus) {
        cakeStatus.textContent =
          "Mic is listening… blow gently towards your phone or laptop mic to turn off the candle. 💨";
      }

      function checkVolume() {
        if (!micActive) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Adjust threshold if needed; louder blow = higher average
        if (average > 50) {
          turnOffFlame();
          micActive = false;
          micButton.textContent = "Blow using your mic 🎙️";
          if (micStream) {
            micStream.getTracks().forEach((track) => track.stop());
          }
        } else {
          requestAnimationFrame(checkVolume);
        }
      }

      requestAnimationFrame(checkVolume);
    } catch (err) {
      if (cakeStatus) {
        cakeStatus.textContent =
          "Mic permission denied. No worries, just tap the blow button to turn off the candle. 💜";
      }
    }
  });
}

// Cut cake and show slices
if (cutButton) {
  cutButton.addEventListener("click", () => {
    if (!flameOut) return;
    if (cakeSlices) {
      cakeSlices.style.display = "flex";
    }
    if (cakeMessage) {
      cakeMessage.textContent =
        "Sharing three special slices with you: one for your present💟😊, one for our future💞💗, and one for our endless life together in Jannah💞💗😊💖.";
    }
  });
}