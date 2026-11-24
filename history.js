// ===== Helper tanggal, data contoh, dan tiket =====

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

// ---------- Tanggal ----------
const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const BULAN_PANJANG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const fmtShort = (d) =>
  `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
const fmtLong = (d) =>
  `${d.getDate()} ${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()}`;
const today = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Tanggal acara dihitung dari hari ini; acara lebih dari H-3 masih bisa dibatalkan.
function seedOrders() {
  const t = today();
  const stamp = (d) => toISO(d).replaceAll("-", "");
  const dipesan = new Date().toISOString();
  // Urutan argumen: kode urutan, ID acara untuk pemesanan, nama acara, hari dari hari ini, poster, kategori, total harga.
  const order = (suffix, acaraId, nama, hari, gambar, kategori, total) => {
    const acara = addDays(t, hari);
    return {
      kode: `EHB-${stamp(t)}-TEST-${suffix}`,
      acaraId,
      nama: "Example", // Nama pemesan, bukan nama acara.
      email: "example@contoh.com",
      acara: nama, // Nama acara dari argumen order().
      gambar, // Path poster acara.
      kategori,
      iso: toISO(acara), // Tanggal acara untuk logika/filter.
      tanggal: fmtShort(acara), // Tanggal acara yang ditampilkan.
      kota: "Bandung",
      jenis: "Reguler",
      jumlah: 1,
      total,
      metode: "QRIS",
      status: "lunas",
      dipesan, // Waktu pesanan dibuat.
      simulasi: true,
    };
  };

  return [
    order(
      "1",
      "1",
      "From Campus To Career",
      20,
      "assets/image/IEC.jpg",
      "Seminar",
      5000,
    ),
    order(
      "2",
      "2",
      "Knot n Craft",
      5,
      "assets/image/Workshop.jpg",
      "Workshop",
      18000,
    ),
    order(
      "3",
      "3",
      "The Carbon Bill",
      2,
      "assets/image/Akuntan.jpg",
      "Seminar",
      0,
    ),
  ];
}

const isSimulationOrder = (o) =>
  o.simulasi === true || /^EHB-\d{8}-TEST(?:-[123])?$/.test(o.kode);

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

// Teks "Pembayaran" pada tiket: selalu mengikuti status pesanan
function paymentText(o) {
  if (o.status === "dibatalkan") return "Dibatalkan";
  return o.metode || "Lunas";
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
  ctx.fillText(paymentText(o), SPLIT - PAD - pillW / 2, 83);
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
  field("Pembayaran", paymentText(o), COL2, 380, SPLIT - PAD - COL2);
  field("Total", rupiah(o.total), PAD, 460, COL2 - PAD - 24, 26);

  // Stub kanan: QR
  const qrSize = 224;
  const cx = SPLIT + (W - SPLIT) / 2;
  const qrText = ["EHB", o.kode, o.acara, o.jenis, o.jumlah, o.nama].join("|");
  const batal = o.status === "dibatalkan";
  ctx.save();
  if (batal) ctx.globalAlpha = 0.2;
  drawQR(ctx, qrText, cx - qrSize / 2, 72, qrSize);
  ctx.restore();
  if (batal) {
    ctx.save();
    ctx.translate(cx, 72 + qrSize / 2);
    ctx.rotate(-Math.PI / 9);
    ctx.textAlign = "center";
    ctx.fillStyle = "#a34236";
    ctx.font = "700 34px Poppins, sans-serif";
    ctx.fillText("DIBATALKAN", 0, 12);
    ctx.restore();
  }

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


// ============ Logika halaman Riwayat ================== 

// ===== Halaman Riwayat Pemesanan =====

// ---------- Konstanta & state ----------
const HALAMAN_PESAN = "../pemesananTiket/pemesananTiket.html";
const CANCEL_LIMIT = 3; // pesanan tidak dapat dibatalkan mulai H-3 sebelum acara

const STATUS = {
  lunas: { label: "Lunas", badge: "badge--lunas", note: "note--lunas" },
  dibatalkan: {
    label: "Dibatalkan",
    badge: "badge--batal",
    note: "note--batal",
  },
};

let orders = seedOrders();
const state = { kategori: "semua", q: "", tanggal: "semua", urut: "terbaru" };
let activeOrder = null; // pesanan yang tiketnya sedang dibuka
let cancelTarget = null; // pesanan yang akan dibatalkan

// ---------- Helper ----------
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const GAMBAR_DEFAULT = "../acara/assets/image/IEC.jpg";
// Gambar acara: pakai o.gambar jika ada, kalau tidak pakai gambar kategori, lalu gambar bawaan
const gambarOf = (o) => o.gambar || GAMBAR_DEFAULT;

const daysUntil = (iso) => Math.round((parseISO(iso) - today()) / 86400000);
const canCancel = (o) =>
  o.status !== "dibatalkan" && daysUntil(o.iso) > CANCEL_LIMIT;
// Hari terakhir pembatalan = H-4 (karena mulai H-3 sudah ditutup)
const cancelDeadline = (o) => addDays(parseISO(o.iso), -(CANCEL_LIMIT + 1));

let toastTimer;
function toast(msg) {
  const $toast = $("#toast").text(msg).prop("hidden", false);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.prop("hidden", true), 3200);
}

// ---------- Filter & urutan ----------
function matches(o, ignoreKategori = false) {
  if (
    !ignoreKategori &&
    state.kategori !== "semua" &&
    o.kategori !== state.kategori
  )
    return false;

  const q = state.q.trim().toLowerCase();
  if (
    q &&
    !(o.acara.toLowerCase().includes(q) || o.kode.toLowerCase().includes(q))
  )
    return false;

  const d = daysUntil(o.iso);
  if (state.tanggal === "mendatang" && d < 0) return false;
  if (state.tanggal === "lewat" && d >= 0) return false;
  return true;
}

// ---------- Render ----------
function cardHTML(o) {
  const st = STATUS[o.status];
  const ev = parseISO(o.iso);
  const canc = canCancel(o);
  const kode = esc(o.kode);

  let note;
  if (o.status === "dibatalkan") {
    note =
      "Pesanan dibatalkan." +
      (o.metode ? "" : " Tidak ada pembayaran yang ditagihkan.");
  } else {
    const awal = "Pembayaran berhasil.";
    note = canc
      ? `${awal} Dapat dibatalkan sampai ${fmtShort(cancelDeadline(o))}.`
      : `${awal} Pembatalan ditutup sejak H-3 acara.`;
  }

  const aksiUtama =
    o.status === "dibatalkan"
      ? `<button type="button" class="btn btn--primary btn--sm" data-action="again" data-i="${orders.indexOf(o)}">Pesan lagi</button>`
      : `<button type="button" class="btn btn--primary btn--sm" data-action="cancel" data-i="${orders.indexOf(o)}"
         ${canc ? "" : 'disabled title="Pembatalan tidak tersedia mulai H-3 sebelum acara"'}>${o.simulasi ? "Batalkan" : "Pembatalan"}</button>`;

  return `
    <article class="order">
      <div class="order__head">
        <span>${kode} · Dipesan ${fmtShort(new Date(o.dipesan))}</span>
        <div class="order__badges">
          ${o.simulasi ? '<span class="badge badge--simulasi">Simulasi</span>' : ""}
          <span class="badge ${st.badge}">${st.label}</span>
        </div>
      </div>
      <div class="order__body">
        <img class="order__thumb" src="${esc(gambarOf(o))}" alt="Poster ${esc(o.acara)}" loading="lazy"
             onerror="this.onerror=null;this.src='${GAMBAR_DEFAULT}'">
        <div class="order__info">
          <p class="order__cat">${esc(o.kategori)}</p>
          <h3 class="order__title">${esc(o.acara)}</h3>
          <p class="order__meta">${fmtLong(ev)} · ${esc(o.kota)}</p>
          <p class="order__meta">${esc(o.jenis)} × ${o.jumlah}</p>
        </div>
        <div class="order__total">
          <span>Total pembayaran</span>
          <strong>${rupiah(o.total)}</strong>
        </div>
      </div>
      <div class="order__foot">
        <p class="order__note ${st.note}">${note}</p>
        <div class="order__actions">
          <button type="button" class="btn btn--outline btn--sm" data-action="detail" data-i="${orders.indexOf(o)}">Detail pesanan</button>
          ${aksiUtama}
        </div>
      </div>
    </article>`;
}

function render() {
  // Angka pada chip mengikuti pencarian & filter tanggal, bukan filter kategori
  const base = orders.filter((o) => matches(o, true));
  $("[data-count]").each(function () {
    const k = $(this).attr("data-count");
    $(this).text(
      k === "semua" ? base.length : base.filter((o) => o.kategori === k).length,
    );
  });

  const list = orders
    .filter((o) => matches(o))
    .sort((a, b) =>
      state.urut === "terbaru"
        ? new Date(b.dipesan) - new Date(a.dipesan)
        : new Date(a.dipesan) - new Date(b.dipesan),
    );

  $("#countText").text(`${list.length} pesanan`);
  $("#orderList").html(list.map(cardHTML).join(""));
  $("#empty").prop("hidden", list.length > 0);
}

// ---------- Detail pesanan = gambar tiket + QR ----------
async function openTicket(o) {
  activeOrder = o;
  $("#ticketSub").text(`${o.kode} · ${STATUS[o.status].label}`);
  await drawTicket(o);
  $("#ticketModal").prop("hidden", false);
  $("#btnDownload").trigger("focus");
}

function closeTicket() {
  $("#ticketModal").prop("hidden", true);
}

function downloadTicket() {
  const $link = $("<a>", {
    download: `Tiket-${activeOrder.kode}.png`,
    href: $("#ticketCanvas")[0].toDataURL("image/png"),
  }).appendTo("body");
  $link[0].click(); // klik asli diperlukan agar browser memulai unduhan
  $link.remove();
}

// ---------- Pembatalan ----------
function openCancel(o) {
  cancelTarget = o;
  const simulasi = o.simulasi ? "Ini hanya simulasi. " : "";
  $("#cancelText").text(
    `${simulasi}${o.acara} · ${fmtLong(parseISO(o.iso))} (${o.kode})`,
  );
  $("#cancelDeadline").text(fmtLong(cancelDeadline(o)));
  $("#cancelModal").prop("hidden", false);
  $("#cancelNo").trigger("focus");
}

function closeCancel() {
  $("#cancelModal").prop("hidden", true);
  cancelTarget = null;
}

function confirmCancel() {
  const o = cancelTarget;
  // Cek ulang aturan H-3 saat konfirmasi (misalnya popup dibiarkan terbuka lama)
  if (!o || !canCancel(o)) {
    closeCancel();
    render();
    toast("Pesanan ini sudah tidak dapat dibatalkan.");
    return;
  }
  o.status = "dibatalkan";
  o.dibatalkanPada = new Date().toISOString();
  closeCancel();
  render();
  toast(
    o.simulasi
      ? "Simulasi pembatalan berhasil."
      : `Pesanan ${o.kode} dibatalkan.`,
  );
}

function resetSimulation() {
  orders = [...seedOrders(), ...orders.filter((o) => !isSimulationOrder(o))];
  state.kategori = "semua";
  state.q = "";
  state.tanggal = "semua";
  state.urut = "terbaru";
  $("#q").val("");
  $("#tanggal").val("semua");
  $("#urut").val("terbaru");
  $(".chip").removeClass("is-active").attr("aria-pressed", "false");
  $('.chip[data-kategori="semua"]')
    .addClass("is-active")
    .attr("aria-pressed", "true");
  render();
  toast("Simulasi siap dicoba kembali.");
}

window.resetHistorySimulation = resetSimulation;

// ========= Event listener & inisialisasi =========
$(function () {
  // Tombol pada kartu pesanan 
  $("#orderList").on("click", "button[data-action]", function () {
    const $btn = $(this);
    const o = orders[Number($btn.attr("data-i"))];
    const aksi = $btn.attr("data-action");

    if (aksi === "detail" && o) openTicket(o);
    if (aksi === "cancel" && o && canCancel(o)) openCancel(o);
    if (aksi === "again" && o && o.acaraId) {
      window.location.href = `${HALAMAN_PESAN}?id=${encodeURIComponent(o.acaraId)}`;
    }
  });

  // Chip kategori
  $("#chips").on("click", ".chip", function () {
    state.kategori = $(this).attr("data-kategori");
    $(".chip").removeClass("is-active").attr("aria-pressed", "false");
    $(this).addClass("is-active").attr("aria-pressed", "true");
    render();
  });

  // Pencarian, filter tanggal, urutan
  $("#toolbar").on("submit", function (e) {
    e.preventDefault();
    state.q = $("#q").val();
    render();
  });
  $("#q").on("input", function () {
    state.q = $(this).val();
    render();
  });
  $("#tanggal").on("change", function () {
    state.tanggal = $(this).val();
    render();
  });
  $("#urut").on("change", function () {
    state.urut = $(this).val();
    render();
  });

  // Popup pembatalan
  $("#cancelNo").on("click", closeCancel);
  $("#cancelYes").on("click", confirmCancel);
  $("#cancelModal").on("click", function (e) {
    if (e.target === this) closeCancel();
  });

  // Popup tiket
  $("#btnDownload").on("click", downloadTicket);
  $("#ticketClose").on("click", closeTicket);
  $("#ticketModal").on("click", function (e) {
    if (e.target === this) closeTicket();
  });

  // Tombol Esc menutup popup
  $(document).on("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeCancel();
    closeTicket();
  });

  render();
});