// ===== Login & Daftar akun =====
// Data disimpan di localStorage 

// Username yang sedang login (kosong/null kalau belum login)
var akunAktif = localStorage.getItem("userAktif");
var targetLink = "";
var daftarAkun = JSON.parse(localStorage.getItem("daftarAkun") || "[]");

function protectedTarget(href) {
  try {
    var url = new URL(href, location.href);
    return url.origin === location.origin &&
      /\/(acara|history|about|pemesananTiket)(\/|$)/i.test(url.pathname)
      ? url.href
      : "";
  } catch (error) {
    return "";
  }
}

if (!akunAktif && protectedTarget(location.href)) {
  sessionStorage.setItem("loginTarget", location.href);
  location.replace("../home/index.html?login=required");
}

// ----- Pop Up-----
// Dibuat lewat JS supaya tidak perlu ditulis ulang di setiap halaman
var ikonMata = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
var ikonMataTertutup = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.4 1.8M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.4-1.8"/><path d="m3 3 18 18"/></svg>';
var htmlPopup = `
  <div class="popup-login" id="popupLogin" hidden>
    <div class="login-box" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
      <button type="button" class="tutup" id="tutupLogin" aria-label="Tutup">&times;</button>
      <form id="formLogin" novalidate>
        <h2 id="loginTitle">Login</h2>
        <p class="info">Masuk dulu untuk membuka fitur lainnya.</p>
        <label for="loginUser">Username</label><input type="text" id="loginUser" autocomplete="username">
        <label for="loginPass">Password</label>
        <div class="password-field">
          <input type="password" id="loginPass" autocomplete="current-password">
          <button type="button" class="password-toggle" data-password-toggle="loginPass" aria-controls="loginPass" aria-label="Tampilkan password" aria-pressed="false">${ikonMata}</button>
        </div>
        <p class="error" id="errLogin" role="alert"></p>
        <button type="submit">Masuk</button>
        <p class="ganti">Belum punya akun? <a href="#" id="keDaftar">Daftar</a></p>
      </form>
      <form id="formDaftar" novalidate hidden>
        <h2>Buat Akun</h2>
        <label for="dNama">Nama Lengkap</label><input type="text" id="dNama" autocomplete="name">
        <label for="dUser">Username Baru</label><input type="text" id="dUser" autocomplete="username">
        <label for="dLahir">Tanggal Lahir</label><input type="date" id="dLahir">
        <label for="dHp">Nomor HP</label><input type="tel" id="dHp" autocomplete="tel">
        <label for="dEmail">Email</label><input type="email" id="dEmail" autocomplete="email">
        <label for="dPass">Password</label>
        <div class="password-field">
          <input type="password" id="dPass" autocomplete="new-password">
          <button type="button" class="password-toggle" data-password-toggle="dPass" aria-controls="dPass" aria-label="Tampilkan password" aria-pressed="false">${ikonMata}</button>
        </div>
        <label for="dPass2">Verifikasi Password</label>
        <div class="password-field">
          <input type="password" id="dPass2" autocomplete="new-password">
          <button type="button" class="password-toggle" data-password-toggle="dPass2" aria-controls="dPass2" aria-label="Tampilkan password" aria-pressed="false">${ikonMata}</button>
        </div>
        <p class="error" id="errDaftar" role="alert"></p>
        <button type="submit">Daftar</button>
        <p class="ganti">Sudah punya akun? <a href="#" id="keLogin">Login</a></p>
      </form>
    </div>
  </div>`;

