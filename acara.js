var HALAMAN_PESAN = "../pemesananTiket/pemesananTiket.html";

// Semua data data nya
var dataAcara = [
  {
    id: 1,
    nama: "From Campus To Career",
    tanggal: "2026-11-03",
    waktu: "09:00 WIB",
    lokasi: "Ruang Seminar, ITHB",
    kategori: "Seminar",
    harga: 5000,
    image: "assets/image/IEC.jpg",
    deskripsi:
      "Seminar yang membantu mahasiswa mempersiapkan diri melangkah dari dunia kampus ke dunia kerja, mulai dari membangun portofolio sampai strategi menghadapi proses rekrutmen.",
    jadwal: [
      { jam: "08:30", kegiatan: "Registrasi peserta" },
      { jam: "09:00", kegiatan: "Pembukaan" },
      { jam: "09:30", kegiatan: "Sesi materi" },
      { jam: "11:30", kegiatan: "Tanya jawab" },
      { jam: "12:00", kegiatan: "Penutupan" },
    ],
  },
  {
    id: 2,
    nama: "Knot n Craft",
    tanggal: "2026-10-16",
    waktu: "13:00 WIB",
    lokasi: "Institut Teknologi Harapan Bangsa",
    kategori: "Workshop",
    harga: 18000,
    image: "assets/image/Workshop.jpg",
    deskripsi:
      "Workshop kriya yang mengajak peserta membuat kerajinan tangan dari simpul tali. Semua bahan disediakan panitia, dan peserta membawa pulang hasil karyanya.",
    jadwal: [
      { jam: "12:30", kegiatan: "Registrasi peserta" },
      { jam: "13:00", kegiatan: "Pengenalan teknik simpul" },
      { jam: "14:00", kegiatan: "Praktik membuat kerajinan" },
      { jam: "15:30", kegiatan: "Sesi foto dan penutupan" },
    ],
  },
  {
    id: 3,
    nama: "The Carbon Bill",
    tanggal: "2026-10-24",
    waktu: "10:00 WIB",
    lokasi: "Aula, ITHB",
    kategori: "Seminar",
    harga: 0,
    image: "assets/image/Akuntan.jpg",
    deskripsi:
      "Seminar tentang kebijakan karbon dan dampaknya bagi dunia akuntansi, bisnis, dan energi. Terbuka untuk umum tanpa biaya.",
    jadwal: [
      { jam: "09:30", kegiatan: "Registrasi peserta" },
      { jam: "10:00", kegiatan: "Pembukaan" },
      { jam: "10:15", kegiatan: "Pemaparan materi" },
      { jam: "11:45", kegiatan: "Tanya jawab" },
      { jam: "12:15", kegiatan: "Penutupan" },
    ],
  },
];

var kategoriAktif = "Semua";

function tampilkan() {
  var kata = ($("#searchInput").val() || "").toLowerCase();
  var tgl = $("#tanggal").val();
  var urutan = $("#sortHarga").val();

  var hasil = dataAcara.filter(function (a) {
    var cocokKategori =
      kategoriAktif === "Semua" || a.kategori === kategoriAktif;
    var cocokKata = a.nama.toLowerCase().includes(kata);
    var cocokTanggal = tgl === "" || a.tanggal === tgl;
    return cocokKategori && cocokKata && cocokTanggal;
  });

  if (urutan === "termurah") {
    hasil.sort(function (x, y) {
      return x.harga - y.harga;
    });
  } else if (urutan === "termahal") {
    hasil.sort(function (x, y) {
      return y.harga - x.harga;
    });
  }

  $("#daftarAcara .card").remove();
  hasil.forEach(function (a, i) {
    var warna = i % 2 === 1 ? " t2" : "";
    $("#daftarAcara").append(
      '<article class="card">' +
        '<div class="thumb' +
        warna +
        '" style="background-image: url(\'' +
        a.image +
        "'); background-size: cover; background-position: center;\"></div>" +
        '<div class="body">' +
        '<span class="badge">' +
        a.kategori +
        "</span>" +
        "<h3>" +
        a.nama +
        "</h3>" +
        '<p class="meta">' +
        a.tanggal +
        " &bull; " +
        a.lokasi +
        "</p>" +
        '<div class="foot">' +
        '<span class="price">' +
        (a.harga === 0
          ? "Free Entry"
          : "Rp" + a.harga.toLocaleString("id-ID")) +
        "</span>" +
        '<button type="button" class="btn-sm btn-detail" data-id="' +
        a.id +
        '">Detail</button>' +
        "</div>" +
        "</div>" +
        "</article>",
    );
  });

  $("#EmptyState").toggle(hasil.length === 0);
  $("#resultPencarian").text(hasil.length + " acara ditemukan");
}

