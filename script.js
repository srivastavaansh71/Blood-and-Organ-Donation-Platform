// Simple helper functions
const $ = id => document.getElementById(id);
function uid() { return "id-" + Math.random().toString(36).substr(2, 9); }
function now() { return new Date().toLocaleString(); }

// Storage keys
const USERS_KEY = "donation_users";
const REQ_KEY = "donation_requests";
const NOTIF_KEY = "donation_notifications";

// Load or initialize
let users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
let requests = JSON.parse(localStorage.getItem(REQ_KEY) || "[]");
let notifs = JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");

// Save functions
function saveUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function saveRequests() { localStorage.setItem(REQ_KEY, JSON.stringify(requests)); }
function saveNotifs() { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs)); }

// Toast
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Render everything
function render() {
  $("userCount").textContent = users.length + " users";
  $("donorCount").textContent = users.filter(u => u.role === "donor").length;
  $("recipientCount").textContent = users.filter(u => u.role === "recipient").length;
  $("notifTotal").textContent = notifs.length;

  // Render donor list
  const donorList = $("donorList");
  donorList.innerHTML = users
    .filter(u => u.role === "donor")
    .map(u => `
      <div class="list-item">
        <div>
          <strong>${u.name}</strong> (${u.blood})
          <div class="small-muted">${u.city}</div>
        </div>
        <button class="notify-btn" onclick="alert('Phone: ${u.phone}')">View</button>
      </div>
    `).join("");

  // Render recipient list
  const recList = $("recipientList");
  recList.innerHTML = users
    .filter(u => u.role === "recipient")
    .map(u => `
      <div class="list-item">
        <div>
          <strong>${u.name}</strong> (${u.blood})
          <div class="small-muted">${u.city}</div>
        </div>
      </div>
    `).join("");

  // Render emergency table
  const reqTable = $("reqTable");
  reqTable.innerHTML = requests
    .reverse()
    .map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.blood}</td>
        <td>${r.city}</td>
        <td>${r.notes}</td>
        <td>${r.time}</td>
      </tr>
    `).join("");

  // Render notifications
  $("notificationsArea").innerHTML = notifs
    .map(n => `
      <div class="list-item">
        <div>${n.msg}</div>
        <div class="small-muted">${n.time}</div>
      </div>
    `).join("");

  // Render activity log
  $("activityLog").innerHTML = requests
    .map(r => `<div>Emergency: ${r.blood} in ${r.city} — ${r.time}</div>`)
    .join("");
}

// Register user
$("registerBtn").onclick = () => {
  const user = {
    id: uid(),
    name: $("name").value,
    age: $("age").value,
    phone: $("phone").value,
    role: document.querySelector("input[name='role']:checked").value,
    blood: $("blood").value,
    organ: $("organ").value,
    city: $("city").value,
    available: true
  };

  if (!user.name || !user.blood || !user.city) {
    alert("Fill name, blood group, and city.");
    return;
  }

  users.push(user);
  saveUsers();
  toast("User registered");
  render();
};

// Toggle availability
$("updateAvailability").onclick = () => {
  const name = $("name").value;
  const phone = $("phone").value;

  let u = users.find(x => x.name === name && x.phone === phone);
  if (!u) return alert("Enter exact name & phone to toggle availability.");

  u.available = !u.available;
  saveUsers();
  $("availabilityLabel").textContent = u.available ? "available" : "away";
  render();
};

// Search donors
$("searchBtn").onclick = () => {
  const blood = $("searchBlood").value;
  const city = $("searchCity").value.toLowerCase();

  let results = users.filter(u =>
    u.role === "donor" &&
    (blood ? u.blood === blood : true) &&
    (city ? u.city.toLowerCase() === city : true)
  );

  $("searchResults").innerHTML = results.length
    ? results.map(u => `
      <div class="list-item">
        <div>
          <strong>${u.name}</strong> (${u.blood})
          <div class="small-muted">${u.city}</div>
        </div>
        <button class="notify-btn" onclick="notifyDonor('${u.id}')">Notify</button>
      </div>
    `).join("")
    : `<div class="small-muted">No donors found</div>`;
};

// Notify donor
function notifyDonor(id) {
  const donor = users.find(u => u.id === id);
  if (!donor) return;

  notifs.push({
    id: uid(),
    msg: `Contact request for ${donor.blood} blood`,
    time: now()
  });

  saveNotifs();
  render();
  toast("Donor notified");
}

// Emergency request
$("emergencyBtn").onclick = () => {
  const blood = $("emBlood").value;
  const city = $("emCity").value;
  const notes = $("emNotes").value;

  const req = {
    id: uid(),
    blood,
    city,
    notes,
    time: now()
  };

  requests.push(req);
  saveRequests();

  // Notify matching donors
  users
    .filter(u => u.role === "donor" && u.blood === blood && u.city === city && u.available)
    .forEach(u => {
      notifs.push({ id: uid(), msg: `EMERGENCY: ${blood} needed in ${city}`, time: now() });
    });

  saveNotifs();
  render();
  toast("Emergency alert sent");
};

// Seed sample data
$("seedBtn").onclick = () => {
  if (!confirm("Seed example data?")) return;

  users = [
    { id: uid(), name: "Ansh", age: 29, phone: "9307085544", role: "donor", blood: "O+", organ: "Kidney", city: "Lucknow", available: true },
    { id: uid(), name: "Arjun", age: 32, phone: "8604041453", role: "donor", blood: "A+", organ: "Blood", city: "Kanpur", available: true },
    { id: uid(), name: "Bheem", age: 26, phone: "9876543210", role: "recipient", blood: "B+", organ: "Liver", city: "Lucknow", available: true },
    { id: uid(), name: "Navneet", age: 28, phone: "9450001782", role: "recipient", blood: "O-", organ: "Heart", city: "Lucknow", available: true }
  ];

  requests = [];
  notifs = [];

  saveUsers();
  saveRequests();
  saveNotifs();
  render();
  toast("Sample data loaded");
};

// Clear data
$("clearBtn").onclick = () => {
  if (!confirm("Clear all data?")) return;
  users = []; requests = []; notifs = [];
  saveUsers(); saveRequests(); saveNotifs();
  render();
  toast("All data cleared");
};

// Initial render
render();