// Sama seperti $(function () {...}), ditulis jQuery supaya tidak bentrok
jQuery(function ($) {
  function bukaPopup() {
    $("#popupLogin").prop("hidden", false);
    $("#formLogin").prop("hidden", false);
    $("#formDaftar").prop("hidden", true);
    $("#loginUser").trigger("focus");
  }

  function tutupPopup() {
    $("#popupLogin").prop("hidden", true);
    $("#errLogin, #errDaftar").text("");
    targetLink = "";
  }

  function masuk(username) {
    localStorage.setItem("userAktif", username);
    akunAktif = username;
    $(".navbar_user span").first().text(username);
    var tujuan = targetLink;
    tutupPopup();
    if (tujuan) location.href = tujuan;
  }

  $("body").append(htmlPopup);
  if (akunAktif) $(".navbar_user span").first().text(akunAktif);

  var loginDiminta = new URLSearchParams(location.search).get("login") === "required";
  if (loginDiminta && !akunAktif) {
    targetLink = protectedTarget(sessionStorage.getItem("loginTarget") || "");
    sessionStorage.removeItem("loginTarget");
    bukaPopup();
  }

  $(document).on("click", "a", function (e) {
    var href = $(this).attr("href") || "";
    if (href.charAt(0) === "#") return;
    var tujuan = protectedTarget(href);
    if (!akunAktif && tujuan) {
      e.preventDefault();
      targetLink = tujuan;
      bukaPopup();
    }
  });

  $(".navbar_user").on("click", function () {
    if (!akunAktif) return bukaPopup();
    if (confirm("Keluar dari akun " + akunAktif + "?")) {
      localStorage.removeItem("userAktif");
      location.href = new URL("../home/index.html", location.href).href;
    }
  });

  $("#tutupLogin").on("click", tutupPopup);
  $("#popupLogin").on("click", function (e) {
    if (e.target === this) tutupPopup();
  });
  $("#keDaftar").on("click", function (e) {
    e.preventDefault();
    $("#errLogin").text("");
    $("#formLogin").prop("hidden", true);
    $("#formDaftar").prop("hidden", false);
    $("#dNama").trigger("focus");
  });
  $("#keLogin").on("click", function (e) {
    e.preventDefault();
    $("#errDaftar").text("");
    $("#formDaftar").prop("hidden", true);
    $("#formLogin").prop("hidden", false);
    $("#loginUser").trigger("focus");
  });
  $(".login-box input").on("input change", function () {
    $("#errLogin, #errDaftar").text("");
  });
  $(".login-box").on("click", "[data-password-toggle]", function () {
    var $button = $(this);
    var $input = $("#" + $button.attr("data-password-toggle"));
    var tampil = $input.attr("type") === "password";
    $input.attr("type", tampil ? "text" : "password");
    $button
      .html(tampil ? ikonMataTertutup : ikonMata)
      .attr("aria-label", tampil ? "Sembunyikan password" : "Tampilkan password")
      .attr("aria-pressed", String(tampil));
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && !$("#popupLogin").prop("hidden")) tutupPopup();
  });

  $("#formLogin").on("submit", function (e) {
    e.preventDefault();
    var user = $("#loginUser").val().trim();
    var pass = $("#loginPass").val();
    var akun = daftarAkun.find(function (item) {
      return item.username === user && item.password === pass;
    });

    if (!user || !pass) return $("#errLogin").text("Isi username dan password.");
    if (!akun) return $("#errLogin").text("Username atau password salah.");
    masuk(akun.username);
  });

  $("#formDaftar").on("submit", function (e) {
    e.preventDefault();
    var akun = {
      nama: $("#dNama").val().trim(),
      username: $("#dUser").val().trim(),
      lahir: $("#dLahir").val(),
      hp: $("#dHp").val().trim(),
      email: $("#dEmail").val().trim(),
      password: $("#dPass").val(),
    };
    var konfirmasi = $("#dPass2").val();
    var pesan = "";

    if (Object.values(akun).some(function (value) { return !value; }) || !konfirmasi) {
      pesan = "Semua data wajib diisi.";
    } else if (daftarAkun.some(function (item) { return item.username === akun.username; })) {
      pesan = "Username sudah dipakai.";
    } else if (!/^\d{10,13}$/.test(akun.hp)) {
      pesan = "Nomor HP harus 10-13 angka.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(akun.email)) {
      pesan = "Format email tidak benar.";
    } else if (akun.password.length < 6) {
      pesan = "Password minimal 6 karakter.";
    } else if (akun.password !== konfirmasi) {
      pesan = "Verifikasi password tidak sama.";
    }

    if (pesan) return $("#errDaftar").text(pesan);
    daftarAkun.push(akun);
    localStorage.setItem("daftarAkun", JSON.stringify(daftarAkun));
    masuk(akun.username);
  });
});