// ============ Popup detail acara ============
var BULAN = [
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
var pemicuPopup = null; // tombol Detail yang membuka popup, supaya fokus bisa dikembalikan saat ditutup

function formatTanggal(iso) {
  var p = iso.split("-");
  return p[2] + " " + BULAN[parseInt(p[1], 10) - 1] + " " + p[0];
}

function esc(teks) {
  return $("<div>").text(teks).html(); // jQuery meng-escape karakter HTML
}

function bukaPopup(id, pemicu) {
  var a = dataAcara.filter(function (x) {
    return x.id === id;
  })[0];
  if (!a) return;
  pemicuPopup = pemicu;

  var tanggal = formatTanggal(a.tanggal);
  var harga =
    a.harga === 0 ? "Free Entry" : "Rp" + a.harga.toLocaleString("id-ID");

  $("#popupBanner").css("background-image", "url('" + a.image + "')");
  $("#popupKategori").text(a.kategori);
  $("#popupJudul").text(a.nama);
  $("#popupTanggal, #popupTanggal2").text(tanggal);
  $("#popupWaktu").text(a.waktu);
  $("#popupLokasi, #popupLokasi2").text(a.lokasi);
  $("#popupDeskripsi").text(a.deskripsi);
  $("#popupJadwal").html(
    a.jadwal
      .map(function (j) {
        return (
          '<li><span class="jam">' +
          esc(j.jam) +
          "</span><span>" +
          esc(j.kegiatan) +
          "</span></li>"
        );
      })
      .join(""),
  );
  $("#popupHarga").text(harga);
  $("#popupHargaLabel").prop("hidden", a.harga === 0);
  $("#popupPesan").attr("href", HALAMAN_PESAN + "?id=" + a.id);

  $("#popupAcara").prop("hidden", false).scrollTop(0);
  $(".popup-box").scrollTop(0);
  $("body").addClass("no-scroll");
  $("#popupTutup").trigger("focus");
}

function tutupPopup() {
  $("#popupAcara").prop("hidden", true);
  $("body").removeClass("no-scroll");
  if (pemicuPopup) $(pemicuPopup).trigger("focus");
  pemicuPopup = null;
}

$(function () {
  $(".tab").on("click", function () {
    $(".tab").removeClass("active");
    $(this).addClass("active");
    var tab = $(this).data("tab");
    kategoriAktif =
      tab === "semua" ? "Semua" : tab === "seminar" ? "Seminar" : "Workshop";
    tampilkan();
  });

  $("#search-btn").on("click", tampilkan);
  $("#searchInput").on("keyup", tampilkan);
  $("#tanggal, #sortHarga").on("change", tampilkan);

  // Popup: buka lewat tombol Detail 
  $("#daftarAcara").on("click", ".btn-detail", function () {
    bukaPopup(Number($(this).attr("data-id")), this);
  });

  // Popup: tutup lewat tombol X, tombol Kembali, klik area gelap, atau tombol Esc
  $("#popupTutup, #popupKembali").on("click", tutupPopup);
  $("#popupAcara").on("click", function (e) {
    if (e.target === this) tutupPopup();
  });
  $(document).on("keydown", function (e) {
    if ($("#popupAcara").prop("hidden")) return;
    if (e.key === "Escape") {
      tutupPopup();
      return;
    }
    if (e.key === "Tab") {
      // fokus keyboard tetap didalam popup
      var $fokus = $("#popupAcara").find("button, a[href]").filter(":visible");
      var pertama = $fokus.first()[0],
        terakhir = $fokus.last()[0];
      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    }
  });

  tampilkan();
});
