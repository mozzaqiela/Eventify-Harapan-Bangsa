// ---------- Data ----------
const EVENTS = [
  {
    id: "konser",
    nama: "From Campus To Career",
    tanggal: "3 Nov 2026  ",
    kota: "Ruang Seminar Lantang 3 ITHB, Bandung",
    gambar: "assets/image/IEC.jpg",
    tiket: [
      { id: "reguler", nama: "Reguler", harga: 5000 },
    ],
  },
  {
    id: "seminar",
    nama: "The Carbon Bill",
    tanggal: "24 Okt 2026",
    kota: "Assembly Hall Lantai 5 ITHB, Bandung",
    gambar: "assets/image/Akuntan.jpg",
    tiket: [{ id: "reguler", nama: "Reguler", harga: 0 }],
  },
  {
    id: "workshop",
    nama: "KNOT N CRAFT",
    tanggal: "16 Okt 2026",
    kota: "R. 311 Lt. 3 ITHB, Bandung",
    gambar: "assets/image/Workshop.jpg",
    tiket: [{ id: "reguler", nama: "Reguler", harga: 18000 }],
  },
];

const MAX_TIKET = 10;
const HALAMAN_HISTORY = "../history/history.html";

// ---------- Elemen ----------
const $form = $("#orderForm");
const $acara = $("#acara");
const $jenis = $("#jenis");
const $jumlah = $("#jumlah");
const $nama = $("#nama");
const $email = $("#email");
const $telepon = $("#telepon");

// ---------- Helper ----------
const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
const currentEvent = () => EVENTS.find((e) => e.id === $acara.val());
const currentTiket = () =>
  currentEvent().tiket.find((t) => t.id === $jenis.val());
const getJumlah = () => parseInt($jumlah.val(), 10);

function setError($input, message) {
  $input.closest(".field").toggleClass("has-error", Boolean(message));
  $("#err-" + $input.attr("id")).text(message);
}

// ---------- Render dropdown ----------
function renderAcara() {
  $acara.html(
    EVENTS.map(
      (e) => `<option value="${e.id}">${e.nama} – ${e.tanggal}</option>`,
    ).join(""),
  );
}

function renderJenis() {
  const prev = $jenis.val();
  const tickets = currentEvent().tiket;
  $jenis.html(
    tickets
      .map(
        (t) =>
          `<option value="${t.id}">${t.nama} – ${rupiah(t.harga)}</option>`,
      )
      .join(""),
  );
  if (tickets.some((t) => t.id === prev)) $jenis.val(prev);
}

// ---------- Ringkasan ----------
function updateSummary() {
  const ev = currentEvent();
  const tiket = currentTiket();
  const jumlah = Math.min(Math.max(getJumlah() || 0, 0), MAX_TIKET);
  const total = tiket.harga * jumlah;

  $("#sumNama").text(ev.nama);
  $("#sumMeta").text(`${ev.tanggal} · ${ev.kota}`);
  $("#sumThumb").attr({ src: ev.gambar, alt: `Gambar ${ev.nama}` });
  $("#sumItem").text(`${tiket.nama} × ${jumlah}`);
  $("#sumItemHarga, #sumTotal").text(rupiah(total));
}

// ---------- Validasi ----------
function validate() {
  const jumlah = getJumlah();
  const checks = [
    [
      $jumlah,
      !jumlah || jumlah < 1 || jumlah > MAX_TIKET,
      `Jumlah tiket harus 1–${MAX_TIKET}.`,
    ],
    [
      $nama,
      $nama.val().trim().length < 3,
      "Isi nama lengkap sesuai identitas.",
    ],
    [
      $email,
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email.val().trim()),
      "Isi email yang valid, contoh: nama@email.com.",
    ],
    [
      $telepon,
      !/^(08|\+628|628)\d{8,12}$/.test($telepon.val().replace(/[\s-]/g, "")),
      "Isi nomor telepon yang diawali 08, contoh: 08XXXXXXXX.",
    ],
  ];
  let valid = true;
  checks.forEach(([input, invalid, message]) => {
    setError(input, invalid ? message : "");
    if (invalid) valid = false;
  });
  return valid;
}

// ---------- Pembayaran ----------
let order = null; // data pesanan yang sedang diproses

