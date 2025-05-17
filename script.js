const candidateData = [
  "George Simion", "Nicusor Dan"
];

const candidateDescriptions = [
  "AUR", "Independent"
];

const bodyContainer = document.getElementById("bodyContainer");
const selectSubmenu = document.getElementById("selectSubmenu");
const confirmationDialog = document.getElementById("confirmationDialog");

let sortMode = "position";
let candidates = [];
let nullVotes = { id: "null-votes", name: "Null Votes", count: 0 };

let showNullVotes = true;
let showTotalValid = true;
let showTotalExpressed = true;

let pendingCandidate = null;
let pendingDelta = 0;

function createCandidate(index) {
  return {
    id: `candidate-${index}`,
    index,
    name: candidateData[index],
    description: candidateDescriptions[index],
    count: 0,
    active: true
  };
}

function getTotalValidVotes() {
  return candidates.reduce((sum, c) => sum + c.count, 0);
}

function renderCandidates() {
  bodyContainer.innerHTML = "";

  let displayList = candidates.filter(c => c.active);
  if (sortMode === "votes") {
    displayList.sort((a, b) => b.count - a.count);
  } else {
    displayList.sort((a, b) => a.index - b.index);
  }

  const totalValidVotes = getTotalValidVotes();

  for (const c of displayList) {
    const el = document.createElement("div");
    el.className = "body-item";
    el.dataset.id = c.id;
    el.innerHTML = `
      <button class="vote-btn minus"><i class="fa-solid fa-minus"></i></button>
      <img src="assets/candidate${c.index + 1}.png" />
      <div class="body-text">
        <b>${c.name}</b>
        <p>${c.description}</p>
        <p class="count"><span style="font-weight:bold;">${c.count}</span> - ${totalValidVotes > 0 ? ((c.count * 100 / totalValidVotes).toFixed(1)) : 0}%</p>
      </div>
      <button class="vote-btn plus"><i class="fa-solid fa-plus"></i></button>
    `;
    el.querySelector(".plus").addEventListener("click", () => showConfirmation(c, 1));
    el.querySelector(".minus").addEventListener("click", () => showConfirmation(c, -1));
    bodyContainer.appendChild(el);
  }

  // Null votes
  if (showNullVotes) {
    const nullEl = document.createElement("div");
    nullEl.className = "body-item null-vote";
    nullEl.innerHTML = `
      <button class="vote-btn minus"><i class="fa-solid fa-minus"></i></button>
      <img src="assets/null.png" />
      <div class="body-text">
        <b>${nullVotes.name}</b>
        <b class="count">${nullVotes.count}</b>
      </div>
      <button class="vote-btn plus"><i class="fa-solid fa-plus"></i></button>
    `;
    nullEl.querySelector(".plus").addEventListener("click", () => showConfirmation(nullVotes, 1));
    nullEl.querySelector(".minus").addEventListener("click", () => showConfirmation(nullVotes, -1));
    bodyContainer.appendChild(nullEl);
  }

  // Total valid votes
  if (showTotalValid) {
    const validEl = document.createElement("div");
    validEl.className = "body-item valid-votes";
    validEl.innerHTML = `
      <img src="assets/validvotes.png" />
      <div class="body-text">
        <b>Total Valid Votes</b>
        <b class="count">${totalValidVotes}</b>
      </div>
    `;
    bodyContainer.appendChild(validEl);
  }

  // Total votes expressed
  if (showTotalExpressed) {
    const totalExpressed = totalValidVotes + nullVotes.count;
    const totalEl = document.createElement("div");
    totalEl.className = "body-item total-votes";
    totalEl.innerHTML = `
      <img src="assets/votescast.png" />
      <div class="body-text">
        <b>Total Votes Expressed</b>
        <b class="count">${totalExpressed}</b>
      </div>
    `;
    bodyContainer.appendChild(totalEl);
  }
}

