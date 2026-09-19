const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = {
  language: localStorage.getItem("swasthyaLanguage") || "en",
  category: "General Healthcare",
};

const hospitals = [
  {
    name: "City Care Hospital",
    specialty: "Cardiology available",
    distance: "82 km away",
    time: "Appointments available today",
    cost: "Consultation from ₹300",
  },
  {
    name: "Sanjeevani Community Hospital",
    specialty: "General Healthcare available",
    distance: "46 km away",
    time: "Appointments available tomorrow",
    cost: "Consultation from ₹200",
  },
  {
    name: "Asha Multispeciality Hospital",
    specialty: "Specialist departments available",
    distance: "105 km away",
    time: "Appointments available today",
    cost: "Consultation from ₹400",
  },
];

function showModal(title, message) {
  const modal = $("#modal");
  if (!modal) return;
  $("#modalTitle").textContent = title;
  $("#modalMessage").textContent = message;
  modal.hidden = false;
  $("#modalOk")?.focus();
}

function closeModal() {
  if ($("#modal")) $("#modal").hidden = true;
}

function setupModal() {
  $("#modalClose")?.addEventListener("click", closeModal);
  $("#modalOk")?.addEventListener("click", closeModal);
  $("#modal")?.addEventListener("click", (event) => {
    if (event.target === $("#modal")) closeModal();
  });
}

function setupMenu() {
  $("#menuToggle")?.addEventListener("click", () => {
    const nav = $("#primaryNav");
    const open = nav.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem("swasthyaLanguage", language);
  document.documentElement.lang = language === "en" ? "en" : "hi";
  showModal(
    language === "en" ? "Language updated" : "भाषा बदल गई",
    language === "en"
      ? "The interface is now in English."
      : "इंटरफेस अब हिंदी में है।",
  );
}

function setupLanguage() {
  $("#languageSwitch")?.addEventListener("click", () => {
    setLanguage(state.language === "en" ? "hi" : "en");
  });
}

function renderHospitals() {
  const list = $("#hospitalList");
  if (!list) return;
  const selected = state.category;
  $("#selectedCategory").textContent = selected;
  const matches =
    selected === "General Healthcare" || selected === "Emergency"
      ? hospitals
      : hospitals.filter((hospital) =>
          hospital.specialty
            .toLowerCase()
            .includes(selected.toLowerCase().split(" ")[0]),
        );
  const visible = matches.length ? matches : hospitals.slice(0, 2);
  list.innerHTML = visible
    .map(
      (hospital) => `
    <article class="hospital-card">
      <h3>${hospital.name}</h3>
      <p>${hospital.specialty}</p>
      <p>📍 ${hospital.distance}</p>
      <p>🕐 ${hospital.time}</p>
      <p>💰 ${hospital.cost}</p>
      <div class="hospital-actions">
        <button class="small-button view-hospital" type="button" data-hospital="${hospital.name}">View Hospital</button>
        <button class="button button-primary button-small referral-button" type="button" data-hospital="${hospital.name}">Request Referral</button>
      </div>
    </article>`,
    )
    .join("");
  bindHospitalButtons();
}

function bindHospitalButtons() {
  $$(".referral-button").forEach((button) =>
    button.addEventListener("click", () => {
      localStorage.setItem("referralRequested", "true");
      showModal(
        "Referral request sent",
        `Your referral request to ${button.dataset.hospital} was sent successfully.`,
      );
    }),
  );
  $$(".view-hospital").forEach((button) =>
    button.addEventListener("click", () => {
      showModal(
        "Hospital information",
        `${button.dataset.hospital} has suitable departments and appointment information.`,
      );
    }),
  );
}

function setupFinder() {
  $("#categoryGrid")?.addEventListener("click", (event) => {
    const button = event.target.closest(".category");
    if (!button) return;
    $$(".category").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.category = button.dataset.category;
    renderHospitals();
  });
  $("#locationButton")?.addEventListener("click", () => {
    $("#locationStatus").textContent =
      "Demo location used: Village XYZ. Nearby options updated.";
    localStorage.setItem("locationUsed", "true");
  });
  renderHospitals();
}

function simulateVoice() {
  if ($("#voiceExample")) $("#voiceExample").hidden = false;
  if ($("#understood")) $("#understood").hidden = false;
  if ($("#voiceLabel"))
    $("#voiceLabel").textContent = "Listening complete / सुनना पूरा हुआ";
  if ($("#voiceButton")) $("#voiceButton").textContent = "✓";
  localStorage.setItem("lastHealthConcern", "Breathing difficulty");
}

function setupVoice() {
  $("#voiceButton")?.addEventListener("click", () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      simulateVoice();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = state.language === "hi" ? "hi-IN" : "en-IN";
    recognition.onstart = () => {
      $("#voiceLabel").textContent = "Listening… / सुन रहे हैं…";
    };
    recognition.onresult = simulateVoice;
    recognition.onerror = simulateVoice;
    recognition.start();
  });
  $("#readAloud")?.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      showModal(
        "Read Aloud unavailable",
        "Your browser does not support the Web Speech API.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        $("#assistant")?.innerText || "Tell us what you need.",
      ),
    );
  });
}

function setupLogin() {
  $("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const role = $("#role").value;
    const destinations = {
      patient: "patient.html",
      worker: "health-worker.html",
      hospital: "hospital.html",
    };
    localStorage.setItem("swasthyaLoggedIn", "true");
    localStorage.setItem("swasthyaName", $("#name").value || "Ramesh Kumar");
    window.location.href = destinations[role];
  });
}

function setupActions() {
  $("#saveAppointment")?.addEventListener("click", () => {
    localStorage.setItem("appointmentSaved", "true");
    showModal(
      "Appointment saved",
      "Your appointment has been added to My Appointments.",
    );
  });
  $("#emergencyCall")?.addEventListener("click", () =>
    showModal(
      "Emergency guidance",
      "Please contact your local emergency service or go to the nearest emergency department immediately.",
    ),
  );
  $("#callServices")?.addEventListener("click", () =>
    showModal(
      "Emergency services",
      "In a real deployment, this button would call your local emergency number.",
    ),
  );
  $$("[data-report]").forEach((button) =>
    button.addEventListener("click", () =>
      showModal(
        button.dataset.report,
        "This demo report is available for review by an authorised healthcare professional.",
      ),
    ),
  );
}

setupMenu();
setupLanguage();
setupModal();
setupFinder();
setupVoice();
setupLogin();
setupActions();