function openPayment() {
  const tiket = currentTiket();
  const ev = currentEvent();
  const jumlah = getJumlah();

  order = {
    kode: "EHB-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    nama: $nama.val().trim(),
    email: $email.val().trim(),
    acara: ev.nama,
    tanggal: ev.tanggal,
    kota: ev.kota,
    jenis: tiket.nama,
    jumlah,
    total: tiket.harga * jumlah,
    metode: "",
  };

  $("#payTotal").text(rupiah(order.total));
  $("#payProcessing").prop("hidden", true);
  $(".pay-option").prop("disabled", false).first().trigger("focus");
  $("#payModal").prop("hidden", false);
}

function closePayment() {
  $("#payModal").prop("hidden", true);
}

function closeTicket() {
  window.location.href = HALAMAN_HISTORY;
}

function pay(method) {
  order.metode = method;
  $(".pay-option").prop("disabled", true);
  $("#payProcessing").prop("hidden", false);

  setTimeout(async () => {
    try {
      closePayment();
      await showTicket();
    } finally {
      $("#payProcessing").prop("hidden", true);
      $(".pay-option").prop("disabled", false);
    }
  }, 900);
}

// ---------- Tiket ----------
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, size, weight) {
  let s = size;
  ctx.font = `${weight} ${s}px Poppins, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && s > 14) {
    s -= 1;
    ctx.font = `${weight} ${s}px Poppins, sans-serif`;
  }
  if (ctx.measureText(text).width > maxWidth) {
    while (text.length > 1 && ctx.measureText(text + "…").width > maxWidth) {
      text = text.slice(0, -1);
    }
    text += "…";
  }
  return text;
}

function drawQR(ctx, text, x, y, size) {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x - 16, y - 16, size + 32, size + 32, 16);
  ctx.fill();

  if (typeof qrcode === "undefined") {
    ctx.fillStyle = "#2c1d13";
    ctx.font = "500 14px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("QR tidak dapat dibuat", x + size / 2, y + size / 2);
    ctx.fillText("(cek koneksi internet)", x + size / 2, y + size / 2 + 20);
    ctx.textAlign = "left";
    return;
  }

  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / count;

  ctx.fillStyle = "#2c1d13";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(x + c * cell, y + r * cell, cell + 0.5, cell + 0.5);
      }
    }
  }
}

// Bentuk tiket
function ticketPath(ctx, W, H, r, notchX, notchR) {
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(notchX - notchR, 0);
  ctx.arc(notchX, 0, notchR, Math.PI, 0, true);
  ctx.lineTo(W - r, 0);
  ctx.arcTo(W, 0, W, r, r);
  ctx.lineTo(W, H - r);
  ctx.arcTo(W, H, W - r, H, r);
  ctx.lineTo(notchX + notchR, H);
  ctx.arc(notchX, H, notchR, 0, Math.PI, true);
  ctx.lineTo(r, H);
  ctx.arcTo(0, H, 0, H - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
}

async function drawTicket(o) {
  try {
    await Promise.all([
      document.fonts.load("400 16px Poppins"),
      document.fonts.load("600 16px Poppins"),
      document.fonts.load("700 16px Poppins"),
    ]);
  } catch (_) {
    // Font fallback tetap memungkinkan tiket digambar.
  }

  const canvas = $("#ticketCanvas")[0];
  const W = 1100,
    H = 560,
    S = 2;
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const SPLIT = 740;
  const PAD = 56;
  const BROWN = "#7b573f",
    CREAM = "#fffaf2",
    SAND = "#dfcfbd",
    INK = "#2c1d13";

  const BORDER = BROWN;
  const BORDER_W = 4;

  ctx.save();
  ticketPath(ctx, W, H, 32, SPLIT, 20);
  ctx.clip();

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = BROWN;
  ctx.fillRect(0, 0, SPLIT, H);

  // Border: digambar di tepi jalur
  ctx.lineWidth = BORDER_W * 2;
  ctx.strokeStyle = BORDER;
  ctx.stroke();
  ctx.restore();

  // Garis putus-putus
  ctx.save();
  ctx.strokeStyle = SAND;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(SPLIT, 40);
  ctx.lineTo(SPLIT, H - 40);
  ctx.stroke();
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Header kiri
  ctx.fillStyle = SAND;
  ctx.font = "600 19px Poppins, sans-serif";
  ctx.fillText("Event Harapan Bangsa", PAD, 84);

  // Pill "Lunas"
  const pillW = 108,
    pillH = 40;
  ctx.fillStyle = CREAM;
  roundRect(ctx, SPLIT - PAD - pillW, 56, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = BROWN;
  ctx.font = "700 17px Poppins, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Lunas", SPLIT - PAD - pillW / 2, 83);
  ctx.textAlign = "left";

  // Nama acara + tanggal
  ctx.fillStyle = CREAM;
  ctx.fillText(fitText(ctx, o.acara, SPLIT - PAD * 2, 44, 700), PAD, 170);

  ctx.fillStyle = SAND;
  ctx.font = "500 21px Poppins, sans-serif";
  ctx.fillText(`${o.tanggal} · ${o.kota}`, PAD, 212);

  // Garis pemisah
  ctx.strokeStyle = "rgba(223, 207, 189, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD, 252);
  ctx.lineTo(SPLIT - PAD, 252);
  ctx.stroke();

  // Detail (label kecil di atas, nilai di bawahnya)
  const COL2 = 420;
  const field = (label, value, x, y, maxW, size = 24) => {
    ctx.fillStyle = SAND;
    ctx.font = "500 15px Poppins, sans-serif";
    ctx.fillText(label, x, y);
    ctx.fillStyle = CREAM;
    ctx.fillText(fitText(ctx, value, maxW, size, 600), x, y + 34);
  };
  field("Nama pemesan", o.nama, PAD, 300, COL2 - PAD - 24);
  field("Jenis tiket", o.jenis, COL2, 300, SPLIT - PAD - COL2);
  field("Jumlah", `${o.jumlah} tiket`, PAD, 380, COL2 - PAD - 24);
  field("Pembayaran", o.metode, COL2, 380, SPLIT - PAD - COL2);
  field("Total", rupiah(o.total), PAD, 460, COL2 - PAD - 24, 26);

  // Stub kanan: QR
  const qrSize = 224;
  const cx = SPLIT + (W - SPLIT) / 2;
  const qrText = ["EHB", o.kode, o.acara, o.jenis, o.jumlah, o.nama].join("|");
  drawQR(ctx, qrText, cx - qrSize / 2, 72, qrSize);

  ctx.textAlign = "center";
  ctx.fillStyle = BROWN;
  ctx.font = "500 15px Poppins, sans-serif";
  ctx.fillText("Kode pesanan", cx, 372);
  ctx.fillStyle = INK;
  ctx.font = "700 26px Poppins, sans-serif";
  ctx.fillText(o.kode, cx, 410);
  ctx.fillStyle = BROWN;
  ctx.font = "400 14px Poppins, sans-serif";
  ctx.fillText("Tunjukkan QR ini di pintu masuk", cx, 450);
  ctx.textAlign = "left";
}

async function showTicket() {
  $("#ticketSub").text(
    `Pembayaran ${order.metode} sebesar ${rupiah(order.total)} diterima. ` +
      `Tiket juga dikirim ke ${order.email}.`,
  );
  await drawTicket(order);
  $("#ticketModal").prop("hidden", false);
  $("#btnDownload").trigger("focus");
}

function downloadTicket() {
  const $link = $("<a>")
    .attr({
      download: `Tiket-${order.kode}.png`,
      href: $("#ticketCanvas")[0].toDataURL("image/png"),
    })
    .appendTo("body");
  $link[0].click();
  $link.remove();
}

// ---------- Event listeners ----------
$acara.on("change", () => {
  renderJenis();
  updateSummary();
});
$jenis.on("change", updateSummary);

$jumlah.on("input", () => {
  if (getJumlah() > MAX_TIKET) $jumlah.val(MAX_TIKET);
  updateSummary();
});

$nama
  .add($email)
  .add($telepon)
  .on("input", function () {
    setError($(this), "");
  });

$form.on("submit", (e) => {
  e.preventDefault();
  if (validate()) return openPayment();
  $form.find(".has-error input").first().trigger("focus");
});

$("#payOptions").on("click", ".pay-option", function () {
  pay($(this).data("method"));
});
$("#payCancel").on("click", closePayment);
$("#payModal").on("click", function (e) {
  if (e.target === this) closePayment();
});

$("#btnDownload").on("click", downloadTicket);
$("#ticketClose").on("click", closeTicket);
$("#ticketModal").on("click", function (e) {
  if (e.target === this) closeTicket();
});

$(document).on("keydown", (e) => {
  if (e.key !== "Escape" || !$("#payProcessing").prop("hidden")) return;
  if (!$("#ticketModal").prop("hidden")) closeTicket();
  else closePayment();
});

// ---------- Arah ----------
$(function () {
  renderAcara();
  const acaraPilihan = { 1: "konser", 2: "workshop", 3: "seminar" };
  const acaraId = new URLSearchParams(window.location.search).get("id");
  if (acaraPilihan[acaraId]) $acara.val(acaraPilihan[acaraId]);
  renderJenis();
  updateSummary();
});