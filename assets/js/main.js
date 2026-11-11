/* Gomes Engenharia — modelo 2: comportamento e animações.
   Usa GSAP + ScrollTrigger (cdnjs) para a rolagem horizontal, a frase que acende e a faixa que inclina.
   Se o GSAP não carregar, todo o conteúdo continua visível e funcional. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var WHATS = "5519989090391";

  if (temGsap) gsap.registerPlugin(ScrollTrigger);
  if (ponteiroFino) doc.classList.add("cursor-on");

  var ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- abertura ---------- */
  var abriu = false, t0 = Date.now();
  function abrir() {
    if (abriu) return;
    abriu = true;
    setTimeout(function () {
      doc.classList.add("abriu");
      setTimeout(function () { var a = $("#abertura"); if (a) a.remove(); }, 1100);
      if (temGsap) ScrollTrigger.refresh();
    }, Math.max(0, 1150 - (Date.now() - t0)));
  }
  if (document.readyState === "complete") abrir(); else window.addEventListener("load", abrir);
  setTimeout(abrir, 2600); // nunca segura o visitante mais que isso

  /* ---------- topo: fundo ao rolar, some ao descer, volta ao subir ---------- */
  var topo = $("#topo"), barraProg = $("#progresso"), ultimoY = 0, menuAberto = false;
  function aoRolar() {
    var y = window.scrollY, max = doc.scrollHeight - window.innerHeight;
    topo.classList.toggle("rolou", y > 20);
    if (!menuAberto) {
      if (y > 400 && y > ultimoY + 6) topo.classList.add("escondido");
      else if (y < ultimoY - 6 || y < 400) topo.classList.remove("escondido");
    }
    ultimoY = y;
    if (barraProg) barraProg.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* rolagem suave nos links internos */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    var alvo = id.length > 1 && document.getElementById(id.slice(1));
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", id);
  });

  /* link ativo no menu */
  var linksNav = $$(".nav a");
  if ("IntersectionObserver" in window) {
    var obsSecao = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        linksNav.forEach(function (a) { a.classList.toggle("ativo", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["sobre", "servicos", "projetos", "clientes", "contato"].forEach(function (id) { var s = document.getElementById(id); if (s) obsSecao.observe(s); });
  }

  /* ---------- menu do celular ---------- */
  var menuBtn = $("#menu-btn"), menu = $("#menu-cheio");
  function abrirMenu(abre) {
    menuAberto = abre;
    menuBtn.setAttribute("aria-expanded", abre);
    $(".sr", menuBtn).textContent = abre ? "Fechar menu" : "Abrir menu";
    doc.classList.toggle("menu-aberto", abre);
    document.body.classList.toggle("travado", abre);
    if (abre) {
      menu.hidden = false;
      topo.classList.remove("escondido");
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("aberto"); }); });
    } else {
      menu.classList.remove("aberto");
      setTimeout(function () { if (!menuAberto) menu.hidden = true; }, 700);
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { abrirMenu(!menuAberto); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { abrirMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuAberto) { abrirMenu(false); menuBtn.focus(); } });
    window.addEventListener("resize", function () { if (menuAberto && window.innerWidth > 1080) abrirMenu(false); });
  }

  /* ---------- luz do início acompanha o mouse ---------- */
  var luz = $("#hero-luz");
  if (luz && ponteiroFino && temGsap) {
    var luzX = gsap.quickTo(luz, "x", { duration: 1.6, ease: "power3" });
    var luzY = gsap.quickTo(luz, "y", { duration: 1.6, ease: "power3" });
    $(".hero").addEventListener("mousemove", function (e) {
      luzX(e.clientX - luz.offsetWidth / 2);
      luzY(e.clientY - luz.offsetHeight / 2);
    });
  }

  /* ---------- três painéis: trocam sozinhos e abrem ao passar o mouse ou tocar ---------- */
  var caixaPaineis = $("#paineis"), paineis = $$(".painel"), atual = 0, relogio = null, pausado = false, visivel = true;
  function ativar(i) {
    if (i === atual) return;
    paineis[atual].classList.remove("is-ativo");
    atual = i;
    paineis[atual].classList.add("is-ativo");
  }
  function tocar() {
    clearInterval(relogio);
    relogio = setInterval(function () { if (!pausado && visivel) ativar((atual + 1) % paineis.length); }, 5500);
  }
  if (paineis.length) {
    paineis.forEach(function (p, i) {
      p.addEventListener("mouseenter", function () { if (ponteiroFino) { pausado = true; caixaPaineis.classList.add("pausado"); ativar(i); } });
      p.addEventListener("focusin", function () { ativar(i); });
      p.addEventListener("click", function (e) {
        if (i !== atual) { e.preventDefault(); ativar(i); tocar(); }
      });
    });
    caixaPaineis.addEventListener("mouseleave", function () { pausado = false; caixaPaineis.classList.remove("pausado"); tocar(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }).observe(caixaPaineis);
    }
    tocar();
  }

  /* ---------- surgir ao rolar ---------- */
  var revelaveis = $$("[data-revela]");
  // atraso em cascata para itens irmãos
  revelaveis.forEach(function (el) {
    var irmaos = $$(":scope > [data-revela]", el.parentElement);
    var k = irmaos.indexOf(el);
    if (k > 0) el.style.setProperty("--atraso", Math.min(k, 6) * 0.08 + "s");
  });
  if ("IntersectionObserver" in window) {
    var obsRevela = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("revelado"); obsRevela.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revelaveis.forEach(function (el) { obsRevela.observe(el); });
  } else {
    revelaveis.forEach(function (el) { el.classList.add("revelado"); });
  }

  /* ---------- números em odômetro ---------- */
  $$(".odo").forEach(function (el) {
    var texto = el.textContent.trim();
    el.textContent = "";
    var leitor = document.createElement("span");
    leitor.className = "sr";
    leitor.textContent = texto;
    el.appendChild(leitor);
    texto.split("").forEach(function (ch, k) {
      if (/\d/.test(ch)) {
        var col = document.createElement("span"), faixa = document.createElement("span");
        col.className = "odo-col"; col.setAttribute("aria-hidden", "true");
        faixa.className = "odo-faixa";
        for (var v = 0; v < 20; v++) { var d = document.createElement("span"); d.textContent = v % 10; faixa.appendChild(d); }
        faixa.setAttribute("data-alvo", 10 + Number(ch));
        faixa.style.transitionDelay = (k * 0.12) + "s";
        col.appendChild(faixa); el.appendChild(col);
      } else {
        var s = document.createElement("span"); s.setAttribute("aria-hidden", "true"); s.textContent = ch;
        if (ch === "+") s.style.color = "var(--verde)";
        el.appendChild(s);
      }
    });
  });
  function girarOdometros(alvo) {
    $$(".odo-faixa", alvo).forEach(function (f) { f.style.transform = "translateY(-" + f.getAttribute("data-alvo") + "em)"; });
  }
  if ("IntersectionObserver" in window) {
    var obsOdo = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { girarOdometros(e.target); obsOdo.unobserve(e.target); } });
    }, { threshold: .5 });
    $$(".numero").forEach(function (n) { obsOdo.observe(n); });
  } else { girarOdometros(document); }

  /* ---------- títulos em linhas que sobem (chamada) ---------- */
  var chamadaTitulo = $(".chamada-titulo");
  if (chamadaTitulo && "IntersectionObserver" in window) {
    var obsCh = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { chamadaTitulo.classList.add("visivel"); obsCh.disconnect(); }
    }, { threshold: .35 });
    obsCh.observe(chamadaTitulo);
  } else if (chamadaTitulo) { chamadaTitulo.classList.add("visivel"); }

  /* ---------- serviços: abrir e fechar ---------- */
  $$(".servico-cab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest(".servico");
      var abre = !li.classList.contains("aberto");
      li.classList.toggle("aberto", abre);
      btn.setAttribute("aria-expanded", abre);
      if (temGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 650);
    });
  });

  /* imagem que acompanha o mouse sobre a lista de serviços */
  var flut = $("#flutuante"), lista = $("#servicos-lista");
  if (flut && lista && ponteiroFino && temGsap) {
    var flutImg = $("img", flut);
    var fx = gsap.quickTo(flut, "x", { duration: .55, ease: "power3" });
    var fy = gsap.quickTo(flut, "y", { duration: .55, ease: "power3" });
    $$(".servico").forEach(function (li) {
      var pre = new Image(); pre.src = li.getAttribute("data-img");
      li.addEventListener("mouseenter", function () {
        flutImg.src = li.getAttribute("data-img");
        flut.classList.add("ativo");
      });
    });
    lista.addEventListener("mousemove", function (e) {
      var x = e.clientX + 36;
      if (x + flut.offsetWidth > window.innerWidth - 16) x = e.clientX - flut.offsetWidth - 36;
      fx(x); fy(e.clientY - flut.offsetHeight / 2);
    });
    lista.addEventListener("mouseleave", function () { flut.classList.remove("ativo"); });
  }

  /* ---------- clientes: luz acompanha o mouse ---------- */
  var logos = $("#logos");
  if (logos && ponteiroFino) {
    logos.addEventListener("mousemove", function (e) {
      var r = logos.getBoundingClientRect();
      logos.style.setProperty("--x", (e.clientX - r.left) + "px");
      logos.style.setProperty("--y", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- botões magnéticos ---------- */
  if (ponteiroFino) {
    $$(".magnetico").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * .3, dy = (e.clientY - r.top - r.height / 2) * .35;
        el.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "";
        setTimeout(function () { el.style.transition = ""; }, 600);
      });
    });
  }

  /* ---------- cursor ---------- */
  var cursor = $("#cursor"), cursorTexto = $("#cursor-texto");
  if (cursor && ponteiroFino) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, px = cx, py = cy;
    window.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
    (function seguir() {
      px += (cx - px) * .2; py += (cy - py) * .2;
      cursor.style.transform = "translate(" + px + "px," + py + "px)";
      requestAnimationFrame(seguir);
    })();
    document.addEventListener("mouseover", function (e) {
      var alvo = e.target.closest("[data-cursor], a, button, input, select, textarea, label");
      var rot = alvo && alvo.getAttribute("data-cursor");
      cursor.classList.toggle("com-texto", !!rot);
      cursor.classList.toggle("grande", !!alvo && !rot);
      cursorTexto.textContent = rot || "";
    });
    document.addEventListener("mouseleave", function () { cursor.style.opacity = 0; });
    document.addEventListener("mouseenter", function () { cursor.style.opacity = 1; });
  }

  /* ---------- animações que dependem da rolagem (GSAP) ---------- */
  if (temGsap) {
    /* faixa de texto inclina conforme a velocidade da rolagem */
    var inclina = { v: 0 }, aplicar = gsap.quickSetter(".trilho", "skewX", "deg"), limite = gsap.utils.clamp(-12, 12);
    ScrollTrigger.create({
      onUpdate: function (self) {
        var v = limite(self.getVelocity() / -320);
        if (Math.abs(v) > Math.abs(inclina.v)) {
          inclina.v = v;
          gsap.to(inclina, { v: 0, duration: .9, ease: "power3", overwrite: true, onUpdate: function () { aplicar(inclina.v); } });
        }
      }
    });

    /* luz de fundo e grade do início se afastam ao rolar */
    gsap.to(".hero-grade", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    /* frase do "sobre" acende palavra por palavra */
    var frase = $("#frase");
    if (frase) {
      var pecas = [];
      Array.prototype.slice.call(frase.childNodes).forEach(function (no) {
        if (no.nodeType === 3) {
          no.textContent.split(/(\s+)/).forEach(function (pedaco) {
            if (!pedaco) return;
            if (/^\s+$/.test(pedaco)) { pecas.push(document.createTextNode(pedaco)); return; }
            var s = document.createElement("span"); s.className = "palavra"; s.textContent = pedaco; pecas.push(s);
          });
        } else {
          no.classList.add("palavra"); pecas.push(no);
        }
      });
      frase.textContent = "";
      pecas.forEach(function (p) { frase.appendChild(p); });
      gsap.fromTo($$(".palavra", frase), { opacity: .15 }, {
        opacity: 1, stagger: .08, ease: "none",
        scrollTrigger: { trigger: frase, start: "top 85%", end: "bottom 50%", scrub: true }
      });
    }

    /* foto do "sobre" abre como uma janela e a imagem desliza por dentro */
    gsap.fromTo(".sobre-foto", { clipPath: "inset(14% 10% 14% 10% round 18px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 18px)", ease: "none",
      scrollTrigger: { trigger: ".sobre-foto", start: "top 90%", end: "top 35%", scrub: true }
    });
    gsap.fromTo(".sobre-foto img", { yPercent: -10 }, {
      yPercent: 0, ease: "none", scrollTrigger: { trigger: ".sobre", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* fundo da chamada em parallax */
    gsap.fromTo(".chamada-fundo", { yPercent: -10 }, {
      yPercent: 10, ease: "none", scrollTrigger: { trigger: ".chamada", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* projetos: rolagem horizontal presa na tela (só no computador) */
    var trilho = $("#trilho"), barraProj = $("#proj-barra"), contAtual = $("#proj-atual"), cards = $$(".card", trilho);
    var marcarCard = function (prog) {
      var n = Math.min(cards.length - 1, Math.round(prog * (cards.length - 1)));
      if (n > 10) n = 10; // o último é o convite, conta até 11 projetos
      contAtual.textContent = String(n + 1).padStart(2, "0");
    };
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var distancia = function () { return Math.max(0, trilho.scrollWidth - doc.clientWidth); };
      var anim = gsap.to(trilho, {
        x: function () { return -distancia(); }, ease: "none",
        scrollTrigger: {
          trigger: "#projetos", start: "top top", end: function () { return "+=" + distancia(); },
          pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { barraProj.style.transform = "scaleX(" + self.progress + ")"; marcarCard(self.progress); }
        }
      });
      cards.forEach(function (card) {
        var img = $(".card-capa img", card);
        if (!img) return;
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: anim, start: "left right", end: "right left", scrub: true }
        });
      });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* projetos no celular: contador e barra seguem o deslizar */
  var trilhoCel = $("#trilho");
  if (trilhoCel) {
    trilhoCel.addEventListener("scroll", function () {
      if (window.innerWidth >= 900) return;
      var max = trilhoCel.scrollWidth - trilhoCel.clientWidth, prog = max > 0 ? trilhoCel.scrollLeft / max : 0;
      $("#proj-barra").style.transform = "scaleX(" + prog + ")";
      var total = $$(".card", trilhoCel).length;
      var n = Math.min(10, Math.round(prog * (total - 1)));
      $("#proj-atual").textContent = String(n + 1).padStart(2, "0");
    }, { passive: true });
  }

  /* ---------- galeria de fotos ---------- */
  var lb = $("#lb"), lbImg = $("#lb-img"), lbTitulo = $("#lb-titulo"), lbCont = $("#lb-cont"), lbMinis = $("#lb-minis");
  var galeria = null, foto = 0, focoAntes = null;
  function mostrarFoto(i) {
    var n = galeria.fotos.length;
    foto = (i + n) % n;
    var f = galeria.fotos[foto];
    lbImg.classList.add("trocando");
    var nova = new Image();
    nova.onload = nova.onerror = function () {
      lbImg.src = f.src; lbImg.width = f.w; lbImg.height = f.h;
      lbImg.alt = galeria.titulo + ", foto " + (foto + 1) + " de " + n;
      lbImg.classList.remove("trocando");
    };
    nova.src = f.src;
    lbCont.textContent = (foto + 1) + " / " + n;
    $$("button", lbMinis).forEach(function (b, k) { b.classList.toggle("ativo", k === foto); if (k === foto) b.scrollIntoView({ block: "nearest", inline: "center" }); });
    var prox = new Image(); prox.src = galeria.fotos[(foto + 1) % n].src;
  }
  function abrirGaleria(chave) {
    galeria = window.GALERIAS && window.GALERIAS[chave];
    if (!galeria) return;
    focoAntes = document.activeElement;
    lbTitulo.textContent = galeria.titulo;
    lbMinis.textContent = "";
    galeria.fotos.forEach(function (f, k) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Foto " + (k + 1));
      var im = document.createElement("img"); im.src = f.src; im.alt = ""; im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function () { mostrarFoto(k); });
      lbMinis.appendChild(b);
    });
    lb.hidden = false;
    document.body.classList.add("travado");
    requestAnimationFrame(function () { lb.classList.add("aberto"); });
    mostrarFoto(0);
    $("#lb-fechar").focus();
  }
  function fecharGaleria() {
    lb.classList.remove("aberto");
    document.body.classList.remove("travado");
    setTimeout(function () { lb.hidden = true; lbImg.removeAttribute("src"); }, 300);
    if (focoAntes) focoAntes.focus();
  }
  $$("[data-galeria]").forEach(function (b) { b.addEventListener("click", function () { abrirGaleria(b.getAttribute("data-galeria")); }); });
  if (lb) {
    $("#lb-fechar").addEventListener("click", fecharGaleria);
    $("#lb-ant").addEventListener("click", function () { mostrarFoto(foto - 1); });
    $("#lb-prox").addEventListener("click", function () { mostrarFoto(foto + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target === $("#lb-palco")) fecharGaleria(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") fecharGaleria();
      else if (e.key === "ArrowLeft") mostrarFoto(foto - 1);
      else if (e.key === "ArrowRight") mostrarFoto(foto + 1);
      else if (e.key === "Tab") {
        var foc = $$("button", lb).filter(function (b) { return b.offsetParent !== null; });
        var i = foc.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); foc[foc.length - 1].focus(); }
        else if (!e.shiftKey && i === foc.length - 1) { e.preventDefault(); foc[0].focus(); }
      }
    });
    var toqueX = null;
    $("#lb-palco").addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    $("#lb-palco").addEventListener("touchend", function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 45) mostrarFoto(foto + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
  }

  /* ---------- formulário → WhatsApp ---------- */
  var form = $("#form"), erro = $("#form-erro");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim(), msg = form.mensagem.value.trim();
      if (!nome || !msg) { erro.hidden = false; (nome ? form.mensagem : form.nome).focus(); return; }
      erro.hidden = true;
      var seg = (form.querySelector("input[name=segmento]:checked") || {}).value || "";
      var texto = "Olá! Meu nome é " + nome + (form.empresa.value.trim() ? ", da " + form.empresa.value.trim() : "") + ".\n" +
        "Segmento: " + seg + "\nServiço: " + form.servico.value + "\n\n" + msg;
      window.open("https://wa.me/" + WHATS + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }
})();