function renderSelectButtons() {
  selectSubmenu.innerHTML = "";

  candidates.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = `select-option ${c.active ? 'active' : ''}`;
    btn.dataset.index = i;

    let iconClass1 = c.active ? "fa-solid" : "fa-regular";
    let iconClass2 = c.active ? "fa-circle-check" : "fa-circle";
    btn.innerHTML = `<i class="${iconClass1} ${iconClass2}"></i> ${c.name}`;

    btn.addEventListener("click", () => toggleCandidate(i, btn));
    selectSubmenu.appendChild(btn);
  });

  const specialItems = [
    { id: 'null', name: 'Null Votes', active: showNullVotes },
    { id: 'valid', name: 'Total Valid Votes', active: showTotalValid },
    { id: 'expressed', name: 'Total Votes Expressed', active: showTotalExpressed }
  ];

  specialItems.forEach(item => {
    const btn = document.createElement("button");
    btn.className = `select-option ${item.active ? 'active' : ''}`;
    btn.dataset.id = item.id;
    btn.innerHTML = `<i class="${item.active ? 'fa-solid' : 'fa-regular'} ${item.active ? 'fa-circle-check' : 'fa-circle'}"></i> <em>${item.name}</em>`;

    btn.addEventListener("click", () => {
      if (item.id === 'null') showNullVotes = !showNullVotes;
      if (item.id === 'valid') showTotalValid = !showTotalValid;
      if (item.id === 'expressed') showTotalExpressed = !showTotalExpressed;

      btn.classList.toggle("active");
      const icon = btn.querySelector("i");
      icon.classList.toggle("fa-solid");
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-circle-check");
      icon.classList.toggle("fa-circle");

      renderCandidates();
    });

    selectSubmenu.appendChild(btn);
  });
}

function toggleCandidate(index, button) {
  const candidate = candidates[index];
  candidate.active = !candidate.active;

  button.classList.toggle("active", candidate.active);

  const icon = button.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-solid", candidate.active);
    icon.classList.toggle("fa-regular", !candidate.active);
    icon.classList.toggle("fa-circle-check", candidate.active);
    icon.classList.toggle("fa-circle", !candidate.active);
  }

  renderCandidates();
}

function showConfirmation(candidate, delta) {
  pendingCandidate = candidate;
  pendingDelta = delta;

  confirmationDialog.classList.remove("red-tint", "green-tint");

  const yesBtnColor = delta > 0 ? "#4CAF50" : "#f44336";
  const tintClass = delta > 0 ? "green-tint" : "red-tint";

  confirmationDialog.classList.add(tintClass);
  confirmationDialog.classList.remove("hidden");
  confirmationDialog.style.display = "flex";

  confirmationDialog.innerHTML = `
    <img src="assets/${candidate.id === 'null-votes' ? 'null.png' : `candidate${candidate.index + 1}.png`}" />
    <div>
      <b>${candidate.name}</b>
      <p>${candidate.description}</p>
      <b>${candidate.count} <span style="font-size:1.1em;">${delta > 0 ? "&nbsp;&nbsp;&nbsp;+1" : "&nbsp;&nbsp;&nbsp;-1"}</span></b>
    </div>
    <div class="dialog-buttons">
      <button class="dialog-btn cancel-btn">Cancel</button>
      <button class="dialog-btn yes-btn" style="background-color: ${yesBtnColor}; color: white;">Yes</button>
    </div>
  `;

  confirmationDialog.querySelector(".cancel-btn").addEventListener("click", () => {
    confirmationDialog.classList.add("hidden");
    confirmationDialog.style.display = "none";
    pendingCandidate = null;
    pendingDelta = 0;
  });

  confirmationDialog.querySelector(".yes-btn").addEventListener("click", () => {
    if (pendingCandidate) {
      pendingCandidate.count += pendingDelta;
      if (pendingCandidate.count < 0) pendingCandidate.count = 0;
    }
    confirmationDialog.classList.add("hidden");
    confirmationDialog.style.display = "none";
    pendingCandidate = null;
    pendingDelta = 0;
    renderCandidates();
  });
}

document.querySelectorAll(".sort-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-option").forEach(b => {
      b.classList.remove("active");
      b.querySelector(".icon").className = "fa-regular fa-circle icon";
    });
    btn.classList.add("active");
    btn.querySelector(".icon").className = "fa-solid fa-circle-check icon";
    sortMode = btn.dataset.sort;
    renderCandidates();
  });
});

document.getElementById("restartBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to restart all counters?")) {
    candidates.forEach(c => c.count = 0);
    nullVotes.count = 0;
    renderCandidates();
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainMenu").classList.toggle("show");
});

function init() {
  candidates = candidateData.map((_, i) => createCandidate(i));
  renderSelectButtons();
  renderCandidates();
}

init();